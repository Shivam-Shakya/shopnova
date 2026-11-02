import React from "react";
import { ArrowRight } from "lucide-react"; // Tumhara purana import[cite: 4]

export default function HeroCarousel({ bannerImages, currentBanner, setCurrentBanner }) {
  return (
    <section className="hero-carousel-section container">
      <div className="hero-carousel">
        {bannerImages.map((imgObj, idx) => (
          <div key={idx} className={`carousel-slide ${idx === currentBanner ? "active" : ""}`}>
            {/* Teeno devices ki images */}
            <img src={imgObj.desktop} alt={`Desktop Banner ${idx + 1}`} className="desktop-img" />
            <img src={imgObj.tablet} alt={`Tablet Banner ${idx + 1}`} className="tablet-img" />
            <img src={imgObj.mobile} alt={`Mobile Banner ${idx + 1}`} className="mobile-img" />
          </div>
        ))}
        <div className="carousel-dots">
          {bannerImages.map((_, idx) => (
            <span 
              key={idx} 
              className={idx === currentBanner ? "dot active" : "dot"} 
              onClick={() => setCurrentBanner(idx)} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}