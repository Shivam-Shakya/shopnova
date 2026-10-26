import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import api from "../api";
import ProductCard from "../components/ProductCard";
import './CategoryListing.css';

export default function CategoryListing() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const subcategory = searchParams.get("subcategory") || "";
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get("/products", {
        params: {
          category: decodeURIComponent(category),
          subcategory: subcategory || undefined,
          search: query || undefined,
          sort: sort || undefined,
          page,
        },
      })
      .then(({ data }) => {
        if (!active) return;
        setProducts((old) =>
          page === 1
            ? data.products || data
            : [...old, ...(data.products || data)],
        );
        setPages(data.pagination?.pages || 1);
      })
      .catch(
        (err) =>
          active &&
          setError(
            err.response?.data?.message || "Could not load this category.",
          ),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [category, subcategory, query, sort, page]);
  useEffect(() => setPage(1), [category, subcategory, query, sort]);
  return (
    <main className="section shop-section category-page">
      <div className="container">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <div className="section-heading category-heading">
          <div>
            <div className="eyebrow">
              SHOPNOVA COLLECTION{subcategory ? ` / ${subcategory}` : ""}
            </div>
            <h1>{subcategory || category}</h1>
            <p className="section-subtitle">
              Thoughtful pieces selected for your everyday.
            </p>
          </div>
          <div className="shop-search">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search this collection"
              aria-label="Search collection"
            />
          </div>
        </div>
        <div className="product-controls">
          <span>{products.length} finds</span>
          <select
            aria-label="Sort products"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="">Sort: Recommended</option>
            <option value="priceAsc">Price: Low to high</option>
            <option value="priceDesc">Price: High to low</option>
            <option value="rating">Highest rated</option>
            <option value="newest">Newest arrivals</option>
          </select>
        </div>
        {error ? (
          <div className="empty-state">
            <h2>Collection unavailable</h2>
            <p>{error}</p>
          </div>
        ) : loading && page === 1 ? (
          <div className="product-grid">
            {[1, 2, 3, 4].map((n) => (
              <div className="skeleton" key={n} />
            ))}
          </div>
        ) : products.length ? (
          <>
            <div className="product-grid">
              {products.map((product, index) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  index={index}
                />
              ))}
            </div>
            {page < pages && (
              <div className="section-actions">
                <button
                  className="btn btn-light"
                  onClick={() => setPage((value) => value + 1)}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load more products"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <h2>No finds yet</h2>
            <p>Try a different search or browse another collection.</p>
          </div>
        )}
      </div>
    </main>
  );
}
