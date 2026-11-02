import React, { useEffect, useState } from "react";
import api from "../api";
import "./Home.css";

// Import modular components
import CircularCategories from "./Home/CircularCategories";
import CustomerSupport from "./Home/CustomerSupport";
import GoodStuffSection from "./Home/GoodStuffSection";
import HeroCarousel from "./Home/HeroCarousel";
import MenClothesSection from "./Home/MenClothesSection";
import NewArrivals from "./Home/NewArrivals";
import PromoBanner from "./Home/PromoBanner";
import ReviewsSection from "./Home/ReviewsSection";
import ShopByCategories from "./Home/ShopByCategories";

// Banner image for all device
import Banner1 from "../assets/Banner1.png";
import Banner1Tablet from "../assets/51.png";
import Banner1Mobile from "../assets/111.png";

import Banner2 from "../assets/Banner2.png";
import Banner2Tablet from "../assets/52.png";
import Banner2Mobile from "../assets/112.png";

import Banner3 from "../assets/Banner3.png";
import Banner3Tablet from "../assets/53.png";
import Banner3Mobile from "../assets/113.png";

import Banner4 from "../assets/Banner4.png";
import Banner4Tablet from "../assets/54.png";
import Banner4Mobile from "../assets/114.png";

import Banner5 from "../assets/Banner5.png";
import Banner5Tablet from "../assets/55.png";
import Banner5Mobile from "../assets/115.png";

import Banner6 from "../assets/Banner6.png";
import Banner6Tablet from "../assets/56.png";
import Banner6Mobile from "../assets/116.png";


import img1 from "../assets/1.png";
import img2 from "../assets/3.png";
import img3 from "../assets/2.png";
import img4 from "../assets/4.png";

const bannerImages = [
  { desktop: Banner1, tablet: Banner1Tablet, mobile: Banner1Mobile },
  { desktop: Banner2, tablet: Banner2Tablet, mobile: Banner2Mobile },
  { desktop: Banner3, tablet: Banner3Tablet, mobile: Banner3Mobile },
  { desktop: Banner4, tablet: Banner4Tablet, mobile: Banner4Mobile },
  { desktop: Banner5, tablet: Banner5Tablet, mobile: Banner5Mobile },
  { desktop: Banner6, tablet: Banner6Tablet, mobile: Banner6Mobile },
];

const categoriesImg = [
  img1,
  img2,
  img3,
  img4,
]

export default function Home() {
  const [products, setProducts] = useState([]);
  const [randomizedProducts, setRandomizedProducts] = useState([]); // Random list ke liye new state
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get("/products")
      .then((r) => { 
        if (active) {
          const allProds = r.data.products || r.data;
          setProducts(allProds);
          
          const shuffled = [...allProds].sort(() => 0.5 - Math.random());
          setRandomizedProducts(shuffled);
        } 
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const filteredProducts = randomizedProducts.filter(p => {
    const matchesCategory = activeCategory === "All" || p.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
    if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
    return 0; 
  });

  const latestProducts = [...products].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : a._id;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : b._id;
    if (dateA < dateB) return 1;
    if (dateA > dateB) return -1;
    return 0;
  });

  const menProducts = products.filter(p => p.category?.toLowerCase() === 'men');

  return (
    <main className="shopnova-home">
      <CircularCategories />
      <HeroCarousel bannerImages={bannerImages} currentBanner={currentBanner} setCurrentBanner={setCurrentBanner} />
      <ShopByCategories categoriesImg={categoriesImg} />
      
      <GoodStuffSection 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        loading={loading}
        filteredProducts={filteredProducts} 
      />
      
      <NewArrivals loading={loading} products={latestProducts} />
      
      <PromoBanner bannerImages={bannerImages} />
      <MenClothesSection loading={loading} menProducts={menProducts} />
      <ReviewsSection />
      <CustomerSupport />
    </main>
  );
}