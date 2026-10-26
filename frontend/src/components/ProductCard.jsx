import { motion } from "framer-motion";
import { Heart, Plus, Star } from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";
import { useStore } from "../context/StoreContext";
export default function ProductCard({ product, index = 0 }) {
  const { addToCart, wishlist, toggleWishlist } = useStore();
  const liked = wishlist.some((item) => item._id === product._id);
  return (
    <motion.article
      className="product-card"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.06 }}
      whileHover={{ y: -5 }}
    >
      <div className="product-image-wrap">
        <Link to={`/product/${product.slug || product._id}`}>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=900&q=80";
            }}
          />
        </Link>
        {product.originalPrice > product.price && (
          <span className="sale-badge">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </span>
        )}
        <button
          className={`wish-btn ${liked ? "liked" : ""}`}
          onClick={() => toggleWishlist(product)}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={17} fill={liked ? "currentColor" : "none"} />
        </button>
        <button
          className="quick-add"
          onClick={() => addToCart(product)}
          disabled={!product.stock}
        >
          <Plus size={17} />
          <span>{product.stock ? "Quick add" : "Sold out"}</span>
        </button>
      </div>
      <div className="product-info">
        <div className="product-category">{product.category}</div>{" "}
        <Link
          to={`/product/${product.slug || product._id}`}
          className="product-name"
        >
          {product.name}
        </Link>
        <div className="product-bottom">
          <div className="price-line">
            <strong>₹{product.price.toLocaleString("en-IN")}</strong>
            {product.originalPrice > product.price && (
              <del>₹{product.originalPrice.toLocaleString("en-IN")}</del>
            )}
          </div>
          <span className="rating">
            <Star size={13} fill="currentColor" /> {product.rating || 4.5}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
