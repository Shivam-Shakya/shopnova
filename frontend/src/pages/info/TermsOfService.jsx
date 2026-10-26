import React from 'react';
import './InfoPages.css';

export default function TermsOfService() {
  return (
    <main className="info-page-container">
      <div className="info-page-header">
        <h1>Terms of Service</h1>
        <p>Please read these terms carefully before using ShopNova.</p>
      </div>
      <div className="info-content">
        <section>
          <h2>General Conditions</h2>
          <p>By using our website, you agree to these terms. We reserve the right to refuse service to anyone for any reason at any time.</p>
        </section>
        <section>
          <h2>Products and Pricing</h2>
          <p>Prices for our products are subject to change without notice. We reserve the right to modify or discontinue any product at any time. We make every effort to display colors and images accurately, but cannot guarantee your monitor's display will be completely accurate.</p>
        </section>
        <section>
          <h2>User Comments and Feedback</h2>
          <p>If you submit reviews or comments, you agree that we may edit, copy, publish, and distribute them in any medium without restriction.</p>
        </section>
      </div>
    </main>
  );
}