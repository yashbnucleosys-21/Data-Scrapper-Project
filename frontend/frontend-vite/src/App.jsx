import React, { useState, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import KeywordInputForm from './components/KeywordInputForm.jsx';
// REMOVED: import ScrapeButton from './components/ScrapeButton.jsx'; // We'll integrate this logic
import ResultsTable from './components/ResultsTable.jsx';
// REMOVED: import DownloadButtons from './components/DownloadButtons.jsx'; // <-- No longer needed

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [keywords, setKeywords] = useState([]);
  const [limit, setLimit] = useState(20); 
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- NEW: handleScrape function modified for direct download ---
  const handleScrape = useCallback(async (downloadFormat = null) => { // <-- MODIFIED: Added downloadFormat parameter
    if (keywords.length === 0) {
      setError('Please add at least one keyword.');
      return;
    }

    setLoading(true);
    setError(null);
    if (!downloadFormat) { // Clear results only if we're displaying, not downloading
        setResults([]);
    }

    try {
      const config = {
          responseType: downloadFormat ? 'blob' : 'json', // <-- CRITICAL: Expect blob for download
          // If you need to handle credentials, uncomment the next line:
          // withCredentials: true,
      };

      const response = await axios.post(API_URL, { keywords, limit, downloadFormat }, config); // <-- MODIFIED: Added downloadFormat

      if (downloadFormat) {
          // --- Handle Direct Download ---
          const blob = new Blob([response.data], { type: response.headers['content-type'] });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          
          // Get filename from Content-Disposition header if available, otherwise default
          const contentDisposition = response.headers['content-disposition'];
          let filename = `lead_scrape_results_${new Date().toISOString().slice(0, 10)}.${downloadFormat}`;
          if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
              filename = contentDisposition.split('filename=')[1].split(';')[0].replace(/"/g, '');
          }

          link.href = url;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url); // Clean up the object URL
          
          console.log(`Downloaded ${filename}`);

          // Optionally, refetch data for display if download was done, or keep existing display
          // For simplicity, we'll keep the results empty if a download was just triggered
          setResults([]); 

      } else {
          // --- Handle Displaying Results (Original Logic) ---
          setResults(response.data.data);
          console.log('Scraping successful:', response.data.message);
      }
    } catch (err) {
      console.error('Scraping Error:', err);
      setError(
        err.response?.data?.message || 
        'Failed to connect to the backend server. Is the backend running on port 5000?'
      );
    } finally {
      setLoading(false);
    }
  }, [keywords, limit]); 

  return (
    <div className="app-container">
      <h1>Business Lead Scraper 🕵️‍♀️</h1>
      
      {/* 1. Input and Keyword Management Component */}
      <KeywordInputForm 
        keywords={keywords} 
        setKeywords={setKeywords} 
        limit={limit}         
        setLimit={setLimit}   
        loading={loading}
      />
      
      {/* Horizontal Divider */}
      <hr style={{ margin: '30px 0' }}/>
      
      {/* 2. Scrape & Download Trigger Buttons */}
      <div className="scrape-button-section">
        <button 
          className="scrape-btn"
          onClick={() => handleScrape()} // <-- MODIFIED: Call without downloadFormat for display
          disabled={loading || keywords.length === 0}
        >
          {loading ? 'Scraping...' : '🚀 Scrape for Display'}
        </button>
        {keywords.length > 0 && (
          <>
            <button 
              className="download-btn csv"
              onClick={() => handleScrape('csv')} // <-- NEW: Scrape and download CSV
              disabled={loading}
            >
              ⬇️ Scrape & Download CSV
            </button>
            <button 
              className="download-btn json"
              onClick={() => handleScrape('json')} // <-- NEW: Scrape and download JSON
              disabled={loading}
            >
              ⬇️ Scrape & Download JSON
            </button>
          </>
        )}
        {error && <p className="error-message">Error: {error}</p>}
      </div>

      {/* Remove the old ScrapeButton component import if you use this integrated logic */}
      {/* Remove the old DownloadButtons component import */}
      
      {/* 3. Results Display Component */}
      <ResultsTable results={results} />
    </div>
  );
}

export default App;