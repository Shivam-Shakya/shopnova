import React from "react";
import "./LoadingSpinner.css";
// --- GOL (CIRCULAR) LOADING COMPONENT ---
function LoadingSpinner() {
  return (
    <div className="circular-loader-wrapper">
      <div className="gole-spinner"></div>
      <p className="loader-text">Loading store data...</p>
    </div>
  );
}

export default LoadingSpinner;