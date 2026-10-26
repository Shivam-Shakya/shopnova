import React from 'react';
import './InfoPages.css';

export default function HelpCenter() {
  return (
    <main className="info-page-container">
      <div className="info-page-header">
        <h1>Help Center</h1>
        <p>How can we help you today?</p>
      </div>
      <div className="info-content">
        <section>
          <h2>Frequently Asked Questions</h2>
          <p><strong>Q: How do I track my order?</strong><br />
          A: Once your order is dispatched, you will receive a tracking link via email and SMS.</p>
          <p><strong>Q: Can I modify my order after placing it?</strong><br />
          A: Orders can only be modified within 2 hours of placement. Please contact support immediately.</p>
        </section>
        <section>
          <h2>Contact Support</h2>
          <p>If you couldn't find the answer to your question, our support team is ready to help.</p>
          <ul>
            <li><strong>Email:</strong> support@shopnova.com (Reply within 24 hours)</li>
            <li><strong>Phone:</strong> +91 1800-123-4567 (Mon-Sat, 9 AM - 6 PM)</li>
          </ul>
        </section>
      </div>
    </main>
  );
}