import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, index: true, default: () => `SN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}` },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, name: String, image: String, price: Number, quantity: Number, variantId: mongoose.Schema.Types.ObjectId, size: String, color: String }],
  total: { type: Number, required: true },
  shipping: { name: String, email: String, phone: String, address: String, city: String, state: String, postalCode: String, country: String },
  shippingFee: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Failed'], default: 'Pending' },
  statusHistory: [{ status: String, changedAt: { type: Date, default: Date.now } }],
  paymentMethod: { type: String, enum: ['Cash on delivery (demo)'], default: 'Cash on delivery (demo)' }
}, { timestamps: true });
orderSchema.pre('validate', function addInitialStatus(next) {
  if (!this.statusHistory?.length) this.statusHistory = [{ status: this.status, changedAt: new Date() }];
  next();
});
export default mongoose.model('Order', orderSchema);
