import React from 'react';

const API_URL_BASE = 'http://localhost:5000/api/scrape/download';

const DownloadButtons = ({ resultsCount, loading }) => {
  if (resultsCount === 0) {
    return null;
  }

  const handleDownload = (format) => {
    const url = `${API_URL_BASE}/${format}`;
    
    // Create a temporary link element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank'; // Important for CORS compliance and opening the file stream
    link.click();
  };

  return (
    <div className="download-section">
      <p>Download Results:</p>
      <button 
        className="download-btn csv"
        onClick={() => handleDownload('csv')}
        disabled={loading}
      >
        ⬇️ Download CSV
      </button>
      {/* We'll use the CSV file for the "Excel" button, as Excel can open CSV */}
      <button 
        className="download-btn excel"
        onClick={() => handleDownload('excel')} 
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