import React from 'react';
import './InfoPages.css';

export default function ShippingDelivery() {
  return (
    <main className="info-page-container">
      <div className="info-page-header">
        <h1>Shipping & Delivery</h1>
        <p>Everything you need to know about getting your order.</p>
      </div>
      <div className="info-content">
        <section>
          <h2>Shipping Costs & Timelines</h2>
          <ul>
            <li><strong>Standard Delivery:</strong> Free for orders over ₹1,999. Usually takes 3-5 business days.</li>
            <li><strong>Express Delivery:</strong> ₹150 flat rate. Delivered within 1-2 business days.</li>
          </ul>
        </section>
        <section>
          <h2>Order Processing</h2>
          <p>All orders are processed within 24 hours. Orders placed on Sundays or public holidays will be dispatched on the next working day.</p>
        </section>
        <section>
          <h2>International Shipping</h2>
          <p>Currently, we only ship within India. We are working on expanding our reach globally soon!</p>
        </section>
      </div>
    </main>
  );
}