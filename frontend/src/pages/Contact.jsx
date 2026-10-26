import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import './Contact.css';

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message Sent Successfully!");
  };

  return (
    <main className="container content-page">
      
      {/* 1. Hero Section */}
      <section className="content-hero">
        <span className="eyebrow">SUPPORT & INQUIRIES</span>
        <h1>
          Let's Get In <span>Touch</span>
        </h1>
        <p>
          Have a question about our products, your order, or just want to say hi? We'd love to hear from you. Fill out the form below and our team will get back to you shortly.
        </p>
      </section>

      {/* 2. Contact Content Layout */}
      <section className="contact-layout">
        
        {/* Left Side: Contact Info */}
        <div>
          <h2>Contact Information</h2>
          <p>We are here to help and answer any question you might have. We look forward to hearing from you.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '35px' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <Mail size={24} color="#848f67" />
              <div>
                <strong className="product-name" style={{ display: 'block' }}>Email Us</strong>
                <span className="section-subtitle">support@shopnova.com</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <Phone size={24} color="#848f67" />
              <div>
                <strong className="product-name" style={{ display: 'block' }}>Call Us</strong>
                <span className="section-subtitle">+91 98765 43210</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <MapPin size={24} color="#848f67" />
              <div>
                <strong className="product-name" style={{ display: 'block' }}>Visit Us</strong>
                <span className="section-subtitle">123 Innovation Drive, New Delhi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Unique Contact Form */}
        <div className="shopnova-contact-wrapper">
          <form className="shopnova-contact-form" onSubmit={handleSubmit}>
            <div className="shopnova-form-group">
              <label htmlFor="fullName">Full Name</label>
              <input 
                id="fullName"
                type="text" 
                className="shopnova-form-input"
                placeholder="John Doe" 
                required 
              />
            </div>

            <div className="shopnova-form-group">
              <label htmlFor="emailAddress">Email Address</label>
              <input 
                id="emailAddress"
                type="email" 
                className="shopnova-form-input"
                placeholder="john@example.com" 
                required 
              />
            </div>

            <div className="shopnova-form-group">
              <label htmlFor="message">Your Message</label>
              <textarea 
                id="message"
                className="shopnova-form-input shopnova-textarea"
                placeholder="How can we help you?" 
                rows="6"
                required
              ></textarea>
            </div>

            <button type="submit" className="shopnova-submit-btn">
              Send Message <Send size={16} />
            </button>
          </form>
        </div>

      </section>
    </main>
  );
}