import React from "react";
import { Star } from "lucide-react";

const reviews = [
  { 
    id: 1, 
    name: "Aarav", 
    image: "https://i.pravatar.cc/150?img=11", 
    role: "Verified Buyer", 
    text: "The quality is absolutely phenomenal. I've bought three shirts and they all fit perfectly." 
  },
  { 
    id: 2, 
    name: "Priya", 
    image: "https://i.pravatar.cc/150?img=5", 
    role: "Verified Buyer", 
    text: "Finally, everyday wear that actually feels premium. Highly recommended!" 
  },
  { 
    id: 3, 
    name: "Rohan", 
    image: "https://i.pravatar.cc/150?img=12", 
    role: "Verified Buyer", 
    text: "Customer service is top-notch. Exchanged a size without any hassle." 
  },
  { 
    id: 4, 
    name: "Aisha", 
    image: "https://i.pravatar.cc/150?img=6", 
    role: "Verified Buyer", 
    text: "The quality is absolutely phenomenal. I've bought three shirts and they all fit perfectly." 
  },
  { 
    id: 5, 
    name: "Priya", 
    image: "https://i.pravatar.cc/150?img=5", 
    role: "Verified Buyer", 
    text: "Finally, everyday wear that actually feels premium. Highly recommended!" 
  },
];

export default function ReviewsSection() {
  return (
    <section className="section container">
      <div className="section-heading">
      <div>
        <div className="eyebrow">FEEDBACK</div>
        <h2>
          Loved by <span>Our Community.</span>
        </h2>
      </div>
      </div>
      
      <div className="review-carousel">
        {reviews.map((r) => (
          <div key={r.id} className="review-card-custom">
            
            {/* User Profile Header */}
            <div className="review-header">
              <div className="review-avatar">
                <img src={r.image} alt={r.name} />
              </div>
              <div className="review-user-info">
                <h4>{r.name}</h4>
                <span>{r.role}</span>
              </div>
            </div>
            
            {/* Rating Stars */}
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="#f5c518" color="#f5c518" strokeWidth={0} />
              ))}
            </div>
            
            {/* Review Text */}
            <p className="review-text">"{r.text}"</p>
            
          </div>
        ))}
      </div>
    </section>
  );
}