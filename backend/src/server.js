import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import contactRoutes from './routes/contact.js';
import dashboardRoutes from './routes/dashboard.js';
import categoryRoutes from './routes/categories.js';
import { categoryInventory, seedCatalog } from './seedProducts.js';
import { syncCategories } from './catalog.js';
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'https://shopnova-5ly7.vercel.app/' }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }), authRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'ShopNova API' }));
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 }), contactRoutes);
app.use((err, _req, res, _next) => { console.error(err); if (err.code === 11000) return res.status(409).json({ message: 'This record already exists.' }); if (err.name === 'ValidationError') return res.status(400).json({ message: err.message }); if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID.' }); res.status(500).json({ message: 'Something went wrong. Please try again.' }); });
const seed = async () => {
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && !await User.exists({ email: process.env.ADMIN_EMAIL.toLowerCase() })) {
    await User.create({ name: 'Store Admin', email: process.env.ADMIN_EMAIL, password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12), role: 'admin' });
    console.log(`Admin account created for ${process.env.ADMIN_EMAIL}`);
  }
  if (process.env.NODE_ENV !== 'production') {
    const demos = [
      { name: 'ShopNova Customer', email: process.env.DEMO_CUSTOMER_EMAIL, password: process.env.DEMO_CUSTOMER_PASSWORD, role: 'customer' },
      { name: 'ShopNova Admin', email: process.env.DEMO_ADMIN_EMAIL, password: process.env.DEMO_ADMIN_PASSWORD, role: 'admin' }
    ];
    for (const demo of demos.filter(account => account.email && account.password)) {
      if (!await User.exists({ email: demo.email.toLowerCase() })) {
        await User.create({ ...demo, email: demo.email.toLowerCase(), password: await bcrypt.hash(demo.password, 12) });
        console.log(`Development demo account created for ${demo.email}`);
      }
    }
  }
};
const start = async () => {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) throw new Error('Set MONGO_URI and JWT_SECRET in backend/.env');
  await mongoose.connect(process.env.MONGO_URI);
  await syncCategories(categoryInventory);
  if (process.env.SEED_DEMO_CATALOG === 'true') await seedCatalog();
  await seed();
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`ShopNova API listening on http://localhost:${port}`));
};
start().catch(err => { console.error('Startup failed:', err.message); process.exit(1); });
