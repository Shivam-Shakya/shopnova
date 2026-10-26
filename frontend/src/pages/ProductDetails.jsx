import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  X,
} from "lucide-react";
import api from "../api";
import { useStore } from "../context/StoreContext"; 
import ProductCard from "../components/ProductCard";
import "./ProductDetails.css";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, wishlist, toggleWishlist, user, login, register } =
    useStore();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get(`/products/${encodeURIComponent(id)}`),
      api.get("/products", { params: { limit: 48 } }),
    ])
      .then(([detail, listing]) => {
        if (!active) return;
        const current = detail.data;
        setProduct(current);
        setImage(current.image);
        setSize(current.sizes?.[0] || "");
        setColor(current.colors?.[0] || "");
        setRelated(
          (listing.data.products || [])
            .filter(
              (item) =>
                item._id !== current._id &&
                (item.subcategory === current.subcategory ||
                  item.category === current.category),
            )
            .slice(0, 4),
        );
      })
      .catch(
        (err) =>
          active &&
          setError(
            err.response?.data?.message ||
              "Product not found or API is unavailable.",
          ),
      );
    return () => {
      active = false;
    };
  }, [id]);

  if (error)
    return (
      <div className="empty-state page-empty">
        <h2>Oops, we couldn't find that.</h2>
        <p>{error}</p>
        <Link className="btn btn-dark" to="/">
          Back to shop
        </Link>
      </div>
    );
  if (!product) return <LoadingSpinner />;

  const liked = wishlist.some((item) => item._id === product._id);
  const gallery = [
    ...new Set(
      (product.images?.length ? product.images : [product.image]).filter(
        Boolean,
      ),
    ),
  ];

  // Naye changes: Variants me se unique Sizes aur Colors nikalna
  const availableSizes = [
    ...new Set(product.variants?.map((v) => v.size).filter(Boolean)),
  ];
  const availableColors = [
    ...new Set(product.variants?.map((v) => v.color).filter(Boolean)),
  ];

  // Find currently selected variant based on selected size and color state
  const selectedVariant = product.variants?.find(
    (item) =>
      item.isActive !== false &&
      item.size === (product.enableSizes === false ? "" : size) &&
      item.color === (product.enableColors === false ? "" : color),
  );

  const selectedPrice = selectedVariant?.price ?? product.price;

  // Agar koi galat combination select ho gaya jo exist nahi karta, to stock 0 show hoga
  const selectedStock =
    product.variants && product.variants.length > 0
      ? (selectedVariant?.stock ?? 0)
      : product.stock;

  const variant = {
    variantId: selectedVariant?._id,
    size: product.enableSizes === false ? "" : size,
    color: product.enableColors === false ? "" : color,
  };

  const cartProduct = {
    ...product,
    price: selectedPrice,
    stock: selectedStock,
    // Yeh 4 nayi lines add ki gayi hain taaki Cart ko Size aur Color mil sake:
    size: product.enableSizes === false ? "" : size,
    color: product.enableColors === false ? "" : color,
    variantId: selectedVariant?._id,
    cartKey: `${product._id}-${size}-${color}`,
  };

  const addQuantity = () => {
    if (product.variants?.length && !selectedVariant) {
      setError("Choose an available variant before adding this product.");
      return false;
    }
    for (let i = 0; i < qty; i += 1) addToCart(cartProduct, variant);
    return true;
  };

  const startPurchase = () => {
    if (user) {
      if (addQuantity()) navigate("/cart");
      return;
    }
    setAuthError("");
    setAuthOpen(true);
  };

  const submitAuth = async (event) => {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    try {
      if (authMode === "login") await login(authForm.email, authForm.password);
      else await register(authForm);
      if (addQuantity()) {
        setAuthOpen(false);
        navigate("/cart");
      }
    } catch (err) {
      setAuthError(
        err.response?.data?.message || "Could not sign in. Please try again.",
      );
    } finally {
      setAuthBusy(false);
    }
  };

  return (
    <main className="container detail-page">
      <button className="back-link" onClick={() => window.history.back()}>
        <ArrowLeft size={16} /> Back to the collection
      </button>
      <div className="detail-grid">
        <div>
          <div className="detail-image">
            <img
              src={image || product.image}
              alt={product.name}
              onError={(event) => {
                event.currentTarget.src = product.image;
              }}
            />
          </div>
          {gallery.length > 1 && (
            <div className="detail-thumbnails">
              {gallery.map((src) => (
                <button
                  className={src === image ? "selected" : ""}
                  key={src}
                  onClick={() => setImage(src)}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="detail-copy">
          <div className="eyebrow">
            {product.category.toUpperCase()} · {product.subcategory} ·{" "}
            {product.brand}
          </div>
          <h1>{product.name}</h1>
          <div className="detail-rating">
            <Star fill="currentColor" size={16} /> {product.rating || 4.5}{" "}
            <span>·</span> {product.reviewCount || 0} reviews
          </div>
          <div className="detail-price">
            ₹{selectedPrice.toLocaleString("en-IN")}{" "}
            {product.originalPrice > selectedPrice && (
              <>
                <del>₹{product.originalPrice.toLocaleString("en-IN")}</del>
                <small>
                  {" "}
                  Save{" "}
                  {Math.round(
                    (1 - selectedPrice / product.originalPrice) * 100,
                  )}
                  %
                </small>
              </>
            )}
          </div>
          <p>{product.description}</p>

          {/* UPDATED VARIANT SECTION (ALAG ALAG SIZE AND COLOR BUTTONS) */}
          {product.variants && product.variants.length > 0 && (
            <>
              {/* SIZE BUTTONS */}
              {availableSizes.length > 0 && (
                <div className="variant-group">
                  <b>Select Size:</b>
                  <div className="variant-options">
                    {availableSizes.map((sizeOption) => (
                      <button
                        key={sizeOption}
                        type="button"
                        className={`variant-btn ${size === sizeOption ? "selected" : ""}`}
                        onClick={() => setSize(sizeOption)}
                      >
                        {sizeOption}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* COLOR BUTTONS */}
              {availableColors.length > 0 && (
                <div className="variant-group">
                  <b>Select Color:</b>
                  <div className="variant-options">
                    {availableColors.map((colorOption) => (
                      <button
                        key={colorOption}
                        type="button"
                        className={`variant-btn ${color === colorOption ? "selected" : ""}`}
                        onClick={() => setColor(colorOption)}
                      >
                        {colorOption}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="product-specs">
            <p>
              <b>Material:</b> {product.material || "Not specified"}
            </p>
            <p>
              <b>Care:</b> {product.care || "Follow the care label."}
            </p>
          </div>
          <p className="stock-note">
            {selectedStock > 0
              ? `${selectedStock} in stock · Ships in 2-4 working days`
              : "Currently out of stock (invalid combination or no stock)"}
          </p>
          <div className="detail-actions">
            <div className="quantity-control">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                aria-label="Decrease quantity"
              >
                <Minus size={15} />
              </button>
              <span>{qty}</span>
              <button
                onClick={() => setQty(Math.min(selectedStock, qty + 1))}
                disabled={qty >= selectedStock}
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>
            </div>
            <button
              className="btn btn-dark"
              disabled={!selectedStock}
              onClick={startPurchase}
            >
              <ShoppingBag size={18} /> Buy now · ₹
              {(selectedPrice * qty).toLocaleString("en-IN")}
            </button>
            <button
              className="btn btn-light"
              disabled={!selectedStock}
              onClick={addQuantity}
            >
              Add to bag
            </button>
            <button
              className={`icon-btn detail-wish ${liked ? "liked" : ""}`}
              onClick={() => toggleWishlist(product)}
              aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart fill={liked ? "currentColor" : "none"} />
            </button>
          </div>
          <div className="detail-perks">
            <span>✓ Secure checkout</span>
            <span>✓ Easy returns</span>
            <span>✓ Honest stock updates</span>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="related-section">
          <div className="section-heading">
            <h2>You may also like</h2>
          </div>
          <div className="product-grid">
            {related.map((item, index) => (
              <ProductCard key={item._id} product={item} index={index} />
            ))}
          </div>
        </section>
      )}
      {authOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="auth-modal" onSubmit={submitAuth}>
            <button
              type="button"
              className="icon-btn modal-close"
              onClick={() => setAuthOpen(false)}
              aria-label="Close"
            >
              <X />
            </button>
            <div className="eyebrow">CHECKOUT CONTINUES AFTER SIGN IN</div>
            <h2>
              {authMode === "login" ? "Welcome back." : "Create your account."}
            </h2>
            <p>Your selected variant and quantity will be preserved.</p>
            {authMode === "register" && (
              <label>
                Name
                <input
                  required
                  value={authForm.name}
                  onChange={(event) =>
                    setAuthForm({ ...authForm, name: event.target.value })
                  }
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                required
                value={authForm.email}
                onChange={(event) =>
                  setAuthForm({ ...authForm, email: event.target.value })
                }
              />
            </label>
            <label>
              Password
              <input
                type="password"
                minLength={8}
                required
                value={authForm.password}
                onChange={(event) =>
                  setAuthForm({ ...authForm, password: event.target.value })
                }
              />
            </label>
            {authError && <div className="form-error">{authError}</div>}
            <button className="btn btn-dark full" disabled={authBusy}>
              {authBusy
                ? "Please wait..."
                : authMode === "login"
                  ? "Sign in and continue"
                  : "Register and continue"}
            </button>
            <button
              type="button"
              className="switch-auth"
              onClick={() => {
                setAuthMode(authMode === "login" ? "register" : "login");
                setAuthError("");
              }}
            >
              {authMode === "login"
                ? "Need an account? Register"
                : "Already registered? Sign in"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
