import { Router } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();
const revenueStatuses = { $nin: ['Cancelled', 'Failed'] };

router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const days = [7, 30, 90, 365].includes(Number(req.query.range)) ? Number(req.query.range) : 30;
    const end = req.query.to ? new Date(`${req.query.to}T23:59:59.999Z`) : new Date();
    const requestedStart = req.query.from ? new Date(`${req.query.from}T00:00:00.000Z`) : new Date(end.getTime() - days * 86400000);
    const start = Number.isNaN(requestedStart.getTime()) ? new Date(end.getTime() - days * 86400000) : requestedStart;
    const periodDays = Math.max(1, Math.ceil((end - start) / 86400000));
    const previousStart = new Date(start.getTime() - periodDays * 86400000);
    const dateMatch = { createdAt: { $gte: start, $lte: end } };
    const revenueMatch = { status: revenueStatuses, ...dateMatch };
    const [products, customers, orders, revenue, previousRevenue, statuses, topProducts, sales, ordersByDay, categories, subcategories, pendingOrders, categorySales, inventory] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments(),
      Order.aggregate([{ $match: revenueMatch }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { status: revenueStatuses, createdAt: { $gte: previousStart, $lt: start } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: dateMatch }, { $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Order.aggregate([
        { $match: revenueMatch }, { $unwind: '$items' },
        { $group: { _id: '$items.product', name: { $first: '$items.name' }, quantity: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { quantity: -1 } }, { $limit: 5 },
      ]),
      Order.aggregate([
        { $match: revenueMatch },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: dateMatch },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Product.distinct('category'),
      Product.distinct('subcategory', { subcategory: { $nin: ['', null] } }),
      Order.countDocuments({ status: 'Pending' }),
      Order.aggregate([
        { $match: revenueMatch }, { $unwind: '$items' },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        { $group: { _id: { $ifNull: ['$product.category', 'Uncategorised'] }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { revenue: -1 } },
      ]),
      Product.aggregate([{ $group: { _id: null, inStock: { $sum: { $cond: [{ $gte: ['$stock', 5] }, 1, 0] } }, lowStock: { $sum: { $cond: [{ $and: [{ $gt: ['$stock', 0] }, { $lt: ['$stock', 5] }] }, 1, 0] } }, outOfStock: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } } } }]),
    ]);
    const recentOrders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(8);
    const currentRevenue = revenue[0]?.total || 0;
    const oldRevenue = previousRevenue[0]?.total || 0;
    const salesGrowth = oldRevenue ? ((currentRevenue - oldRevenue) / oldRevenue) * 100 : null;
    res.json({
      summary: { revenue: currentRevenue, products, customers, orders, categories: categories.length, subcategories: subcategories.length, pendingOrders, lowStock: inventory[0]?.lowStock || 0, outOfStock: inventory[0]?.outOfStock || 0, salesGrowth, rangeStart: start, rangeEnd: end },
      statuses, topProducts, sales, ordersByDay, categorySales, inventory: inventory[0] || { inStock: 0, lowStock: 0, outOfStock: 0 }, recentOrders,
    });
  } catch (e) { next(e); }
});

export default router;
