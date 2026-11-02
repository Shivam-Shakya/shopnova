import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function ShopByCategories({ categoriesImg }) {
  return (
    <section id="shop" className="section container">
      <div className="section-heading">
        <div>
          <div className="eyebrow">EXPLORE COLLECTIONS</div>
          <h2>Shop by <span>Category.</span></h2>
        </div>
      </div>
      <div className="shop-by-cat-grid">
        {['Men', 'Women', 'Kids', 'Accessories'].map((cat, i) => (
          <Link key={i} to={`/category/${cat}`} className="cat-box-card">
            <img src={categoriesImg[i]} alt={cat} />
            <div className="cat-box-overlay">
              <h3>{cat}</h3>
              <span>Explore <ArrowUpRight size={16} /></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}