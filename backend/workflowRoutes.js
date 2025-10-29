import express from 'express';
import { runWorkflow } from './scraper.js';
import { Parser } from 'json2csv';
import { scrapedDataCache, updateCache } from '../cache.js'; // <-- IMPORTANT: Import the shared cache

const router = express.Router();

// REMOVED: The local 'let scrapedDataCache = [];' as it's now imported.

// Function to generate CSV from in-memory data
function generateCsv(data) {
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
    
    const parser = new Parser({ fields }); 
    
    if (!data || data.length === 0) {
        return fields.join(',');
    }
    
    try {
        return parser.parse(data);
    } catch (e) {
        console.error("❌ json2csv Parsing Failed:", e.message);
        return fields.join(','); 
    }
}


// ------------------------------------------------------------------
// Route: POST /api/scrape (Scraping Trigger - now ONLY for display and cache update)
// ------------------------------------------------------------------
router.post('/', async (req, res) => {
    const { keywords, limit } = req.body; // Removed downloadFormat

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
        return res.status(400).json({
            message: 'Request body must contain a non-empty array of keywords.'
        });
    }

    try {
        console.log(`Received request to scrape for: ${keywords.join(', ')}. Limit per keyword: ${limit || 'default 20'}`);

        const results = await runWorkflow(keywords, limit);

        // Save results to in-memory cache using the shared update function
        updateCache(results); // <-- Cache is updated here
        console.log(`✅ Scrape complete. ${results.length} results saved to shared memory cache.`);
        console.log(`Cache check: Data count is now ${scrapedDataCache.results.length}`);

        res.status(200).json({
            message: `Scraping completed for ${keywords.length} keyword(s). Results saved to memory.`,
            data: results // Send data back for frontend display
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
// Route: GET /download/:format (Download Endpoint - Reintroduced)
// ------------------------------------------------------------------
router.get('/download/:format', (req, res) => {
    const format = req.params.format.toLowerCase();
    // Get data from the shared memory cache's results property
    const dataToDownload = scrapedDataCache.results; // <-- Access data from cache
    
    console.log(`Download request for ${format}. Cache size: ${dataToDownload.length}`);

    const downloadAsBase = `lead_scrape_results_${new Date().toISOString().slice(0, 10)}`;
    let fileContent = '';
    let contentType = '';
    let downloadAs = '';

    if (format === 'csv' || format === 'excel') {
        fileContent = generateCsv(dataToDownload);
        contentType = 'text/csv';
        downloadAs = `${downloadAsBase}.csv`;
    } 
    else if (format === 'json') {
        fileContent = JSON.stringify(dataToDownload, null, 2); 
        contentType = 'application/json';
        downloadAs = `${downloadAsBase}.json`;
    } 
    else {
        return res.status(400).send('Invalid download format requested.');
    }
    
    if (!fileContent) {
        console.warn(`Content for ${format} is unexpectedly empty.`);
        fileContent = (contentType === 'text/csv') ? generateCsv([]) : '[]';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${downloadAs}"`);
    res.setHeader('Content-Length', Buffer.byteLength(fileContent, 'utf8'));

    return res.send(fileContent);
});

export { router as workflowRouter };