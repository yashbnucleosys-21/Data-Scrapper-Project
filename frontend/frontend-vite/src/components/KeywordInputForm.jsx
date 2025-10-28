import React, { useState } from "react";

// MODIFIED: Added limit and setLimit to props
const KeywordInputForm = ({ keywords, setKeywords, loading, limit, setLimit }) => {
  const [keywordInput, setKeywordInput] = useState("");

  const addKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (word) => {
    setKeywords(keywords.filter((k) => k !== word));
  };
  
  // NEW: Helper to safely update limit
  const handleLimitChange = (e) => {
    let value = parseInt(e.target.value);
    // Enforce constraints
    if (isNaN(value) || value < 1) value = 1;
    if (value > 50) value = 50;
    setLimit(value);
  };


  return (
    <div className="keyword-form">
      <h3>🔍 Manage Keywords</h3>
      <p className="hint">Set your result limit and add keywords you want to scrape leads for.</p>

      {/* NEW: Limit Input Section */}
      <div className="limit-section">
        <label htmlFor="limit-input">Max Results per Keyword (1-50):</label>
        <input
          id="limit-input"
          type="number"
          value={limit}
          onChange={handleLimitChange}
          min="1"
          max="50"
          disabled={loading}
        />
      </div>
      
      <div className="input-section">
        <input
          type="text"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          placeholder="e.g., 'digital marketing agency in Delhi'"
          onKeyDown={(e) => e.key === "Enter" && addKeyword()}
          disabled={loading}
        />
        <button onClick={addKeyword} disabled={!keywordInput.trim() || loading}>
          + Add
        </button>
      </div>

      {keywords.length > 0 && (
        <div className="keywords-wrapper">
          {keywords.map((k) => (
            <div key={k} className="keyword-chip">
              <span>{k}</span>
              <button onClick={() => removeKeyword(k)} disabled={loading}>
                ✕
              </button>
            </div>
          ))}

          <button
            className="clear-all-btn"
            onClick={() => setKeywords([])}
            disabled={loading}
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default KeywordInputForm;