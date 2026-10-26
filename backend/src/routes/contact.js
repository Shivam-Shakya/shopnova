import { Router } from 'express';
import ContactMessage from '../models/ContactMessage.js';
const router = Router();
router.post('/', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '')) || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Name, valid email, subject and message are required.' });
    }
    await ContactMessage.create({ name, email, subject, message });
    res.status(201).json({ message: 'Your message has been received.' });
  } catch (error) { next(error); }
});
export default router;
