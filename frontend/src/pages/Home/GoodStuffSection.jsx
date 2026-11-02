import React from "react";
import { Search } from "lucide-react";
import ProductCard from "../../components/ProductCard";

export default function GoodStuffSection({ 
  searchQuery, 
  setSearchQuery, 
  activeCategory, 
  setActiveCategory, 
  sortBy, 
  setSortBy, 
  loading, 
  filteredProducts 
}) {
  return (
    <section className="section container">
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE GOOD STUFF</span>
          <h2>Find your <span>new favourite.</span></h2>
        </div>
        
        <div className="good-stuff-search">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="good-stuff-filters-row">
        <div className="filter-tabs-group">
          {['All', 'Men', 'Women', 'Kids', 'Accessories'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`filter-tab-btn ${activeCategory === cat ? 'active' : 'inactive'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select-box"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.slice(0, 8).map((p, i) => (
              <ProductCard key={p._id || i} product={p} index={i} />
            ))
          ) : (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#666", padding: "30px 0" }}>No products found matching your filter.</p>
          )}
        </div>
      )}
    </section>
  );
}