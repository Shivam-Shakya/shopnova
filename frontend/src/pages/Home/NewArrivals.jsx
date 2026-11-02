import React from "react";
import ProductCard from "../../components/ProductCard";

export default function NewArrivals({ loading, products }) {
  return (
    <section className="section container">
      <div className="section-heading">
        <div>
          <div className="eyebrow">JUST DROPPED</div>
          <h2>New <span>Arrivals.</span></h2>
        </div>
      </div>
      {loading ? (
        <p>Loading new arrivals...</p>
      ) : (
        <div className="product-grid">
          {products.slice(0, 8).map((p, i) => (
            <ProductCard key={p._id || i} product={p} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}