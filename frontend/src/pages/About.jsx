import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Truck, RefreshCcw } from 'lucide-react';
import './Contact.css';

export default function About() {
  return (
    <main>
      <div className="container content-page">
        {/* 1. Hero Section */}
        <section className="content-hero">
          <span className="eyebrow">OUR STORY</span>
          <h1>
            Everyday things.<br/>
            <span>Extraordinary feeling.</span>
          </h1>
          <p>
            Welcome to ShopNova. We are a premium fashion and lifestyle marketplace dedicated to curating pieces that perfectly fit into your everyday life. Quality, comfort, and elegance—delivered right to your doorstep.
          </p>
        </section>

        {/* 2. Mission & Vision (2-Column Grid) */}
        <section className="content-grid">
          <section>
            <h2>Our Mission</h2>
            <p>
              To provide a seamless shopping experience by offering thoughtfully designed products. We believe in quality over quantity, ensuring every item you purchase adds value, utility, and joy to your life.
            </p>
          </section>
          <section>
            <h2>Our Vision</h2>
            <p>
              To become the most trusted lifestyle destination where modern design meets everyday utility. We look for useful design, comfortable materials, and details that make a product feel just right.
            </p>
          </section>
        </section>
      </div>

      {/* 3. Core Values Section (Benefits Banner) */}
      <section className="benefits">
        <div className="container benefits-grid">
          <div>
            <Heart size={33} strokeWidth={1.5} color="#848f67" />
            <div>
              <b>Curated with Love</b>
              <small>Handpicked high-quality pieces</small>
            </div>
          </div>

          <div>
            <ShieldCheck size={33} strokeWidth={1.5} color="#848f67" />
            <div>
              <b>Secure Shopping</b>
              <small>Honest & customer-first</small>
            </div>
          </div>

          <div>
            <Truck size={33} strokeWidth={1.5} color="#848f67" />
            <div>
              <b>Fast Delivery</b>
              <small>On time, every time</small>
            </div>
          </div>

          <div>
            <RefreshCcw size={33} strokeWidth={1.5} color="#848f67" />
            <div>
              <b>Easy Returns</b>
              <small>Hassle-free exchanges</small>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Story CTA Section */}
      <section className="story-section">
        <div className="container story-grid">
          <div className="story-copy">
            <h2>Ready to upgrade your <span>everyday?</span></h2>
            <p>Explore our latest curated collections and find your new favorites today.</p>
            <Link to="/category/Women" className="btn btn-dark">
              Explore the Collection
            </Link>
          </div>
          
          <div className="story-image">
            <img src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&q=80&w=800" alt="ShopNova Collection" />
            <div className="story-image-tag">EST. 2026</div>
          </div>
        </div>
      </section>
    </main>
  );
}