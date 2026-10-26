import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, UserRound, Package, LogOut, LayoutDashboard } from "lucide-react";
import { useStore } from "../context/StoreContext";
import api from "../api";
import "./Account.css";

export default function Account() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState([]);
  
  // Yahan logout ko useStore se import kiya gaya hai
  const { login, register, user, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    api
      .get("/orders/mine")
      .then(({ data }) => setOrders(data))
      .catch((err) => setError(err.response?.data?.message || "Orders load nahi ho paye."));
  }, [user]);

  const cancelOrder = async (order) => {
    try {
      const { data } = await api.patch(`/orders/mine/${order._id}/cancel`);
      setOrders((old) => old.map((item) => (item._id === data._id ? data : item)));
    } catch (err) {
      setError(err.response?.data?.message || "Order cancel nahi ho paya.");
    }
  };

  // Logout handle karne ka function
  const handleLogout = (e) => {
    e.preventDefault();
    if (logout) logout();
    navigate("/"); // Logout hone ke baad user ko home page par bhej dega
  };

  if (user)
    return (
      <div className="account-fluid-container">
        <aside className="account-sidebar">
          <div className="sidebar-profile">
            <div className="avatar"><UserRound size={40} /></div>
            <div>
              <h3>{user.name}</h3>
              <p>{user.email}</p>
            </div>
          </div>
          <nav className="sidebar-nav">
            <a href="#" className="nav-item active"><Package size={18} /> My Orders</a>
            <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate("/"); }}><LayoutDashboard size={18} /> Continue Shopping</a>
            
            {/* Functional Sign Out Button */}
            <a href="#" className="nav-item text-danger" onClick={handleLogout}>
              <LogOut size={18} /> Sign Out
            </a>
          </nav>
        </aside>

        <main className="account-main-content">
          <div className="content-header">
            <h2>Order History</h2>
            <p>View and track all your recent purchases.</p>
          </div>
          
          {error && <div className="alert alert-error">{error}</div>}
          
          <div className="ecom-orders-list">
            {orders.length ? (
              orders.map((order) => (
                <div className="ecom-order-card" key={order._id}>
                  <div className="order-header-strip">
                    <div className="order-info-group">
                      <span className="label">Order Placed</span>
                      <span className="value">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="order-info-group">
                      <span className="label">Total</span>
                      <span className="value">₹{order.total.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="order-info-group">
                      <span className="label">Order #</span>
                      <span className="value">{order.orderNumber || order._id.slice(-7).toUpperCase()}</span>
                    </div>
                    <div className="order-status-group">
                      <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
                    </div>
                  </div>
                  
                  <div className="order-body-strip">
                    <div className="product-scroll-list">
                      {order.items.map((item) => (
                        <div className="product-mini-card" key={`${order._id}-${item.product}`}>
                          <img src={item.image} alt={item.name} />
                          <div className="product-details">
                            <Link to={`/product/${item.slug || item._id}`}>{item.name}</Link>
                            <span>Qty: {item.quantity} {item.size ? ` | ${item.size}` : ""}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {["Pending", "Confirmed"].includes(order.status) && (
                      <div className="order-actions">
                        <button className="btn-outline-danger" onClick={() => cancelOrder(order)}>Cancel Order</button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state-box">
                <Package size={48} />
                <h3>No orders placed yet</h3>
                <button className="btn-primary" onClick={() => navigate("/")}>Start Shopping</button>
              </div>
            )}
          </div>
        </main>
      </div>
    );

  // Auth Layout (Login/Register) - Shows perfectly when user is logged out
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const account = mode === "login" ? await login(form.email, form.password) : await register(form);
      navigate(location.state?.from || (account.role === "admin" ? "/admin" : "/"));
    } catch (err) {
      setError(err.response?.data?.message || "Could not connect. Check the API and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-fluid-split">
      <div className="auth-image-panel">
        <div className="auth-overlay-text">
          <h1>Welcome to Shopnova</h1>
          <p>Discover the best products at unbeatable prices.</p>
        </div>
      </div>
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="icon-header"><LockKeyhole size={28} /></div>
          <h2>{mode === "login" ? "Sign In to Your Account" : "Create a New Account"}</h2>
          <p className="subtitle">{mode === "login" ? "Enter your details to proceed further." : "Join us to enjoy a seamless shopping experience."}</p>

          <form onSubmit={submit} className="full-width-form">
            {mode === "register" && (
              <div className="form-group">
                <label>Full Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rahul Sharma" />
              </div>
            )}
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@domain.com" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" minLength={8} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 8 characters" />
            </div>
            
            {error && <div className="error-msg" style={{ color: '#d9534f', fontSize: '13px', marginBottom: '15px' }}>{error}</div>}
            
            <button className="btn-mega" disabled={busy}>
              {busy ? "Please wait..." : mode === "login" ? "Sign In" : "Register"} <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-toggle-link">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <span onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
              {mode === "login" ? "Create now" : "Login here"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}