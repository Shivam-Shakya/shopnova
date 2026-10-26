import React from 'react';
import './InfoPages.css';

export default function PrivacyPolicy() {
  return (
    <main className="info-page-container">
      <div className="info-page-header">
        <h1>Privacy Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
      <div className="info-content">
        <section>
          <h2>Data Collection</h2>
          <p>We collect information you provide directly to us when you create an account, make a purchase, or contact customer support. This includes your name, email, phone number, and shipping address.</p>
        </section>
        <section>
          <h2>How We Use Your Data</h2>
          <ul>
            <li>To process and fulfill your orders.</li>
            <li>To send tracking updates and order confirmations.</li>
            <li>To improve our website and customer service.</li>
          </ul>
        </section>
        <section>
          <h2>Data Protection</h2>
          <p>We use industry-standard encryption to protect your personal and payment details. We do not sell or share your data with third parties for marketing purposes.</p>
        </section>
      </div>
    </main>
  );
}