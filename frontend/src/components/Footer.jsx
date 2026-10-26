import React from "react";
import { Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        {/* Column 1: Brand & Socials */}
        <div className="footer-brand-col">
          <a href="/" className="brand footer-brand">
            <span className="brand-mark">s.</span> shopnova
          </a>
          <p>
            Premium finds for your everyday life. Elevating your wardrobe and home with quality and effortless style.
          </p>
          <div className="social-icons">
            <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="#" aria-label="Facebook"><Facebook size={18} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={18} /></a>
            <a href="#" aria-label="Youtube"><Youtube size={18} /></a>
          </div>
        </div>

        {/* Column 2: Shop Categories */}
        <div className="footer-links">
          <b>Shop</b>
          <a href="/category/Men">Men's Collection</a>
          <a href="/category/Women">Women's Collection</a>
          <a href="/category/Kids">Kids & Baby</a>
          <a href="/category/Accessories">Accessories</a>
          <a href="#shop">New Arrivals</a>
        </div>

        {/* Column 3: Customer Support */}
        <div className="footer-links">
          <b>Customer Service</b>
          <a href="/help-center">Help Center</a>
          <a href="/account">Track Your Order</a>
          <a href="/shipping-delivery">Shipping & Delivery</a>
          <a href="/returns-exchanges">Returns & Exchanges</a>
          <a href="/contact">Contact Us</a>
        </div>

        {/* Column 4: Company Info */}
        <div className="footer-links">
          <b>Company</b>
          <a href="/about">About Us</a>
          <a href="/blog">Blog</a>
          <a href="/privacy-policy">Privacy Policy</a>
          <a href="/terms-of-service">Terms of Service</a>
        </div>
      </div>

      {/* Footer Bottom: Copyright & Payment Badges */}
      <div className="container footer-bottom">
        <div className="copyright">
          © {new Date().getFullYear()} ShopNova. All rights reserved.
        </div>
        <div className="payment-methods">
         <span className="pay-badge">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" />
          </span>
          <span className="pay-badge">
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" />
          </span>
          <span className="pay-badge">
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="American Express" />
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;