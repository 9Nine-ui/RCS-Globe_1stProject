import React from 'react';
// We no longer need 'Link' from react-router-dom

// NEW: Add 'onClick' and 'isActive' props
function Card({ title, value, stats, onClick, isActive }) {
  return (
    // MODIFIED: This is now a div with an onClick handler
    <div 
      className={`card ${isActive ? 'active' : ''}`} // Add 'active' class
      onClick={onClick}
      role="button"
      tabIndex="0"
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <h3>{title}</h3>
      <p className="value">{value}</p>
      <div className={`stats ${stats.trend}`}>
        <span className="arrow">{stats.arrow}</span>
        <span className="percentage">{stats.percentage}</span>
      </div>
    </div>
  );
}

export default Card;