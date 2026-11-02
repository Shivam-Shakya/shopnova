import React from "react";
import ProductCard from "../../components/ProductCard";

export default function MenClothesSection({ loading, menProducts = [] }) {
  return (
    <section className="section container">
      <div className="section-heading">
        <div>
          <div className="eyebrow">EXCLUSIVE LINE</div>
          <h2>Men <span>Clothes.</span></h2>
        </div>
      </div>
      {loading ? (
        <p>Loading men's products...</p>
      ) : (
        <div className="product-grid">
          {/* Optional chaining (?.) lagane se agar data undefined hoga toh error nahi aayega */}
          {menProducts?.slice(0, 8).map((p, i) => (
            <ProductCard key={p._id || i} product={p} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}