import React, { useRef } from "react";
import tshirt from '../../assets/T-shirt.jpg';
import shirt from '../../assets/Shirt.jpg';
import jeans from '../../assets/Jeans.jpg';
import jackets from '../../assets/Jacket.jpg';
import trousers from '../../assets/Trouser.jpg';
import kurti from '../../assets/Kurti.jpg';
import saree from '../../assets/Saree.jpg';
import tops from '../../assets/Tops.jpg';
import sunglasses from '../../assets/Sunglasses.webp';
import wallets from '../../assets/Wallets.jpg';
import watch from '../../assets/Watches.jpg';
import shoes from '../../assets/Shose.jpg';
import jewellery from '../../assets/Jewellery.jpg';
import caps from '../../assets/Caps.jpg';
import belts from '../../assets/Belts.jpg';

const circleCategories = [
  { name: "T-shirts", parentCategory: "Men", icon: tshirt },
  { name: "Shirts", parentCategory: "Men", icon: shirt },
  { name: "Jeans", parentCategory: "Men", icon: jeans },
  { name: "Jackets", parentCategory: "Men", icon: jackets },
  { name: "Trousers", parentCategory: "Men", icon: trousers },
  { name: "Kurtis", parentCategory: "Women", icon: kurti },
  { name: "Sarees", parentCategory: "Women", icon: saree },
  { name: "Tops", parentCategory: "Women", icon: tops },
  { name: "Sunglasses", parentCategory: "Accessories", icon: sunglasses },
  { name: "Wallets", parentCategory: "Accessories", icon: wallets },
  { name: "Watches", parentCategory: "Accessories", icon: watch },
  { name: "Shoes", parentCategory: "Men", icon: shoes },
  { name: "Jewellery", parentCategory: "Accessories", icon: jewellery },
  { name: "Caps and Hats", parentCategory: "Accessories", icon: caps },
  { name: "Belts", parentCategory: "Accessories", icon: belts }
];

export default function CircularCategories() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="circular-categories-section">
      <div className="circular-categories-wrapper">
        
        {/* Left Button */}
        <button className="scroll-btn left-btn" onClick={() => scroll("left")}>
          &#8249;
        </button>

        {/* Categories Track */}
<div className="circular-categories-track" ref={scrollRef}>
  {circleCategories.map((cat, index) => (
    <div 
      key={index} 
      className="circle-cat-item" 
      onClick={() => window.location.href = `/category/${cat.parentCategory}?subcategory=${encodeURIComponent(cat.name)}`}
    >
      <div className="circle-img-wrap">
        <img src={cat.icon} alt={cat.name} />
      </div>
      <span>{cat.name}</span>
    </div>
  ))}
</div>

        {/* Right Button */}
        <button className="scroll-btn right-btn" onClick={() => scroll("right")}>
          &#8250;
        </button>

      </div>
    </section>
  );
}