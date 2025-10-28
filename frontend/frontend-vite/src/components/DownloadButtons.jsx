import React from 'react';

const DownloadButtons = ({ resultsCount, loading }) => {
  if (resultsCount === 0) {
    return null;
  }

  // Use the VITE_API_URL environment variable to get the base URL
  // Example: https://data-scrapper-project.onrender.com/api/scrape
  const API_BASE = import.meta.env.VITE_API_URL;
  
  // The specific path for downloading files on your backend
  const DOWNLOAD_PATH = '/download';

  const handleDownload = (format) => {
    // Constructs the full URL for the download endpoint
    // Example: https://data-scrapper-project.onrender.com/api/scrape/download/csv
    const url = `${API_BASE}${DOWNLOAD_PATH}/${format}`;
    
    // Create a temporary link element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    
    // Important for cross-origin downloads from a browser link click
    link.target = '_blank'; 
    
    link.click();
    link.remove(); // Clean up the temporary element
  };

  return (
    <div className="download-section">
      <h3>Download Results:</h3>
      <button 
        className="download-btn csv"
        onClick={() => handleDownload('csv')}
        disabled={loading}
      >
        ⬇️ Download CSV
      </button>
      {/* We use CSV endpoint, but label it for Excel users */}
      <button 
        className="download-btn excel"
        onClick={() => handleDownload('csv')} // Still calls the CSV endpoint
        disabled={loading}
      >
        ⬇️ Download Excel (CSV)
      </button>
      <button 
        className="download-btn json"
        onClick={() => handleDownload('json')}
        disabled={loading}
      >
        ⬇️ Download JSON
      </button>
    </div>
  );
};

export default DownloadButtons;