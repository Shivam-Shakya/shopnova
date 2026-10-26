import { Router } from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const rows = await Category.find({ isActive: { $ne: false } }).sort({ name: 1 }).lean();
    const counts = await Product.aggregate([{ $match: { isActive: { $ne: false } } }, { $group: { _id: '$category', productCount: { $sum: 1 } } }]);
    const countMap = new Map(counts.map(row => [row._id, row.productCount]));
    res.json(rows.map(row => ({ ...row, id: row._id, productCount: countMap.get(row.name) || 0, subcategoryCount: row.subcategories.length })));
  } catch (e) {
    next(e);
  }
});

export async function validateProductCategory(category, subcategory) {
  if (!category) return false;
  const record = await Category.findOne({ name: category, isActive: { $ne: false } }).lean();
  if (!record) return false;
  return !subcategory || record.subcategories.some(item => item.name === subcategory);
}

router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Category name is required.' });
    const category = await Category.create({
      name,
      slug: req.body.slug?.trim() || slugify(name),
      description: req.body.description || '',
      image: req.body.image || '',
      subcategories: [],
    });
    res.status(201).json({ ...category.toObject(), id: category._id });
  } catch (e) { next(e); }
});

router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    const oldName = category.name;
    const name = String(req.body.name || category.name).trim();
    category.name = name;
    category.slug = req.body.slug?.trim() || slugify(name);
    category.description = req.body.description ?? category.description;
    category.image = req.body.image ?? category.image;
    if (Array.isArray(req.body.subcategories)) {
      category.subcategories = req.body.subcategories
        .map(item => typeof item === 'string' ? { name: item, slug: slugify(item) } : item)
        .filter(item => item.name?.trim())
        .map(item => ({ ...item, name: item.name.trim(), slug: item.slug?.trim() || slugify(item.name) }));
    }
    await category.save();
    if (oldName !== name) await Product.updateMany({ category: oldName }, { $set: { category: name } });
    res.json({ ...category.toObject(), id: category._id });
  } catch (e) { next(e); }
});

router.post('/:id/subcategories', protect, adminOnly, async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    const name = String(req.body.name || '').trim();
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    if (!name) return res.status(400).json({ message: 'Subcategory name is required.' });
    if (category.subcategories.some(item => item.name.toLowerCase() === name.toLowerCase())) return res.status(409).json({ message: 'Subcategory already exists.' });
    category.subcategories.push({ name, slug: req.body.slug?.trim() || slugify(name) });
    await category.save();
    res.status(201).json({ ...category.toObject(), id: category._id });
  } catch (e) { next(e); }
});

router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    if (await Product.exists({ category: category.name })) return res.status(409).json({ message: 'Reassign or delete products before deleting this category.' });
    await category.deleteOne();
    res.json({ message: 'Category deleted.' });
  } catch (e) { next(e); }
});

router.put('/:id/subcategories/:subcategoryId', protect, adminOnly, async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    const subcategory = category?.subcategories.id(req.params.subcategoryId);
    const name = String(req.body.name || '').trim();
    if (!category || !subcategory) return res.status(404).json({ message: 'Subcategory not found.' });
    if (!name) return res.status(400).json({ message: 'Subcategory name is required.' });
    const oldName = subcategory.name;
    subcategory.name = name;
    subcategory.slug = req.body.slug?.trim() || slugify(name);
    await category.save();
    if (oldName !== name) await Product.updateMany({ category: category.name, subcategory: oldName }, { $set: { subcategory: name } });
    res.json({ ...category.toObject(), id: category._id });
  } catch (e) { next(e); }
});

router.delete('/:id/subcategories/:subcategoryId', protect, adminOnly, async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    const subcategory = category.subcategories.id(req.params.subcategoryId);
    if (!subcategory) return res.status(404).json({ message: 'Subcategory not found.' });
    if (await Product.exists({ category: category.name, subcategory: subcategory.name })) return res.status(409).json({ message: 'Reassign or delete products before deleting this subcategory.' });
    subcategory.deleteOne();
    await category.save();
    res.json({ message: 'Subcategory deleted.' });
  } catch (e) { next(e); }
});

function slugify(value) {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default router;
