import React, { useState, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import KeywordInputForm from './components/KeywordInputForm.jsx';
import ScrapeButton from './components/ScrapeButton.jsx'; // <-- Re-ADD this import
import ResultsTable from './components/ResultsTable.jsx';
import DownloadButtons from './components/DownloadButtons.jsx'; // <-- Re-ADD this import

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [keywords, setKeywords] = useState([]);
  const [limit, setLimit] = useState(20); 
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleScrape = useCallback(async () => { // <-- Original handleScrape, no downloadFormat param
    if (keywords.length === 0) {
        setError('Please add at least one keyword.');
        return;
    }

    setLoading(true);
    setError(null);
    setResults([]); // Clear previous results when starting a new scrape

    try {
      // Send 'limit' in the request body, no downloadFormat
      const response = await axios.post(API_URL, { keywords, limit }); 
      setResults(response.data.data); // Display results
      console.log('Scraping successful:', response.data.message);
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
      
      {/* 2. Scrape Trigger Component */}
      <ScrapeButton 
        keywords={keywords} 
        loading={loading} 
        handleScrape={handleScrape} // Pass the handleScrape function
        error={error}
      />
      
      {/* NEW: Download Buttons Component - only shows if results exist */}
      <DownloadButtons 
          resultsCount={results.length} 
          loading={loading}
      />
      
      {/* 3. Results Display Component */}
      <ResultsTable results={results} />
    </div>
  );
}

export default App;