import React from 'react';
import './InfoPages.css';

export default function ReturnsExchanges() {
  return (
    <main className="info-page-container">
      <div className="info-page-header">
        <h1>Returns & Exchanges</h1>
        <p>Simple, no-fuss returns process.</p>
      </div>
      <div className="info-content">
        <section>
          <h2>Our 7-Day Return Policy</h2>
          <p>If you are not completely satisfied with your purchase, you can return or exchange the item within 7 days of delivery. Items must be unused, unwashed, and have original tags attached.</p>
        </section>
        <section>
          <h2>How to Initiate a Return</h2>
          <ol>
            <li>Log in to your account and go to "My Orders".</li>
            <li>Select the item you wish to return and click "Request Return".</li>
            <li>Pack the item securely. Our delivery partner will pick it up within 24-48 hours.</li>
          </ol>
        </section>
        <section>
          <h2>Refunds</h2>
          <p>Once we receive and inspect your return, refunds will be initiated to your original payment method within 5-7 business days.</p>
        </section>
      </div>
    </main>
  );
}