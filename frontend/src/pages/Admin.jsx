import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  Edit3,
  LayoutDashboard,
  LogOut,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Tags,
  Users,
  X,
  Image as ImageIcon,
  Settings,
} from "lucide-react";
import api from "../api";
import { useStore } from "../context/StoreContext";
import "./Admin.css";
import LoadingSpinner from "../components/LoadingSpinner";

const empty = {
  name: "", 
  category: "",
  subcategory: "",
  price: "",
  originalPrice: "",
  image: "",
  images: ["", "", "", ""],
  stock: "0",
  description: "",
  featured: false,
  isActive: true,
  enableSizes: false,
  enableColors: false,
  sizes: [],
  colors: [],
  variants: [],
};

function normaliseProduct(product = {}) {
  // Array.from(new Set(...)) ka use duplicate image links hatane ke liye kiya gaya hai
  const imageValues = Array.from(
    new Set([product.image, ...(product.images || [])]),
  ).filter(Boolean);

  return {
    ...empty,
    ...product,
    price: product.price === undefined ? "" : String(product.price),
    originalPrice: product.originalPrice ? String(product.originalPrice) : "",
    stock: product.stock === undefined ? "0" : String(product.stock),
    images: [...imageValues, "", "", "", ""].slice(0, 4),
    enableSizes: Array.isArray(product.sizes) && product.sizes.length > 0,
    enableColors: Array.isArray(product.colors) && product.colors.length > 0,
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    colors: Array.isArray(product.colors) ? product.colors : [],
    variants: Array.isArray(product.variants)
      ? product.variants.map((variant) => ({
          sku: variant.sku || "",
          size: variant.size || "",
          color: variant.color || "",
          price: variant.price === undefined ? "" : String(variant.price),
          stock: variant.stock === undefined ? "0" : String(variant.stock),
          isActive: variant.isActive !== false,
        }))
      : [],
  };
}

export default function Admin() {
  const { user, authReady, login, logout } = useStore();
  const navigate = useNavigate();
  const [auth, setAuth] = useState({ email: "", password: "" });
  const [tab, setTab] = useState("overview");
  const [catalogueOpen, setCatalogueOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    stock: "",
    status: "",
    page: 1,
  });
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categoryBusy, setCategoryBusy] = useState(false);

  const load = async () => {
    if (user?.role !== "admin") return;
    setLoading(true);
    try {
      const query = new URLSearchParams({
        limit: "100",
        page: String(filters.page),
      });
      Object.entries(filters).forEach(
        ([key, value]) => value && key !== "page" && query.set(key, value),
      );
      const [
        dashboardResponse,
        productResponse,
        orderResponse,
        categoryResponse,
      ] = await Promise.all([
        api.get("/dashboard"),
        api.get(`/products/admin?${query}`),
        api.get("/orders"),
        api.get("/categories"),
      ]);
      setDashboard(dashboardResponse.data || null);
      setProducts(
        Array.isArray(productResponse.data?.products)
          ? productResponse.data.products
          : [],
      );
      setOrders(Array.isArray(orderResponse.data) ? orderResponse.data : []);
      setCategories(
        Array.isArray(categoryResponse.data) ? categoryResponse.data : [],
      );
      setError("");
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Unable to load admin data. Check the backend connection and retry.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authReady && user?.role === "admin") load();
    else if (authReady) setLoading(false);
  }, [authReady, user, filters]);

  const signIn = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const signedIn = await login(auth.email, auth.password);
      if (signedIn.role !== "admin") {
        logout();
        setError("This account does not have administrator permissions.");
      } else navigate("/admin");
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Could not sign in. Check the backend and credentials.",
      );
    } finally {
      setBusy(false);
    }
  };

  const openAdd = () => {
    setForm({ ...empty, category: categories[0]?.name || "" });
    setEditing(null);
    setError("");
    setShowForm(true);
    setTab("add");
  };

  const openEdit = (product) => {
    setForm(normaliseProduct(product));
    setEditing(product._id);
    setError("");
    setShowForm(true);
    setTab("products");
  };

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const images = form.images.filter(Boolean);
      const payload = {
        ...form,
        image: images[0] || form.image,
        images,
        price: Number(form.price),
        originalPrice: form.originalPrice
          ? Number(form.originalPrice)
          : undefined,
        stock: Number(form.stock),
        isActive: form.isActive, // YAHAN CHANGE KAREIN (Taki manual toggle bhi kaam kare)
        sizes: form.enableSizes ? form.sizes.filter(Boolean) : [],
        colors: form.enableColors ? form.colors.filter(Boolean) : [],
        variants: form.variants.map((variant) => ({
          ...variant,
          price: Number(variant.price || form.price),
          stock: Number(variant.stock),
        })),
      };
      if (!payload.image)
        throw new Error("Add at least one product image URL.");
      if (editing) await api.put(`/products/${editing}`, payload);
      else await api.post("/products", payload);
      setShowForm(false);
      setEditing(null);
      setForm(empty);
      await load();
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "Could not save product.",
      );
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try {
      await api.delete(`/products/${id}`);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Delete failed.");
    }
  };

  // Naya function: Order Status Update karne ke liye
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Order status update failed.");
    }
  };

  const categoryAction = async (action) => {
    setCategoryBusy(true);
    setError("");
    try {
      await action();
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Category operation failed.");
    } finally {
      setCategoryBusy(false);
    }
  };

  const addCategory = () => {
    const name = window.prompt("Category name");
    if (name?.trim())
      categoryAction(() => api.post("/categories", { name: name.trim() }));
  };

  const editCategory = (category) => {
    const name = window.prompt("Category name", category.name);
    if (name?.trim())
      categoryAction(() =>
        api.put(`/categories/${category._id}`, {
          name: name.trim(),
          description: category.description,
          image: category.image,
        }),
      );
  };

  const deleteCategory = (category) => {
    if (
      window.confirm(
        `Delete ${category.name}? Products must be reassigned first.`,
      )
    )
      categoryAction(() => api.delete(`/categories/${category._id}`));
  };

  const addSubcategory = (category) => {
    const name = window.prompt(`New subcategory for ${category.name}`);
    if (name?.trim())
      categoryAction(() =>
        api.post(`/categories/${category._id}/subcategories`, {
          name: name.trim(),
        }),
      );
  };

  const editSubcategory = (category, subcategory) => {
    const name = window.prompt("Subcategory name", subcategory.name);
    if (name?.trim() && name.trim() !== subcategory.name)
      categoryAction(() =>
        api.put(
          `/categories/${category._id}/subcategories/${subcategory._id}`,
          { name: name.trim() },
        ),
      );
  };

  const deleteSubcategory = (category, subcategory) => {
    if (
      window.confirm(
        `Delete ${subcategory.name}? Products must be reassigned first.`,
      )
    )
      categoryAction(() =>
        api.delete(
          `/categories/${category._id}/subcategories/${subcategory._id}`,
        ),
      );
  };

  if (!authReady || (loading && !user))
    return <LoadingSpinner />;
  if (user?.role !== "admin")
    return (
      <div className="admin-login-shell">
        <form className="admin-login-card modern-shadow" onSubmit={signIn}>
          <div className="admin-lock">
            <ShieldCheck size={40} className="text-primary" />
          </div>
          <div className="eyebrow mt-2">SHOPNOVA CONTROL ROOM</div>
          <h1>Admin Sign In</h1>
          <p className="text-muted">
            {error || "This area is for authorised store administrators only."}
          </p>
          <label className="form-group">
            <span>Email address</span>
            <input
              type="email"
              required
              value={auth.email}
              onChange={(e) => setAuth({ ...auth, email: e.target.value })}
              className="modern-input"
            />
          </label>
          <label className="form-group">
            <span>Password</span>
            <input
              type="password"
              required
              value={auth.password}
              onChange={(e) => setAuth({ ...auth, password: e.target.value })}
              className="modern-input"
            />
          </label>
          <button className="btn btn-primary full mt-2" disabled={busy}>
            {busy ? "Signing in…" : "Enter Admin Panel"}
          </button>
          <button
            type="button"
            className="admin-back mt-1"
            onClick={() => navigate("/")}
          >
            ← Return to storefront
          </button>
        </form>
      </div>
    );

  const summary = dashboard?.summary || {};
  const catalogueTabs = [
    ["products", "All products"],
    ["add", "Add product"],
    ["categories", "Categories"],
    ["variants", "Product variants"],
    ["inventory", "Inventory"],
  ];

  return (
    <div className="admin-layout modern-ui">
      <aside className="admin-sidebar shadow-right">
        <div className="brand admin-brand">
          <span className="brand-mark">s.</span> shopnova{" "}
          <span className="badge">ADMIN</span>
        </div>
        <div className="admin-menu-label">WORKSPACE</div>
        <NavButton
          active={tab === "overview"}
          icon={<LayoutDashboard size={18} />}
          onClick={() => setTab("overview")}
        >
          Overview
        </NavButton>
        <NavButton
          active={[
            "products",
            "add",
            "categories",
            "variants",
            "inventory",
          ].includes(tab)}
          icon={<Package size={18} />}
          onClick={() => setCatalogueOpen(!catalogueOpen)}
        >
          Catalogue{" "}
          <span className="nav-toggle">{catalogueOpen ? "−" : "+"}</span>
        </NavButton>
        {catalogueOpen && (
          <div className="catalogue-submenu">
            {catalogueTabs.map(([value, label]) => (
              <button
                key={value}
                className={tab === value ? "selected" : ""}
                onClick={() => (value === "add" ? openAdd() : setTab(value))}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <NavButton
          active={tab === "orders"}
          icon={<ShoppingCart size={18} />}
          onClick={() => setTab("orders")}
        >
          Orders <span className="nav-badge">{orders.length}</span>
        </NavButton>
        <div className="admin-sidebar-bottom">
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="logout-btn"
          >
            <LogOut size={18} /> Sign out
          </button>
          <a href="/" className="admin-store-link">
            ← View storefront
          </a>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <div className="eyebrow text-muted">STORE MANAGEMENT</div>
            <h1 className="page-title">
              {tab === "add"
                ? "Add product"
                : tab[0].toUpperCase() + tab.slice(1)}
            </h1>
          </div>
          <div className="admin-top-actions">
            <span className="admin-status">
              <i className="status-dot green" /> Store connected
            </span>
            <button
              className="icon-btn refresh-btn"
              onClick={load}
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
            <div className="admin-avatar">
              {user.name?.[0]?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {error && (
          <div className="admin-alert error">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button className="close-btn" onClick={() => setError("")}>
              <X size={16} />
            </button>
            <button className="retry-btn" onClick={load}>
              Retry
            </button>
          </div>
        )}

        <div className="admin-content-area">
          {loading ? (
            <LoadingSpinner />
          ) : tab === "overview" ? (
            <Overview summary={summary} orders={orders} products={products} />
          ) : ["products", "add"].includes(tab) ? (
            <Products
              products={products}
              categories={categories}
              filters={filters}
              setFilters={setFilters}
              openEdit={openEdit}
              remove={remove}
              openAdd={openAdd}
            />
          ) : tab === "categories" ? (
            <Categories
              categories={categories}
              busy={categoryBusy}
              subcategoriesOnly={tab === "subcategories"}
              addCategory={addCategory}
              editCategory={editCategory}
              deleteCategory={deleteCategory}
              addSubcategory={addSubcategory}
              editSubcategory={editSubcategory}
              deleteSubcategory={deleteSubcategory}
            />
          ) : tab === "variants" ? (
            <Variants products={products} />
          ) : tab === "inventory" ? (
            <Inventory products={products} />
          ) : (
            <Orders orders={orders} updateOrderStatus={updateOrderStatus} />
          )}
        </div>
      </section>

      {showForm && (
        <ProductForm
          form={form}
          setForm={setForm}
          editing={editing}
          busy={busy}
          error={error}
          save={save}
          close={() => {
            setShowForm(false);
            setEditing(null);
            setError("");
          }}
          categories={categories}
        />
      )}
    </div>
  );
}

function NavButton({ active, icon, children, onClick }) {
  return (
    <button className={`nav-btn ${active ? "active" : ""}`} onClick={onClick}>
      <span className="nav-icon">{icon}</span>
      <span className="nav-text">{children}</span>
    </button>
  );
}

function Overview({ summary, orders = [], products = [] }) {
  // 1. Dynamic Boxes Calculation
  const completedOrders = orders.filter(o => o.status === "Delivered").length;
  const pendingOrders = orders.filter(o => o.status === "Pending" || o.status === "Processing").length;
  const lowStockCount = products.filter(p => p.stock >= 0 && p.stock < 5).length; // Stock 5 se kam
  const totalOrders = orders.length || 1; // 0 se divide na ho
  const successRate = orders.length ? `${Math.round((completedOrders / totalOrders) * 100)}%` : "0%";

  // 2. Dynamic Top Selling Calculation
  let topSellingList = summary.topSelling;

  // Agar backend se top selling nahi aata hai, toh frontend par calculate karein
  if (!topSellingList || topSellingList.length === 0) {
    const productSales = {};

    orders.forEach((order) => {
      // Cancelled orders ko count nahi karenge
      if (order.status !== "Cancelled") {
        const items = order.items && order.items.length > 0 ? order.items : [];
        items.forEach((item) => {
          const name = item.name || (item.product && item.product.name);
          if (name) {
            if (!productSales[name]) {
              productSales[name] = {
                image: item.image || (item.product && item.product.image) || "",
                name: name,
                customer: order.user?.name || order.shipping?.name || "Guest",
                date: new Date(order.createdAt).toLocaleDateString("en-IN"),
                rating: "4.5", // Rating static rahegi kyunki orders me rating nahi hoti
                status: "Success",
                salesCount: 0
              };
            }
            productSales[name].salesCount += (item.quantity || 1);
          }
        });
      }
    });

    // Sales count ke hisaab se sort karke Top 5 nikalna
    topSellingList = Object.values(productSales)
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5);
  }

  return (
    <div className="dashboard-grid">
      <div className="stats-row">
        <Stat
          icon={<BarChart3 />}
          label="Revenue"
          value={`₹${Number(summary.revenue || 0).toLocaleString("en-IN")}`}
          hint="Total Revenue"
          theme="blue"
        />
        <Stat
          icon={<Package />}
          label="Products"
          value={summary.products || products.length}
          hint="Total Products"
          theme="orange"
        />
        <Stat
          icon={<ShoppingCart />}
          label="Orders"
          value={summary.orders || orders.length}
          hint="Total Orders"
          theme="green"
        />
        <Stat
          icon={<Users />}
          label="Customers"
          value={summary.customers || 0}
          hint="Registered customers"
          theme="purple"
        />
      </div>

      <div className="stats-row mt-2">
        <Stat
          icon={<ShieldCheck />}
          label="Completed Orders"
          value={summary.completedOrders || completedOrders}
          hint="Delivered orders"
          theme="green"
        />
        <Stat
          icon={<RefreshCw />}
          label="Pending Orders"
          value={summary.pendingOrders || pendingOrders}
          hint="Processing orders"
          theme="orange"
        />
        <Stat
          icon={<BarChart3 />}
          label="Success Rate"
          value={summary.successRate || successRate}
          hint="Order success"
          theme="blue"
        />
        <Stat
          icon={<AlertTriangle />}
          label="Low Stock"
          value={summary.lowStock || lowStockCount}
          hint="Needs restock"
          theme="purple"
        />
      </div>

      <div className="admin-card mt-2">
        <div className="card-header">
          <h2>Top Selling List</h2>
          <p className="text-muted">
            Most popular and highest selling products.
          </p>
        </div>
        <div className="table-responsive">
          <table className="admin-table modern">
            <thead>
              <tr>
                <th>Product Image</th>
                <th>Product Name</th>
                <th>Customer Name</th>
                <th>Last Ordered</th>
                <th>Rating</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {topSellingList.map((item, index) => (
                <tr key={index} className="table-row-hover">
                  <td>
                    <div className="img-wrapper">
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <ImageIcon size={20} className="placeholder-icon" />
                      )}
                    </div>
                  </td>
                  <td className="font-medium">{item.name}</td>
                  <td>{item.customer}</td>
                  <td className="text-muted">{item.date}</td>
                  <td className="font-medium">⭐ {item.rating}</td>
                  <td>
                    <span className="status-badge success">{item.status}</span>
                  </td>
                </tr>
              ))}
              {!topSellingList.length && (
                <tr>
                  <td
                    colSpan="6"
                    className="table-empty py-4 text-center text-muted"
                  >
                    No orders placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, hint, theme = "default" }) {
  return (
    <div className={`admin-stat-card theme-${theme}`}>
      <div className="stat-header">
        <span className="stat-icon">{icon}</span>
        <span className="stat-label">{label}</span>
      </div>
      <b className="stat-value">{value}</b>
      <small className="stat-hint">{hint}</small>
    </div>
  );
}

function Products({
  products,
  categories,
  filters,
  setFilters,
  openEdit,
  remove,
  openAdd,
}) {
  const update = (key, value) =>
    setFilters({ ...filters, [key]: value, page: 1 });
  return (
    <div className="admin-card">
      <div className="card-header flex-between">
        <div>
          <h2>All Products</h2>
          <p className="text-muted">
            Search, filter, edit and delete products.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={17} /> Add Product
        </button>
      </div>
<div className="custom-product-filters">
  <div className="custom-search-wrapper">
    <Search size={16} className="custom-search-icon" />
    <input
      className="custom-search-input"
      placeholder="Search products, SKU…"
      value={filters.search}
      onChange={(e) => update("search", e.target.value)}
    />
  </div>
  <select
    className="custom-dropdown-select"
    value={filters.category}
    onChange={(e) => update("category", e.target.value)}
  >
    <option value="">All Categories</option>
    {categories.map((c) => (
      <option key={c.id} value={c.name}>
        {c.name}
      </option>
    ))}
  </select>
  <select
    className="custom-dropdown-select"
    value={filters.stock}
    onChange={(e) => update("stock", e.target.value)}
  >
    <option value="">All Stock</option>
    <option value="in">In Stock</option>
    <option value="low">Low Stock</option>
    <option value="out">Out of Stock</option>
  </select>
  <select
    className="custom-dropdown-select"
    value={filters.status}
    onChange={(e) => update("status", e.target.value)}
  >
    <option value="">All Statuses</option>
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
  </select>
</div>
      <ProductsTable products={products} openEdit={openEdit} remove={remove} />
    </div>
  );
}

function ProductsTable({ products, openEdit, remove }) {
  return (
    <div className="table-responsive">
      <table className="admin-table modern">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id} className="table-row-hover">
              <td>
                <div className="table-product-cell">
                  <div className="img-wrapper">
                    {p.image ? (
                      <img src={p.image} alt="" />
                    ) : (
                      <ImageIcon size={20} className="placeholder-icon" />
                    )}
                  </div>
                  <div className="product-info">
                    <b className="product-name">{p.name}</b>
                    <small className="text-muted">
                      {p.subcategory || "No subcategory"}
                    </small>
                  </div>
                </div>
              </td>
              <td>
                <span className="badge-light">{p.category}</span>
              </td>
              <td className="font-medium">
                ₹{Number(p.price || 0).toLocaleString("en-IN")}
              </td>
              <td>
                <span
                  className={`status-badge ${p.stock === 0 ? "error" : p.stock < 5 ? "warning" : "success"}`}
                >
                  {p.stock} in stock
                </span>
              </td>
              <td>
                <span
                  className={`status-badge ${p.isActive === false ? "inactive" : "success"}`}
                >
                  {p.isActive === false ? "Inactive" : "Active"}
                </span>
              </td>
              <td>
                <div className="table-actions justify-end">
                  <button
                    className="action-btn edit"
                    title="Edit"
                    onClick={() => openEdit(p)}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="action-btn delete"
                    title="Delete"
                    onClick={() => remove(p._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {!products.length && (
            <tr>
              <td
                colSpan="6"
                className="table-empty py-4 text-center text-muted"
              >
                No products match these filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Categories({
  categories,
  busy,
  subcategoriesOnly,
  addCategory,
  editCategory,
  deleteCategory,
  addSubcategory,
  editSubcategory,
  deleteSubcategory,
}) {
  return (
    <div className="admin-card">
      <div className="card-header flex-between">
        <div>
          <h2>{subcategoriesOnly ? "Subcategories" : "Categories"}</h2>
          <p className="text-muted">Manage the catalogue hierarchy.</p>
        </div>
        {!subcategoriesOnly && (
          <button
            className="btn btn-primary"
            onClick={addCategory}
            disabled={busy}
          >
            <Plus size={17} /> Add Category
          </button>
        )}
      </div>
      <div className="category-list">
        {categories.map((category) => {
          const subs = category.subcategories || [];
          return (
            <div className="category-card" key={category._id}>
              <div className="category-header">
                <div>
                  <h3>{category.name}</h3>
                  <small className="text-muted">
                    {category.productCount || 0} products · {subs.length}{" "}
                    subcategories
                  </small>
                </div>
                {!subcategoriesOnly && (
                  <div className="actions">
                    <button
                      className="icon-btn edit"
                      onClick={() => editCategory(category)}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="icon-btn delete"
                      onClick={() => deleteCategory(category)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              <div className="subcategory-tags">
                {subs.map((sub) => (
                  <div className="sub-tag" key={sub._id}>
                    <span>{sub.name}</span>
                    <div className="tag-actions">
                      <button onClick={() => editSubcategory(category, sub)}>
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => deleteSubcategory(category, sub)}
                        className="delete"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  className="add-sub-btn"
                  onClick={() => addSubcategory(category)}
                >
                  + Add subcategory
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Variants({ products }) {
  const rows = products.flatMap((product) =>
    (product.variants || []).map((variant) => ({ ...variant, product })),
  );
  return (
    <div className="admin-card">
      <div className="card-header">
        <h2>Product Variants</h2>
        <p className="text-muted">
          Review size, colour, SKU, price and stock combinations.
        </p>
      </div>
      <div className="table-responsive">
        <table className="admin-table modern">
          <thead>
            <tr>
              <th>Product</th>
              <th>Size</th>
              <th>Colour</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.product._id}-${row._id || row.sku}`}>
                <td className="font-medium">{row.product.name}</td>
                <td>
                  <span className="badge-light">{row.size || "—"}</span>
                </td>
                <td>
                  <span className="badge-light">{row.color || "—"}</span>
                </td>
                <td className="text-muted">{row.sku || "—"}</td>
                <td>
                  ₹
                  {Number(row.price || row.product.price || 0).toLocaleString(
                    "en-IN",
                  )}
                </td>
                <td>
                  <span
                    className={`status-badge ${row.stock > 0 ? "success" : "error"}`}
                  >
                    {row.stock}
                  </span>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td
                  colSpan="6"
                  className="table-empty py-4 text-center text-muted"
                >
                  No configured variants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Inventory({ products }) {
  const stock = useMemo(() => products, [products]);
  return (
    <div className="admin-card">
      <div className="card-header">
        <h2>Inventory Control</h2>
        <p className="text-muted">Current product and variant stock levels.</p>
      </div>
      <div className="table-responsive">
        <table className="admin-table modern">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Main Stock</th>
              <th>Variant Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((product) => {
              const variantStock = (product.variants || []).reduce(
                (sum, item) => sum + Number(item.stock || 0),
                0,
              );
              const level =
                product.stock === 0
                  ? "Out of stock"
                  : product.stock < 5
                    ? "Low stock"
                    : "In stock";
              return (
                <tr key={product._id}>
                  <td className="font-medium">{product.name}</td>
                  <td className="text-muted">{product.sku || "—"}</td>
                  <td>{product.stock}</td>
                  <td>{product.variants?.length ? variantStock : "—"}</td>
                  <td>
                    <span
                      className={`status-badge ${level === "In stock" ? "success" : level === "Low stock" ? "warning" : "error"}`}
                    >
                      {level}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Orders({ orders, updateOrderStatus }) {
  return (
    <div className="admin-card">
      <div className="card-header">
        <h2>Recent Orders</h2>
        <p className="text-muted">Review and manage customer orders.</p>
      </div>
      <div className="table-responsive">
        <table className="admin-table modern">
          <thead>
            <tr>
              <th>Product Details</th>
              <th>Size & Color</th>
              <th>Customer</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              // Agar order mein multiple items hain toh unhe map karenge
              const items =
                order.items && order.items.length > 0 ? order.items : [{}];

              return items.map((item, index) => (
                <tr key={`${order._id}-${index}`} className="table-row-hover">
                  <td>
                    <div className="table-product-cell">
                      <div className="img-wrapper">
                        {/* Image map karne ke liye */}
                        {item.image || (item.product && item.product.image) ? (
                          <img src={item.image || item.product.image} alt="" />
                        ) : (
                          <ImageIcon size={20} className="placeholder-icon" />
                        )}
                      </div>
                      <div className="product-info">
                        <b className="product-name">
                          {item.name ||
                            (item.product && item.product.name) ||
                            `Order #${order.orderNumber || order._id.slice(-7).toUpperCase()}`}
                        </b>
                        <small className="text-muted">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-IN",
                          )}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    {/* Size aur Color show karne ke liye */}
                    {item.size || item.color ? (
                      <>
                        {item.size && (
                          <span className="badge-light mr-1">
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="badge-light">
                            Color: {item.color}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    {order.user?.name ||
                      order.shipping?.name ||
                      "Guest Customer"}
                  </td>
                  <td className="font-medium">
                    ₹
                    {Number(item.price || order.total || 0).toLocaleString(
                      "en-IN",
                    )}
                  </td>
                  <td>
                    <select
                      className="modern-input slim"
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(order._id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- MODERNIZED PRODUCT FORM ---------------- */
function ProductForm({
  form,
  setForm,
  editing,
  busy,
  error,
  save,
  close,
  categories,
}) {
  const selected = categories.find(
    (category) => category.name === form.category,
  );
  const subs = selected?.subcategories || [];
  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const updateVariant = (index, key, value) =>
    set(
      "variants",
      form.variants.map((variant, i) =>
        i === index ? { ...variant, [key]: value } : variant,
      ),
    );

  const generateVariants = () => {
    const sizes = form.enableSizes && form.sizes.length > 0 ? form.sizes : [""];
    const colors =
      form.enableColors && form.colors.length > 0 ? form.colors : [""];
    const existing = new Map(
      form.variants.map((variant) => [
        `${variant.size}|${variant.color}`,
        variant,
      ]),
    );
    const variants = sizes.flatMap((size) =>
      colors.map(
        (color) =>
          existing.get(`${size}|${color}`) || {
            sku: "",
            size,
            color,
            price: form.price,
            stock: "0",
            isActive: true,
          },
      ),
    );
    set("variants", variants);
  };

  const chooseImage = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      set(
        "images",
        form.images.map((item, i) =>
          i === index ? String(reader.result) : item,
        ),
      );
    reader.readAsDataURL(file);
  };

  return (
    <div className="modal-backdrop glass-effect">
      <form className="modal-content large-modal scrollable" onSubmit={save}>
        {/* Sticky Header */}
        <div className="modal-header sticky">
          <div>
            <h2>{editing ? "Edit Product" : "Add New Product"}</h2>
            <p className="text-muted">
              Fill in the details below to publish your product.
            </p>
          </div>
          <button type="button" className="close-btn circle" onClick={close}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body form-grid-layout">
          {error && (
            <div className="admin-alert error mb-2">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          {/* Section 1: Basic Details */}
          <div className="form-section card-style">
            <h3 className="section-title">
              <Settings size={16} /> Basic Information
            </h3>
            <div className="grid-2-col">
              <label className="form-group span-full">
                <span>
                  Product Name <span className="req">*</span>
                </span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="modern-input"
                  placeholder="e.g. Classic White T-Shirt"
                />
              </label>
              <label className="form-group">
                <span>
                  Category <span className="req">*</span>
                </span>
                <select
                  required
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                      subcategory: "",
                    })
                  }
                  className="modern-input"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-group">
                <span>Subcategory</span>
                <select
                  value={form.subcategory}
                  disabled={!subs.length}
                  onChange={(e) => set("subcategory", e.target.value)}
                  className="modern-input"
                >
                  <option value="">
                    {subs.length ? "Select subcategory" : "N/A"}
                  </option>
                  {subs.map((sub) => (
                    <option key={sub._id} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-group span-full">
                <span>Description</span>
                <textarea
                  rows="4"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  className="modern-input"
                  placeholder="Write a compelling description..."
                />
              </label>
            </div>
          </div>

          {/* Section 2: Pricing & Stock */}
          <div className="form-section card-style">
            <h3 className="section-title">Pricing & Inventory</h3>
            <div className="grid-3-col">
              <label className="form-group">
                <span>
                  Selling Price (₹) <span className="req">*</span>
                </span>
                <input
                  type="number"
                  min="0"
                  required
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  className="modern-input"
                />
              </label>
              <label className="form-group">
                <span>Compare-at Price (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={form.originalPrice}
                  onChange={(e) => set("originalPrice", e.target.value)}
                  className="modern-input"
                  placeholder="Higher price for strike-through"
                />
              </label>
              <label className="form-group">
  <span>
    Base Stock <span className="req">*</span>
  </span>
  <input
    type="number"
    min="0"
    required
    value={form.stock}
    onChange={(e) => {
      const newStock = e.target.value;
      // Jab stock 0 hoga toh isActive false ho jayega, warna true
      setForm(prev => ({
        ...prev,
        stock: newStock,
        isActive: Number(newStock) > 0 
      }));
    }}
    className="modern-input"
  />
</label>
            </div>
          </div>

          {/* Section 3: Media */}
          <div className="form-section card-style">
            <h3 className="section-title">
              <ImageIcon size={16} /> Product Media
            </h3>
            <p className="text-muted text-sm mb-2">
              Upload up to 4 images. First image will be the primary cover.
            </p>
            <div className="image-upload-grid">
              {form.images.map((image, index) => (
                <div className="image-upload-card" key={index}>
                  <div className="image-preview-area">
                    {image ? (
                      <img src={image} alt={`Preview ${index + 1}`} />
                    ) : (
                      <div className="empty-preview">
                        <ImageIcon size={24} />
                        <span>Image {index + 1}</span>
                      </div>
                    )}
                  </div>
                  <div className="image-inputs">
                    <input
                      type="text"
                      placeholder="Image URL (https://...)"
                      value={image}
                      required={index === 0}
                      onChange={(e) =>
                        set(
                          "images",
                          form.images.map((item, i) =>
                            i === index ? e.target.value : item,
                          ),
                        )
                      }
                      className="modern-input text-sm"
                    />
                    <label className="file-upload-btn">
                      Upload File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          chooseImage(index, e.target.files?.[0])
                        }
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Variants Engine */}
          <div className="form-section card-style variant-section">
            {/* NEW: Size & Color Inputs */}
            <div className="flex-row gap-4 mb-3 border-bottom pb-2">
              <div className="form-group flex-1">
                <label className="toggle-switch mb-1">
                  <input
                    type="checkbox"
                    checked={form.enableSizes}
                    onChange={(e) => set("enableSizes", e.target.checked)}
                  />
                  <span className="slider"></span>
                  <span className="label-text">Enable Sizes</span>
                </label>
                {form.enableSizes && (
                  <input
                    type="text"
                    placeholder="e.g. S, M, L, XL (comma separated)"
                    value={form.sizes.join(", ")}
                    onChange={(e) =>
                      set(
                        "sizes",
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      )
                    }
                    className="modern-input mt-1"
                  />
                )}
              </div>
              <div className="form-group flex-1">
                <label className="toggle-switch mb-1">
                  <input
                    type="checkbox"
                    checked={form.enableColors}
                    onChange={(e) => set("enableColors", e.target.checked)}
                  />
                  <span className="slider"></span>
                  <span className="label-text">Enable Colours</span>
                </label>
                {form.enableColors && (
                  <input
                    type="text"
                    placeholder="e.g. Red, Blue, Black (comma separated)"
                    value={form.colors.join(", ")}
                    onChange={(e) =>
                      set(
                        "colors",
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      )
                    }
                    className="modern-input mt-1"
                  />
                )}
              </div>
            </div>

            <div className="flex-between mb-2">
              <h3 className="section-title m-0">Variants Configuration</h3>
              <div className="variant-action-btns">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={generateVariants}
                >
                  <RefreshCw size={14} /> Auto-Generate
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() =>
                    set("variants", [
                      ...form.variants,
                      {
                        sku: "",
                        size: "",
                        color: "",
                        price: form.price,
                        stock: "0",
                        isActive: true,
                      },
                    ])
                  }
                >
                  <Plus size={14} /> Add Row
                </button>
              </div>
            </div>

            {form.variants.length > 0 ? (
              <div className="variant-table-container">
                <table className="modern-variant-table">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Size</th>
                      <th>Colour</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.variants.map((variant, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            placeholder="Auto/SKU"
                            value={variant.sku}
                            onChange={(e) =>
                              updateVariant(index, "sku", e.target.value)
                            }
                            className="modern-input slim"
                          />
                        </td>
                        <td>
                          <input
                            placeholder="e.g. XL"
                            value={variant.size}
                            onChange={(e) =>
                              updateVariant(index, "size", e.target.value)
                            }
                            className="modern-input slim"
                          />
                        </td>
                        <td>
                          <input
                            placeholder="e.g. Red"
                            value={variant.color}
                            onChange={(e) =>
                              updateVariant(index, "color", e.target.value)
                            }
                            className="modern-input slim"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            placeholder="Price"
                            value={variant.price}
                            onChange={(e) =>
                              updateVariant(index, "price", e.target.value)
                            }
                            className="modern-input slim"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            placeholder="Stock"
                            value={variant.stock}
                            onChange={(e) =>
                              updateVariant(index, "stock", e.target.value)
                            }
                            className="modern-input slim"
                          />
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="icon-btn delete small"
                            onClick={() =>
                              set(
                                "variants",
                                form.variants.filter((_, i) => i !== index),
                              )
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-variants-box">
                <p className="text-muted">
                  No variants created yet. Click "Add Row" or "Auto-Generate".
                </p>
              </div>
            )}
          </div>

          {/* Section 5: Visibility */}
          <div className="form-section card-style visibility-settings flex-row gap-4">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
              />
              <span className="slider"></span>
              <span className="label-text">Feature on Homepage</span>
            </label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={form.isActive !== false}
                onChange={(e) => set("isActive", e.target.checked)}
              />
              <span className="slider"></span>
              <span className="label-text">Active on Storefront</span>
            </label>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="modal-footer sticky">
          <button type="button" className="btn btn-outline" onClick={close}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary lg" disabled={busy}>
            {busy
              ? "Saving Product..."
              : editing
                ? "Save Changes"
                : "Publish Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
