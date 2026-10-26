import { Router } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validateProductCategory } from './categories.js';
const router = Router();
function normaliseVariants(payload) {
  const enableSizes = payload.enableSizes !== false;
  const enableColors = payload.enableColors !== false;
  const variants = Array.isArray(payload.variants) ? payload.variants.map(item => ({
    ...item,
    size: enableSizes ? String(item.size || '').trim() : '',
    color: enableColors ? String(item.color || '').trim() : '',
    price: Number(item.price ?? payload.price),
    stock: Number(item.stock),
    isActive: item.isActive !== false,
  })) : [];
  const combinations = new Set();
  for (const variant of variants) {
    if (!Number.isFinite(variant.price) || variant.price < 0 || !Number.isInteger(variant.stock) || variant.stock < 0) {
      throw new Error('Each variant must have a valid non-negative price and whole-number stock.');
    }
    const key = `${variant.size}|${variant.color}`;
    if (combinations.has(key)) throw new Error('Variant combinations must be unique.');
    combinations.add(key);
  }
  return {
    ...payload,
    enableSizes,
    enableColors,
    sizes: enableSizes ? [...new Set((payload.sizes || []).map(String).map(value => value.trim()).filter(Boolean))] : [],
    colors: enableColors ? [...new Set((payload.colors || []).map(String).map(value => value.trim()).filter(Boolean))] : [],
    variants,
  };
}
router.get('/', async (req, res, next) => {
  try {
    const { search, category, subcategory, sort, featured, page = 1, limit = 24 } = req.query;
    const filter = { isActive: { $ne: false } };
    if (category && category !== 'All') filter.category = { $regex: `^${escapeRegex(decodeURIComponent(category))}$`, $options: 'i' };
    if (subcategory) filter.subcategory = { $regex: `^${escapeRegex(decodeURIComponent(subcategory))}$`, $options: 'i' };
    if (featured === 'true') filter.featured = true;
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }, { category: { $regex: search, $options: 'i' } }, { subcategory: { $regex: search, $options: 'i' } }, { brand: { $regex: search, $options: 'i' } }, { tags: { $regex: search, $options: 'i' } }];
    const sortMap = { priceAsc: { price: 1 }, priceDesc: { price: -1 }, rating: { rating: -1 }, newest: { createdAt: -1 }, bestseller: { bestseller: -1, rating: -1 } };
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(48, Math.max(1, Number(limit) || 24));
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortMap[sort] || { featured: -1, createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit),
      Product.countDocuments(filter)
    ]);
    res.json({ products, pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) } });
  } catch (e) { next(e); }
});
router.get('/admin', protect, adminOnly, async (req, res, next) => {
  try {
    const { search, category, subcategory, stock, status, page = 1, limit = 24 } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (stock === 'low') filter.stock = { $gt: 0, $lt: 5 };
    if (stock === 'out') filter.stock = 0;
    if (stock === 'in') filter.stock = { $gt: 0 };
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (search) filter.$or = [
      { name: { $regex: escapeRegex(String(search)), $options: 'i' } },
      { category: { $regex: escapeRegex(String(search)), $options: 'i' } },
      { subcategory: { $regex: escapeRegex(String(search)), $options: 'i' } },
      { sku: { $regex: escapeRegex(String(search)), $options: 'i' } },
    ];
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 24));
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ updatedAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit),
      Product.countDocuments(filter),
    ]);
    res.json({ products, pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) } });
  } catch (e) { next(e); }
});
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const value = decodeURIComponent(req.params.idOrSlug);
    const query = mongoose.isValidObjectId(value) ? { $or: [{ _id: value }, { slug: value }] } : { slug: value };
    const p = await Product.findOne(query);
    if (!p) return res.status(404).json({ message: 'Product not found.' });
    res.json(p);
  } catch (e) { next(e); }
});
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const payload = normaliseVariants({ ...req.body, price: Number(req.body.price), stock: Number(req.body.stock) });
    if (!payload.name?.trim() || !payload.category || !payload.image || !Number.isFinite(payload.price) || payload.price < 0 || !Number.isInteger(payload.stock) || payload.stock < 0) {
      return res.status(400).json({ message: 'Name, category, image, price, and a valid stock quantity are required.' });
    }
    if (!await validateProductCategory(payload.category, payload.subcategory)) return res.status(400).json({ message: 'Select a valid category and subcategory combination.' });
    res.status(201).json(await Product.create(payload));
  } catch (e) { if (e.message?.startsWith('Each variant') || e.message?.startsWith('Variant combinations')) return res.status(400).json({ message: e.message }); next(e); }
});
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const payload = normaliseVariants({ ...req.body, price: Number(req.body.price), stock: Number(req.body.stock) });
    if (!await validateProductCategory(payload.category, payload.subcategory)) return res.status(400).json({ message: 'Select a valid category and subcategory combination.' });
    const p = await Product.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ message: 'Product not found.' });
    res.json(p);
  } catch (e) { if (e.message?.startsWith('Each variant') || e.message?.startsWith('Variant combinations')) return res.status(400).json({ message: e.message }); next(e); }
});
router.delete('/:id', protect, adminOnly, async (req, res, next) => { try { const p = await Product.findByIdAndDelete(req.params.id); if (!p) return res.status(404).json({ message: 'Product not found.' }); res.json({ message: 'Product deleted.' }); } catch (e) { next(e); } });
export default router;
