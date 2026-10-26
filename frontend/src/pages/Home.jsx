import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  Search,
  Star
} from "lucide-react";
import api from "../api";
import ProductCard from "../components/ProductCard";
import "./Home.css"; /* Agar css file ka naam Home_2.css hai, to isko "./Home_2.css" kar lena */
import Men from "../assets/Men.png";
import Women from "../assets/Women.png";
import Kids from "../assets/Kids.png";
import Accessories from "../assets/Accesseries.png";
import HeroImage from "../assets/Hero-img.png";


const categories = [
  { name: "Men", label: "Wear your mood", image: Men },
  { name: "Women", label: "Made for your moments", image: Women },
  { name: "Kids", label: "Small styles, big joy", image: Kids },
  { name: "Accessories", label: "The finishing touch", image: Accessories },
];

const reviews = [
  { id: 1, name: "Aarav", initial: "A", role: "Verified Buyer", text: "The quality is absolutely phenomenal. I've bought three shirts and they all fit perfectly. The packaging felt like opening a gift." },
  { id: 2, name: "Priya", initial: "P", role: "Verified Buyer", text: "Finally, everyday wear that actually feels premium. The minimalist design of their accessories is exactly what my wardrobe was missing." },
  { id: 3, name: "Rohan", initial: "R", role: "Verified Buyer", text: "Customer service is top-notch. Exchanged a size without any hassle. The fabric feels amazing and retains shape even after washes." },
  { id: 4, name: "Neha", initial: "N", role: "Verified Buyer", text: "The shipping was incredibly fast. The summer collection is so breathable and comfortable for daily wear. Highly recommended!" },
  { id: 5, name: "Vikram", initial: "V", role: "Verified Buyer", text: "Bought a few pieces for my kids. The material is very durable and handles rough play really well. Will definitely buy more." },
  { id: 6, name: "Ananya", initial: "A", role: "Verified Buyer", text: "I've received so many compliments on the new dress. It's stylish, comfortable, and exactly as shown in the pictures online." },
  { id: 7, name: "Kabir", initial: "K", role: "Verified Buyer", text: "Great value for money. The stitching is flawless and it feels much more expensive than it actually is." },
  { id: 8, name: "Sneha", initial: "S", role: "Verified Buyer", text: "Love the eco-friendly packaging! It's great to see a brand that cares about sustainability without compromising on quality." },
  { id: 9, name: "Arjun", initial: "A", role: "Verified Buyer", text: "Washed the t-shirts multiple times now and the color hasn't faded one bit. Truly impressed with the longevity." },
  { id: 10, name: "Meera", initial: "M", role: "Verified Buyer", text: "The website checkout was smooth, and the size guide is very accurate. My order fit like a glove right out of the box." }
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("");
  const [error, setError] = useState("");
  
  const carouselRef = useRef(null);
  const reviewCarouselRef = useRef(null);

  // Ye function ek time par exactly 1 review card scroll karega
  const handleReviewScroll = (direction) => {
    if (reviewCarouselRef.current) {
      const firstCard = reviewCarouselRef.current.firstElementChild;
      const scrollAmount = firstCard ? firstCard.offsetWidth + 30 : 340;
      
      reviewCarouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get("/products", {
        params: { search: search || undefined, category: category === "All" ? undefined : category, sort: sort || undefined, limit: 30 },
      })
      .then((r) => { if (active) { setProducts(r.data.products || r.data); setError(""); } })
      .catch(() => { if (active) setError("Could not connect to the store API. Start the backend and MongoDB, then refresh."); })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [search, category, sort]);

  useEffect(() => {
    const autoScroll = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          carouselRef.current.scrollBy({ left: 303, behavior: "smooth" }); 
        }
      }
    }, 3000);
    return () => clearInterval(autoScroll);
  }, []);

  // Auto-scroll for Reviews Carousel
  useEffect(() => {
    const autoScrollReviews = setInterval(() => {
      if (reviewCarouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = reviewCarouselRef.current;
        
        // Sirf ek card ki width + 30px gap calculate karein
        const firstCard = reviewCarouselRef.current.firstElementChild;
        const scrollAmount = firstCard ? firstCard.offsetWidth + 30 : 340;

        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          reviewCarouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          reviewCarouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
      }
    }, 2000); 

    return () => clearInterval(autoScrollReviews);
  }, []);

  return (
    <main>
      {/* 1. HERO SECTION */}
      <section className="hero">
        <div className="hero-bg-orb orb-one" />
        <div className="hero-bg-orb orb-two" />
        <div className="container hero-grid">
          <motion.div className="hero-copy" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65 }}>
            <div className="eyebrow"><Sparkles size={15} /> YOUR EVERYDAY, ELEVATED</div>
            <h1>Good things.<br /><span>Great finds.</span></h1>
            <p>Little upgrades, big feelings. Discover the pieces that make everyday life feel a little more like you.</p>
            <div className="hero-buttons">
              <a href="#shop" className="btn btn-dark">Explore the collection <ArrowUpRight size={18} /></a>
              <a href="#story" className="text-link">A little about us <ArrowRight size={16} /></a>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack"><span>J</span><span>M</span><span>A</span><span>+</span></div>
              <div>
                <div className="proof-stars">★★★★★</div>
                <small>Loved by 1200+ happy shoppers</small>
              </div>
            </div>
          </motion.div>
          
          <motion.div className="hero-visual" initial={{ opacity: 0, scale: 0.94, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.8, delay: 0.15 }}>
            <div className="hero-image-main">
              <img src={HeroImage} alt="Curated fashion" />
            </div>
            <div className="floating-note note-top">
              <span>✳</span>
              <div><b>Curated with care</b><small>Thoughtful finds, always</small></div>
            </div>
            <div className="floating-note note-bottom">
              <div className="note-icon">↗</div>
              <div><b>Little joys, daily</b><small>Find your new favourite</small></div>
            </div>
            <div className="hero-sticker">MADE FOR<br />YOUR MOMENTS <ArrowDownRight size={20} /></div>
          </motion.div>
        </div>
      </section>

      {/* 2. PREMIUM MARQUEE (Subtle & High-end) */}
      <section className="premium-marquee">
        <div className="marquee-track">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              <span>FREE SHIPPING OVER ₹1,999 <i>✳</i></span>
              <span>SUSTAINABLY SOURCED <i>✳</i></span>
              <span>PREMIUM QUALITY <i>✳</i></span>
              <span>DESIGNED FOR EVERYDAY <i>✳</i></span>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* 3. BENEFITS */}
      <section className="benefits">
        <div className="container benefits-grid">
          <div><Truck /><span><b>Free shipping</b><small>On orders over ₹1,999</small></span></div>
          <div><ShieldCheck /><span><b>Secure checkout</b><small>Your details stay safe</small></span></div>
          <div><RotateCcw /><span><b>Easy returns</b><small>Simple, no-fuss process</small></span></div>
          <div><Sparkles /><span><b>Handpicked finds</b><small>Quality meets everyday</small></span></div>
        </div>
      </section>

      {/* 4. CATEGORIES */}
      <section id="categories" className="section container">
        <div className="section-heading">
          <div>
            <div className="eyebrow">A LITTLE BIT OF EVERYTHING</div>
            <h2>Browse by <span>your vibe.</span></h2>
          </div>
          <a className="text-link" href="#shop">Explore all categories <ArrowRight size={17} /></a>
        </div>
        <div className="category-grid">
          {categories.map((c, i) => (
            <motion.button key={c.name} className={`category-tile cat-${i}`} onClick={() => { setCategory(c.name); document.querySelector("#shop")?.scrollIntoView({ behavior: "smooth" }); }} whileHover={{ y: -5 }}>
              <img src={c.image} alt={c.name} />
              <div className="category-overlay" />
              <div className="category-label"><small>{c.label}</small><h3>{c.name}</h3></div>
              <span className="category-arrow"><ArrowUpRight size={20} /></span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* 5. SHOP / PRODUCT GRID */}
      <section id="shop" className="section shop-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <div className="eyebrow">THE GOOD STUFF</div>
              <h2>Find your <span>new favourite.</span></h2>
            </div>
            <div className="shop-search">
              <Search size={17} />
              <input id="product-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." />
            </div>
          </div>
          <div className="product-controls">
            <div className="filter-chips">
              {["All", "Men", "Women", "Kids", "Accessories"].map((c) => (
                <button key={c} className={category === c ? "active" : ""} onClick={() => setCategory(c)}>{c}</button>
              ))}
            </div>
            <select aria-label="Sort products" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="">Sort: Featured</option>
              <option value="newest">Newest</option>
              <option value="priceAsc">Price: Low to high</option>
              <option value="priceDesc">Price: High to low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
          
          {loading ? (
            <div className="product-grid">{[1, 2, 3, 4, 5, 6].map((n) => <div className="skeleton" key={n} />)}</div>
          ) : products.length ? (
            <div className="product-grid">{products.slice(0, 8).map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}</div>
          ) : (
            <div className="empty-state">
              <h3>No finds just yet</h3><p>Try another search or category.</p>
              <button className="btn btn-dark" onClick={() => { setSearch(""); setCategory("All"); }}>Clear filters</button>
            </div>
          )}
        </div>
      </section>

      {/* 6. SPOTLIGHT (Editorial Style Offer) */}
      <section className="spotlight-section">
        <div className="container spotlight-grid">
          <div className="spotlight-image">
            <img src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=90" alt="Capsule Collection" />
            <div className="spotlight-badge">LIMITED ARCHIVE</div>
          </div>
          <div className="spotlight-content">
            <div className="eyebrow">THE CAPSULE COLLECTION</div>
            <h2>Elevate your<br /><span>everyday.</span></h2>
            <p>An exclusive curation of our most loved minimalist essentials. Redefined silhouettes, premium fabrics, and timeless design. Available for a strictly limited time.</p>
            
            <div className="timer-grid">
              <div className="timer-item"><b>48</b><small>HOURS</small></div>
              <div className="timer-item"><b>15</b><small>MINS</small></div>
              <div className="timer-item"><b>30</b><small>SECS</small></div>
            </div>

            <Link to="/category/Men" className="btn btn-dark" style={{ padding: '0 30px', minHeight: '52px' }}>
              Shop The Capsule <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FRESH FINDS CAROUSEL */}
      {!loading && !error && products.length > 8 && (
        <section className="section carousel-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <div className="eyebrow">A LITTLE MORE TO LOVE</div>
                <h2>Fresh <span>finds.</span></h2>
              </div>
            </div>
            <div className="carousel-wrapper">
              <button className="nav-arrow left-arrow" onClick={() => carouselRef.current?.scrollBy({ left: -320, behavior: "smooth" })}>←</button>
              <div className="product-carousel" ref={carouselRef}>
                {products.filter((product) => !products.slice(0, 8).some((mainProduct) => mainProduct._id === product._id)).slice(0, 10).map((product, index) => 
                  <div className="carousel-card" key={product._id}><ProductCard product={product} index={index} /></div>
                )}
              </div>
              <button className="nav-arrow right-arrow" onClick={() => carouselRef.current?.scrollBy({ left: 320, behavior: "smooth" })}>→</button>
            </div>
          </div>
        </section>
      )}

      {/* 8. STORY SECTION */}
      <section id="story" className="story-section">
        <div className="container story-grid">
          <div className="story-image">
            <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=85" alt="Curated store" />
            <div className="story-image-tag">A GOOD FIND<br />FEELS DIFFERENT.</div>
          </div>
          <div className="story-copy">
            <div className="eyebrow">NOT JUST MORE STUFF</div>
            <h2>Everyday things.<br /><span>Extraordinary feeling.</span></h2>
            <p>We believe the best finds aren't always the biggest. They're the things you reach for every day, the details that make you smile...</p>
            <Link to="/about" className="btn btn-dark">Get to know ShopNova <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>

      {/* 9. COMMUNITY REVIEWS (Premium Cards & Carousel) */}
      <section className="community-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <div className="eyebrow">WORD ON THE STREET</div>
              <h2>Loved by <span>our community.</span></h2>
            </div>
          </div>
          
          <div className="carousel-wrapper">
            <button className="nav-arrow left-arrow" onClick={() => handleReviewScroll("left")}>←</button>
            <div className="review-carousel" ref={reviewCarouselRef}>
              {reviews.map((review) => (
                <div key={review.id} className="review-card new-design">
                  <div className="quote-mark">"</div>
                  <div className="review-stars">
                    {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" strokeWidth={0} />)}
                  </div>
                  <div className="review-text">{review.text}</div>
                  <div className="review-author">
                    <div className="review-avatar">{review.initial}</div>
                    <div className="review-author-info">
                      <b>{review.name}</b>
                      <small>{review.role}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="nav-arrow right-arrow" onClick={() => handleReviewScroll("right")}>→</button>
          </div>
        </div>
      </section>

      {/* 10. NEWSLETTER (Premium Dark Card Design) */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-card">
            <div className="newsletter-content">
              <div className="eyebrow">STAY IN THE LOOP</div>
              <h2>Join the <span>Inner Circle.</span></h2>
              <p>Exclusive drops, early access, and a little bit of magic in your inbox. No spam, just the good stuff.</p>
              
              <form onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing!"); }}>
                <div className="input-group">
                  <input type="email" placeholder="Enter your email address..." required />
                  <button type="submit">Subscribe <ArrowRight size={17} /></button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}