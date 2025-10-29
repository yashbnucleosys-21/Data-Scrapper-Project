// components/ScrapeButton.jsx
import React from 'react';

const ScrapeButton = ({ keywords, loading, handleScrape, error }) => {
  const isScrapeDisabled = loading || keywords.length === 0;

  return (
    <div className="scrape-button-section">
      <button 
        className="scrape-btn"
        onClick={handleScrape}
        disabled={isScrapeDisabled}
      >
        {loading ? 'Scraping...' : '🚀 Scrape for Display'}
      </button>
      {error && <p className="error-message">Error: {error}</p>}
    </div>
  );
};

export default ScrapeButton;