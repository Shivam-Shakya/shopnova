import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  UserRound,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import api from "../api";
import "./Header.css";

const menus = {
  Accessories: [],
  Kids: [],
  Men: [],
  Women: [],
};

export default function Header() {
  const { cartCount, user, logout } = useStore();
  const [categoryMenus, setCategoryMenus] = useState(menus);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  
  const close = () => {
    setOpen(false);
    setExpanded(null);
  };

  useEffect(() => {
    let active = true;
    api
      .get("/categories")
      .then(({ data }) => {
        if (!active || !Array.isArray(data) || !data.length) return;
        setCategoryMenus(
          Object.fromEntries(
            data.map((category) => [
              category.name,
              (category.subcategories || []).map((item) =>
                typeof item === "string" ? item : item.name,
              ),
            ]),
          ),
        );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="site-header">
      <div className="announcement">
        A little something for your everyday{" "}
        <span>✦ Free shipping over ₹1,999</span>
      </div>
      <div className="nav-wrap container">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark">s.</span> shopnova
        </Link>
        <nav
          className={open ? "nav-links open" : "nav-links"}
          aria-label="Main navigation"
        >
          <NavLink to="/" onClick={close}>
            Home
          </NavLink>
          {Object.entries(categoryMenus).map(([category, subcategories]) => (
            <div
              className="nav-menu"
              key={category}
              onMouseEnter={() => setExpanded(category)}
              onMouseLeave={() => setExpanded(null)}
            >
              <button
                className="nav-menu-trigger"
                aria-expanded={expanded === category}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(expanded === category ? null : category);
                }}
              >
                {category}
                <ChevronDown size={13} />
              </button>
              <div
                className={`mega-menu ${expanded === category ? "visible" : ""}`}
                role="menu"
              >
                <div className="mega-menu-heading">
                  <strong>{category}</strong>
                  <Link
                    to={`/category/${encodeURIComponent(category)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      close();
                    }}
                  >
                    View all
                  </Link>
                </div>
                <div className="mega-menu-grid">
                  {subcategories.map((subcategory) => (
                    <Link
                      role="menuitem"
                      key={subcategory}
                      to={`/category/${encodeURIComponent(category)}?subcategory=${encodeURIComponent(subcategory)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        close();
                      }}
                    >
                      {subcategory}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <NavLink to="/about" onClick={close}>
            About
          </NavLink>
          <NavLink to="/blog" onClick={close}>
            Blog
          </NavLink>
          <NavLink to="/contact" onClick={close}>
            Contact
          </NavLink>
        </nav>
        <div className="nav-actions">
          <button
            className="icon-btn search-toggle"
            aria-label="Search"
            onClick={() => document.querySelector("#product-search")?.focus()}
          >
            <Search size={19} />
          </button>
          <Link
            to={user ? "/account" : "/login"}
            className="icon-btn"
            aria-label="Account"
          >
            <UserRound size={19} />
          </Link>
          <Link to="/cart" className="icon-btn" aria-label="Shopping bag">
            <ShoppingBag size={20} />
            <span className="cart-count">{cartCount}</span>
          </Link>
          <button
            className="icon-btn mobile-menu"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}