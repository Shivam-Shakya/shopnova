import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart, ShieldCheck, CheckCircle2 } from "lucide-react";
import api from "../api";
import { useStore } from "../context/StoreContext";
import "./Cart.css";

const blankShipping = { name: "", email: "", phone: "", address: "", city: "", state: "", postalCode: "", country: "India" };

export default function Cart() {
  const { cart, updateQty, removeFromCart, cartTotal, setCart, user } = useStore();
  const [shipping, setShipping] = useState(() => {
    try {
      return { ...blankShipping, ...JSON.parse(sessionStorage.getItem("shopnova_checkout") || "{}") };
    } catch {
      return blankShipping;
    }
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) setShipping((old) => ({ ...old, name: old.name || user.name, email: old.email || user.email }));
  }, [user]);

  const submit = async (event) => {
    event.preventDefault();
    if (!user) {
      sessionStorage.setItem("shopnova_checkout", JSON.stringify(shipping));
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/orders", {
        items: cart.map((item) => ({ productId: item._id, quantity: item.quantity, variantId: item.variantId, size: item.size, color: item.color })),
        shipping,
        paymentMethod: "Cash on delivery (demo)",
      });
      setSuccess(data);
      setCart([]);
      sessionStorage.removeItem("shopnova_checkout");
    } catch (err) {
      setError(err.response?.data?.message || "Order nahi ho paya, please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (success)
    return (
      <div className="order-success-fluid">
        <div className="success-banner">
          <CheckCircle2 size={64} className="icon-success" />
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for shopping. Order <b>#{success.orderNumber || success._id.slice(-7).toUpperCase()}</b> has been confirmed.</p>
          <Link to="/account" className="btn-mega" style={{ width: 'auto', padding: '15px 40px' }}>Track Order</Link>
        </div>
      </div>
    );

  const shippingFee = cartTotal >= 1999 ? 0 : 99;

  return (
    <div className="cart-fluid-container">
      <div className="cart-header-fluid">
        <h2>Your Bag <span>({cart.length} Items)</span></h2>
        <Link to="/" className="continue-shopping">Continue Shopping</Link>
      </div>

      {!cart.length ? (
        <div className="empty-cart-fluid">
          <ShoppingCart size={80} color="#ccc" />
          <h2>Your cart is empty!</h2>
          <p>Add items to it now.</p>
          <Link to="/" className="btn-mega" style={{ width: 'auto', padding: '14px 40px' }}>Shop Now</Link>
        </div>
      ) : (
        <div className="cart-grid-fluid">
          <div className="cart-items-column">
            <div className="ecom-cart-header">
              <div className="col-product">Product</div>
              <div className="col-price">Price</div>
              <div className="col-qty">Quantity</div>
            </div>
            
            {cart.map((item) => (
              <div className="ecom-cart-row" key={item.cartKey || item._id}>
                <div className="col-product item-info-flex">
                  <img src={item.image} alt={item.name} />
                  <div className="item-meta-data">
                    <Link to={`/product/${item.slug || item._id}`} className="item-title">{item.name}</Link>
                    <span className="item-variant">{item.category} {item.size ? `| Size: ${item.size}` : ""}</span>
                    <button className="remove-text-btn" onClick={() => removeFromCart(item.cartKey || item._id)}>REMOVE</button>
                  </div>
                </div>
                <div className="col-price">
                  <b>₹{item.price.toLocaleString("en-IN")}</b>
                </div>
                <div className="col-qty">
                  <div className="stepper-input">
                    <button onClick={() => updateQty(item.cartKey || item._id, item.quantity - 1)}><Minus size={14}/></button>
                    <input type="text" value={item.quantity} readOnly />
                    <button onClick={() => updateQty(item.cartKey || item._id, item.quantity + 1)}><Plus size={14}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="checkout-column">
            <div className="checkout-summary-box">
              <h3>Price Details</h3>
              <hr />
              <div className="price-row">
                <span>Price ({cart.length} items)</span>
                <span>₹{cartTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="price-row">
                <span>Delivery Charges</span>
                <span className={shippingFee === 0 ? "text-success" : ""}>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span>
              </div>
              <hr />
              <div className="price-row total-amount">
                <span>Total Amount</span>
                <span>₹{(cartTotal + shippingFee).toLocaleString("en-IN")}</span>
              </div>
              
              <div className="trust-badge">
                <ShieldCheck size={18} className="text-success" /> 
                Safe and Secure Payments. Easy returns.
              </div>

              {/* 100% Isolated Cart Form */}
              <form onSubmit={submit} className="shopnova-cart-form">
                <h4>Delivery Address</h4>
                <div className="shopnova-cart-grid">
                  <input className="shopnova-cart-input" required type="text" value={shipping.name} onChange={(e) => setShipping({...shipping, name: e.target.value})} placeholder="Full Name" />
                  <input className="shopnova-cart-input" required type="email" value={shipping.email} onChange={(e) => setShipping({...shipping, email: e.target.value})} placeholder="Email Address" />
                  <input className="shopnova-cart-input" required type="text" value={shipping.phone} onChange={(e) => setShipping({...shipping, phone: e.target.value})} placeholder="Mobile Number" />
                  <input className="shopnova-cart-input" required type="text" value={shipping.postalCode} onChange={(e) => setShipping({...shipping, postalCode: e.target.value})} placeholder="PIN Code" />
                  
                  <input className="shopnova-cart-input shopnova-cart-full" required type="text" value={shipping.address} onChange={(e) => setShipping({...shipping, address: e.target.value})} placeholder="Full Address (House No, Building, Street, Area)" />
                  
                  <input className="shopnova-cart-input" required type="text" value={shipping.city} onChange={(e) => setShipping({...shipping, city: e.target.value})} placeholder="City / District" />
                  <input className="shopnova-cart-input" required type="text" value={shipping.state} onChange={(e) => setShipping({...shipping, state: e.target.value})} placeholder="State" />
                </div>
                
                {error && <div className="form-error" style={{ color: '#d9534f', fontSize: '13px', marginBottom: '15px' }}>{error}</div>}
                
                <button className="shopnova-cart-btn" disabled={busy}>
                  {busy ? "Processing..." : "PLACE ORDER"}
                </button>
              </form>

            </div>
          </aside>
        </div>
      )}
    </div>
  );
}