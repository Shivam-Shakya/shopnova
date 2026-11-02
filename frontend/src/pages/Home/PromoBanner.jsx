import React from "react";
import { ArrowRight } from "lucide-react";
import offerBanner from "../../assets/Banner11.png";
import offerBannerTablet from "../../assets/57.png";
import offerBannerMobile from "../../assets/117.png";

export default function PromoBanner() {
  return (
    <section className="container promo-banner-section">
      <img src={offerBanner} alt="Promo Banner" className="promo-img"/>
      <img src={offerBannerTablet} alt="Promo Banner" className="promo-img-tablet"/>
      <img src={offerBannerMobile} alt="Promo Banner" className="promo-img-mobile"/>
    </section>
  );
}