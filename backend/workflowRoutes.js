import express from 'express';
import { runWorkflow } from './scraper.js';
import { Parser } from 'json2csv'; 

const router = express.Router();

// --- IN-MEMORY CACHE ---
// This will store the last set of scraped results directly in the server's memory.
let scrapedDataCache = []; 
// --- END CACHE ---

// Function to generate CSV from in-memory data
function generateCsv(data) {
    if (!data || data.length === 0) {
        // Return a CSV with just headers if data is empty
        const fields = [
            'keyword', 'business_name', 'website', 'address', 'phone', 
            'owner_name', 'owner_linkedin', 'emails'
        ];
        return fields.join(','); 
    }
    
    // Define fields explicitly for the CSV Parser
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
    const parser = new new Parser({ fields }); 
    return parser.parse(data);
}


// Route: POST /api/scrape (Scraping Trigger)
router.post('/', async (req, res) => {
  const { keywords, limit } = req.body; 

  if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
    return res.status(400).json({ 
        message: 'Request body must contain a non-empty array of keywords.' 
    });
  }

  try {
    console.log(`Received request to scrape for: ${keywords.join(', ')}. Limit per keyword: ${limit || 'default 20'}`);
    
    const results = await runWorkflow(keywords, limit);
    
    // >>> CRUCIAL FIX: Update the IN-MEMORY CACHE instead of the file system <<<
    scrapedDataCache = results;
    console.log(`✅ Scrape complete. ${results.length} results saved to memory.`);
    // --- END CRUCIAL FIX ---

    res.status(200).json({ 
        message: `Scraping completed for ${keywords.length} keyword(s). Results saved to memory.`, 
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
// Route to serve the generated files (CSV, JSON)
// ------------------------------------------------------------------
router.get('/download/:format', (req, res) => {
    const format = req.params.format.toLowerCase();
    const dataToDownload = scrapedDataCache; // Get data from memory

    if (!dataToDownload || dataToDownload.length === 0) {
        // Return an empty data file (with headers for CSV) but success status
        if (format === 'csv' || format === 'excel') {
            res.setHeader('Content-Type', 'text/csv');
            res.attachment('lead_scrape_results.csv');
            return res.send(generateCsv([])); // Send headers only
        } else if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.attachment('lead_scrape_results.json');
            return res.send(JSON.stringify([]));
        } else {
            return res.status(400).json({ message: 'Invalid download format requested.' });
        }
    }

    const downloadAs = `lead_scrape_results_${new Date().toISOString().slice(0, 10)}`;

    if (format === 'csv' || format === 'excel') {
        const csv = generateCsv(dataToDownload);
        res.setHeader('Content-Type', 'text/csv');
        res.attachment(`${downloadAs}.csv`);
        return res.send(csv);
    } 
    
    if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.attachment(`${downloadAs}.json`);
        return res.send(JSON.stringify(dataToDownload, null, 2));
    }
    
    res.status(400).send('Invalid download format.');
});

export { router as workflowRouter };