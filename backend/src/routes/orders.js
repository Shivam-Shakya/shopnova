import { Router } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router = Router();

router.post('/', protect, async (req, res, next) => {
  try {
    const { items, shipping, paymentMethod = 'Cash on delivery (demo)' } = req.body;
    const required = ['name', 'email', 'phone', 'address', 'city', 'state', 'postalCode', 'country'];
    
    if (!Array.isArray(items) || !items.length || !shipping || required.some(field => !String(shipping[field] || '').trim())) {
        return res.status(400).json({ message: 'Complete all delivery details before placing the order.' });
    }
    if (!/^[+]?[0-9\s-]{8,15}$/.test(shipping.phone)) return res.status(400).json({ message: 'Enter a valid phone number.' });
    if (!/^[a-zA-Z0-9\s-]{3,10}$/.test(shipping.postalCode)) return res.status(400).json({ message: 'Enter a valid postal code.' });
    if (paymentMethod !== 'Cash on delivery (demo)') return res.status(400).json({ message: 'Only demo cash on delivery is available.' });

    console.log("Frontend Items: ", items);
    
    let total = 0; 
    const normalized = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      const quantity = Math.floor(Number(item.quantity));
      if (!product || !Number.isFinite(quantity) || quantity < 1) return res.status(400).json({ message: 'One of the cart items is invalid.' });
      
      const itemSize = (item.size || '').toLowerCase().trim();
      const itemColor = (item.color || '').toLowerCase().trim();

      // Case-insensitive variant matching
      const variant = item.variantId
        ? product.variants.id(item.variantId)
        : product.variants.find(candidate => 
            candidate.isActive !== false && 
            (candidate.size || '').toLowerCase().trim() === itemSize && 
            (candidate.color || '').toLowerCase().trim() === itemColor
          );

      if (variant?.isActive === false) return res.status(400).json({ message: `The selected variant for ${product.name} is unavailable.` });
      
      // NAYA LOGIC: Agar variant nahi mila, tabhi main sizes array check karo
      if (!variant) {
          if (product.enableSizes && (!item.size || !product.sizes?.some(s => s.toLowerCase().trim() === itemSize))) {
              return res.status(400).json({ message: `The selected size for ${product.name} is unavailable.` });
          }
          if (product.enableColors && (!item.color || !product.colors?.some(c => c.toLowerCase().trim() === itemColor))) {
              return res.status(400).json({ message: `The selected colour for ${product.name} is unavailable.` });
          }
      }
      
      // Agar product mein variants hain par user ne jo select kiya wo nahi mila
      if (product.variants && product.variants.length > 0 && !variant) {
          return res.status(400).json({ message: `The selected variant for ${product.name} is unavailable.` });
      }

      if (!variant && product.stock < quantity) return res.status(400).json({ message: `${product.name} does not have enough stock.` });
      
      const unitPrice = variant?.price ?? product.price;
      const availableStock = variant ? variant.stock : product.stock;
      if (availableStock < quantity) return res.status(400).json({ message: `${product.name} does not have enough stock for this variant.` });
      
      total += unitPrice * quantity;
      normalized.push({ 
          product: product._id, 
          name: product.name, 
          image: product.image, 
          price: unitPrice, 
          quantity, 
          variantId: variant?._id, 
          size: item.size || '', 
          color: item.color || '' 
      });
    }
    
    const shippingFee = total >= 1999 ? 0 : 99;
    
    for (const item of normalized) {
      const source = await Product.findById(item.product).select('variants');
      
      const itemSize = (item.size || '').toLowerCase().trim();
      const itemColor = (item.color || '').toLowerCase().trim();

      const selectedVariant = item.variantId
        ? source?.variants?.id(item.variantId)
        : source?.variants?.find(candidate => 
            (candidate.size || '').toLowerCase().trim() === itemSize && 
            (candidate.color || '').toLowerCase().trim() === itemColor
          );
          
      const update = selectedVariant
        ? { $inc: { stock: -item.quantity, 'variants.$[variant].stock': -item.quantity } }
        : { $inc: { stock: -item.quantity } };
        
      const updated = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: { $gte: item.quantity },
          ...(selectedVariant ? { variants: { $elemMatch: { _id: selectedVariant._id, stock: { $gte: item.quantity } } } } : {}),
        },
        update,
        selectedVariant ? { new: true, arrayFilters: [{ 'variant._id': selectedVariant._id }] } : { new: true },
      );
      if (!updated) return res.status(409).json({ message: `${item.name} became unavailable while checking out.` });
    }
    
    const order = await Order.create({ user: req.user._id, items: normalized, total: total + shippingFee, shipping, shippingFee, paymentMethod });
    res.status(201).json(order);
  } catch (e) {
    next(e);
  }
});

router.get('/mine', protect, async (req, res, next) => { 
    try { res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 })); } 
    catch (e) { next(e); } 
});

router.get('/mine/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json(order);
  } catch (e) { next(e); }
});

router.patch('/mine/:id/cancel', protect, async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (!['Pending', 'Confirmed'].includes(order.status)) return res.status(400).json({ message: 'This order can no longer be cancelled.' });
    
    order.status = 'Cancelled';
    order.statusHistory.push({ status: 'Cancelled', changedAt: new Date() });
    await order.save();
    
    // FIX: Restore both main stock AND variant stock
    for (const item of order.items) {
        if (item.variantId) {
            await Product.updateOne(
                { _id: item.product, 'variants._id': item.variantId },
                { $inc: { stock: item.quantity, 'variants.$.stock': item.quantity } }
            );
        } else {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }
    }
    
    res.json(order);
  } catch (e) { next(e); }
});

router.get('/', protect, adminOnly, async (req, res, next) => { 
    try { res.json(await Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(200)); } 
    catch (e) { next(e); } 
});

router.put('/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const allowed = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Failed'];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid order status.' });
    
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    
    if (order.status !== req.body.status) {
      order.status = req.body.status;
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({ status: req.body.status, changedAt: new Date() });
      await order.save();
    }
    res.json(order);
  } catch (e) { next(e); }
});

export default router;