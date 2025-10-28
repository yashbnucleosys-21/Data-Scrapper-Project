import React from "react";

const ScrapeButton = ({ keywords, loading, handleScrape, error }) => {
  const isDisabled = loading || keywords.length === 0;

  return (
    <div className="scrape-section">
      <button
        className={`scrape-btn ${loading ? "loading" : ""}`}
        onClick={handleScrape}
        disabled={isDisabled}
      >
        {loading
          ? "⏳ Scraping in progress..."
          : `🚀 Start Scraping (${keywords.length} keywords)`}
      </button>

      {error && <p className="error-banner">⚠️ {error}</p>}
    </div>
  );
};

export default ScrapeButton;
