import React from "react";
import { Truck, ShieldCheck, RotateCcw } from "lucide-react";

export default function CustomerSupport() {
  return (
    <section className="customer-support-section">
      <div className="container support-grid">
        <div className="support-item">
          <Truck size={36} strokeWidth={1.2} className="support-icon" />
          <h4>Free Shipping</h4>
          <p>On orders over ₹1,999</p>
        </div>
        <div className="support-item">
          <ShieldCheck size={36} strokeWidth={1.2} className="support-icon" />
          <h4>24/7 Support</h4>
          <p>Dedicated customer assistance</p>
        </div>
        <div className="support-item">
          <RotateCcw size={36} strokeWidth={1.2} className="support-icon" />
          <h4>Easy Returns</h4>
          <p>Hassle-free return policy</p>
        </div>
      </div>
    </section>
  );
}