import express from 'express';
import { runWorkflow } from './scraper.js';
import fs from 'fs';          
import { Parser } from 'json2csv'; 
import path from 'path';

const router = express.Router();

function ensureDataDir() {
    const dir = './data';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

// Route: POST /api/scrape (Scraping Trigger)
router.post('/', async (req, res) => {
  // Extract 'keywords' and 'limit' from request body
  const { keywords, limit } = req.body; 

  if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
    return res.status(400).json({ 
        message: 'Request body must contain a non-empty array of keywords.' 
    });
  }

  try {
    console.log(`Received request to scrape for: ${keywords.join(', ')}. Limit per keyword: ${limit || 'default 20'}`);
    
    // Pass 'limit' to runWorkflow
    const results = await runWorkflow(keywords, limit);
    
    // File Saving Logic 
    ensureDataDir();
    fs.writeFileSync("./data/results.json", JSON.stringify(results, null, 2));

    try {
        // --- FIX: Define fields explicitly to prevent crash on empty results ---
        const fields = [
            'keyword',
            'business_name',
            'website',
            'address',
            'phone',
            'owner_name',
            'owner_linkedin',
            'emails',
        ];

        // Pass fields to the Parser constructor
        const parser = new Parser({ fields }); 
        const csv = parser.parse(results);
        // --- END FIX ---
        
        fs.writeFileSync("./data/results.csv", csv);
        console.log("✅ Results saved to data/results.json and data/results.csv");
    } catch (csvErr) {
        // This catch block will now only be hit if a serious file writing error occurs, not if results are empty.
        console.error('❌ CSV Conversion Error:', csvErr.message);
    }
    // End File Saving Logic 

    res.status(200).json({ 
        message: `Scraping completed for ${keywords.length} keyword(s). Results saved locally and returned.`, 
        data: results 
    });
  } catch (error) {
    console.error('❌ Scraping Error:', error.message);
    res.status(500).json({ 
        message: 'Internal Server Error during scraping.',
        details: error.message 
    });
  }
});

// ------------------------------------------------------------------
// Route to serve the generated files (CSV, JSON, Excel)
// ------------------------------------------------------------------
router.get('/download/:format', (req, res) => {
    const format = req.params.format.toLowerCase();
    let fileName = '';
    let contentType = '';
    let downloadAs = ''; // File name hint for the browser

    if (format === 'csv') {
        fileName = 'results.csv';
        contentType = 'text/csv';
        downloadAs = 'lead_scrape_results.csv';
    } else if (format === 'json') {
        fileName = 'results.json';
        contentType = 'application/json';
        downloadAs = 'lead_scrape_results.json';
    } 
    // Excel is a proprietary format, but we serve the compatible CSV file
    else if (format === 'excel') { 
        fileName = 'results.csv';
        contentType = 'text/csv';
        downloadAs = 'lead_scrape_results.csv'; // Excel can open this
    }
    else {
        return res.status(400).json({ message: 'Invalid download format requested.' });
    }

    // Construct the absolute path to the file
    // process.cwd() ensures the path is correct regardless of where the script is run from
    const filePath = path.join(process.cwd(), 'data', fileName);

    // Check if the file exists before sending
    if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', contentType);
        // res.download sends the file and sets the Content-Disposition header
        res.download(filePath, downloadAs, (err) => {
            if (err) {
                console.error(`❌ Error downloading file ${fileName}:`, err);
                if (!res.headersSent) {
                    res.status(500).json({ message: 'Failed to download file.' });
                }
            }
        });
    } else {
        res.status(404).json({ message: `File not found. Please run a scrape first.` });
    }
});

export { router as workflowRouter };