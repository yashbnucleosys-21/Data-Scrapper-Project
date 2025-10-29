import express from 'express';
import { runWorkflow } from './scraper.js';
import { Parser } from 'json2csv';
import { scrapedDataCache, updateCache } from './cache.js';

const router = express.Router();

// ... (generateCsv function remains the same) ...


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
        
        console.log('[POST /api/scrape] Calling runWorkflow...'); // ADD THIS
        const results = await runWorkflow(keywords, limit);
        console.log(`[POST /api/scrape] runWorkflow returned ${results.length} results.`); // ADD THIS

        // Save results to in-memory cache using the shared update function
        updateCache(results);
        console.log(`✅ Scrape complete. ${results.length} results saved to shared memory cache.`);
        console.log(`Cache check: Data count is now ${scrapedDataCache.results.length}`);

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
    
    // Get data from the shared memory cache's results property
    const dataToDownload = scrapedDataCache.results;
    
    console.log(`[GET /download] Download request for ${format}. Cache size: ${dataToDownload.length}`); // MODIFIED
    // Log a sample of the data to ensure it's not empty right before generating the file
    if (dataToDownload.length > 0) {
        console.log(`[GET /download] First item in dataToDownload:`, dataToDownload[0]); // ADD THIS
    } else {
        console.log(`[GET /download] dataToDownload is empty. Nothing to download.`); // ADD THIS
    }

    const downloadAsBase = `lead_scrape_results_${new Date().toISOString().slice(0, 10)}`;
    let fileContent = '';
    let contentType = '';
    let downloadAs = '';

    // 1. Generate Content and Set Headers for CSV/Excel
    if (format === 'csv' || format === 'excel') {
        fileContent = generateCsv(dataToDownload);
        contentType = 'text/csv';
        downloadAs = `${downloadAsBase}.csv`;
        console.log(`[GET /download] Generated CSV content length: ${Buffer.byteLength(fileContent, 'utf8')}`); // ADD THIS
    } 
    // 2. Generate Content and Set Headers for JSON
    else if (format === 'json') {
        fileContent = JSON.stringify(dataToDownload, null, 2); 
        contentType = 'application/json';
        downloadAs = `${downloadAsBase}.json`;
        console.log(`[GET /download] Generated JSON content length: ${Buffer.byteLength(fileContent, 'utf8')}`); // ADD THIS
    } 
    // 3. Handle Invalid Format
    else {
        console.warn(`[GET /download] Invalid download format requested: ${format}`); // ADD THIS
        return res.status(400).send('Invalid download format requested.');
    }
    
    // ... (FINAL SEND LOGIC remains the same) ...

    if (!fileContent) {
        console.warn(`Content for ${format} is unexpectedly empty. Sending minimal content.`);
        fileContent = (contentType === 'text/csv') ? generateCsv([]) : '[]'; // Ensure minimal content
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${downloadAs}"`);
    res.setHeader('Content-Length', Buffer.byteLength(fileContent, 'utf8'));

    console.log(`[GET /download] Sending file: ${downloadAs} with content type: ${contentType} and length: ${Buffer.byteLength(fileContent, 'utf8')}`); // ADD THIS
    return res.send(fileContent);
});

export { router as workflowRouter };