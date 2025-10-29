import express from 'express';
import { runWorkflow } from './scraper.js';
import { Parser } from 'json2csv';

const router = express.Router();

// --- IN-MEMORY CACHE ---
// This cache holds the last successful scrape results in the server's memory.
let scrapedDataCache = [];
// --- END CACHE ---

// Function to generate CSV from in-memory data
function generateCsv(data) {
    // Define fields explicitly for the CSV Parser to ensure headers are consistent
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
    
    // Correct instantiation of the Parser
    const parser = new Parser({ fields }); 
    
    if (!data || data.length === 0) {
        // Return CSV with just headers if data is empty
        return fields.join(',');
    }
    
    // Parse the data
    try {
        return parser.parse(data);
    } catch (e) {
        // Log the error but return headers to prevent a crash
        console.error("❌ json2csv Parsing Failed:", e.message);
        return fields.join(','); 
    }
}


// ------------------------------------------------------------------
// Route: POST /api/scrape (Scraping Trigger)
// ------------------------------------------------------------------
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

        // Save results to in-memory cache
        scrapedDataCache = results;
        console.log(`✅ Scrape complete. ${results.length} results saved to memory.`);
        console.log(`Cache check: Data count is now ${scrapedDataCache.length}`);

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
// Route: GET /download/:format (Download Endpoint)
// ------------------------------------------------------------------
router.get('/download/:format', (req, res) => {
    const format = req.params.format.toLowerCase();
    const dataToDownload = scrapedDataCache; // Get data from memory
    
    console.log(`Download request for ${format}. Cache size: ${dataToDownload.length}`);

    const downloadAsBase = `lead_scrape_results_${new Date().toISOString().slice(0, 10)}`;
    let fileContent = '';
    let contentType = '';
    let downloadAs = '';

    // 1. Generate Content and Set Headers for CSV/Excel
    if (format === 'csv' || format === 'excel') {
        fileContent = generateCsv(dataToDownload);
        contentType = 'text/csv';
        downloadAs = `${downloadAsBase}.csv`;
    } 
    // 2. Generate Content and Set Headers for JSON
    else if (format === 'json') {
        // Always stringify the data, even if it's an empty array
        fileContent = JSON.stringify(dataToDownload, null, 2); 
        contentType = 'application/json';
        downloadAs = `${downloadAsBase}.json`;
    } 
    // 3. Handle Invalid Format
    else {
        return res.status(400).send('Invalid download format requested.');
    }
    
    // --- FINAL SEND LOGIC ---

    // Safety check for content (although generateCsv/JSON.stringify should handle empty arrays)
    if (!fileContent) {
        console.warn(`Content for ${format} is unexpectedly empty.`);
        fileContent = (contentType === 'text/csv') ? generateCsv([]) : '[]'; // Ensure minimal content
    }

    // Set the necessary headers for a robust download:
    res.setHeader('Content-Type', contentType);
    
    // CRITICAL: Force the browser to download the file
    res.setHeader('Content-Disposition', `attachment; filename="${downloadAs}"`);

    // Set the content length for reliability
    res.setHeader('Content-Length', Buffer.byteLength(fileContent, 'utf8'));

    // Send the content
    return res.send(fileContent);
});

export { router as workflowRouter };