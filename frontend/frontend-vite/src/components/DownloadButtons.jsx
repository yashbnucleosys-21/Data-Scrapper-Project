// components/DownloadButtons.jsx
import React from 'react';

const DownloadButtons = ({ resultsCount, loading }) => {
  if (resultsCount === 0) {
    return null; // Don't show if no results
  }

  const API_BASE = import.meta.env.VITE_API_URL;
  const DOWNLOAD_PATH = '/download'; // The separate download endpoint

  const handleDownload = (format) => {
    const url = `${API_BASE}${DOWNLOAD_PATH}/${format}`;
    
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank'; // Important for cross-origin downloads
    link.click();
    link.remove();
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