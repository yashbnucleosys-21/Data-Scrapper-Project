import React from "react";

const ResultsTable = ({ results }) => {
  if (!results.length)
    return (
      <div className="no-results">
        <h2>📊 No Results Yet</h2>
        <p>Run a scrape to view data here.</p>
      </div>
    );

  return (
    <div className="results-container">
      <h2>📈 Scraping Results ({results.length})</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Keyword</th>
              <th>Business</th>
              <th>Website</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Owner</th>
              <th>LinkedIn</th>
              <th>Emails</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i}>
                <td>{r.keyword}</td>
                <td>{r.business_name}</td>
                
                {/* MODIFIED: Website Cell */}
                <td className="link-cell"> 
                  {r.website ? (
                    <>
                      <a href={r.website} target="_blank" rel="noopener noreferrer" className="link-btn">
                        Visit Site
                      </a>
                      <span className="raw-link">{r.website}</span>
                    </>
                  ) : (
                    "N/A"
                  )}
                </td>
                
                <td>{r.address || "N/A"}</td>
                <td>{r.phone || "N/A"}</td>
                <td>{r.owner_name || "N/A"}</td>
                
                {/* MODIFIED: LinkedIn Cell */}
                <td className="link-cell">
                  {r.owner_linkedin ? (
                    <>
                      <a
                        href={r.owner_linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-btn"
                      >
                        View Profile
                      </a>
                      <span className="raw-link">{r.owner_linkedin}</span>
                    </>
                  ) : (
                    "N/A"
                  )}
                </td>
                
                <td>{r.emails?.join(", ") || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;