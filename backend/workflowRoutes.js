import express from 'express';
import { runWorkflow } from './scraper.js';
import { Parser } from 'json2csv';
// REMOVED: import { scrapedDataCache, updateCache } from './cache.js'; // <-- No longer needed

const router = express.Router();

// REMOVED: The entire "IN-MEMORY CACHE" section is no longer needed.

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
// Route: POST /api/scrape (Scraping Trigger & Direct Download)
// ------------------------------------------------------------------
router.post('/', async (req, res) => {
    const { keywords, limit, downloadFormat } = req.body; // <-- MODIFIED: Added downloadFormat

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
        return res.status(400).json({
            message: 'Request body must contain a non-empty array of keywords.'
        });
    }

    try {
        console.log(`Received request to scrape for: ${keywords.join(', ')}. Limit per keyword: ${limit || 'default 20'}`);
        console.log(`Requested download format: ${downloadFormat || 'json (default for frontend display)'}`);

        const results = await runWorkflow(keywords, limit);

        // --- NEW: DIRECT DOWNLOAD LOGIC ---
        // If downloadFormat is specified, send the file directly
        if (downloadFormat) {
            const downloadAsBase = `lead_scrape_results_${new Date().toISOString().slice(0, 10)}`;
            let fileContent = '';
            let contentType = '';
            let downloadAs = '';

            if (downloadFormat === 'csv' || downloadFormat === 'excel') {
                fileContent = generateCsv(results); // Use 'results' directly
                contentType = 'text/csv';
                downloadAs = `${downloadAsBase}.csv`;
            } else if (downloadFormat === 'json') {
                fileContent = JSON.stringify(results, null, 2); // Use 'results' directly
                contentType = 'application/json';
                downloadAs = `${downloadAsBase}.json`;
            } else {
                // If an invalid format is requested, send the default JSON response for display
                return res.status(200).json({
                    message: `Scraping completed. Invalid download format "${downloadFormat}". Returning JSON for display.`,
                    data: results
                });
            }

            // Ensure content is not empty, even if results are empty
            if (!fileContent) {
                 fileContent = (contentType === 'text/csv') ? generateCsv([]) : '[]';
            }

            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${downloadAs}"`);
            res.setHeader('Content-Length', Buffer.byteLength(fileContent, 'utf8'));

            console.log(`✅ Scrape complete. Sending ${downloadFormat} file directly. Size: ${Buffer.byteLength(fileContent, 'utf8')} bytes.`);
            return res.send(fileContent);

        } else {
            // --- ORIGINAL LOGIC: Send JSON for frontend display ---
            console.log(`✅ Scrape complete. ${results.length} results sent for frontend display.`);
            res.status(200).json({
                message: `Scraping completed for ${keywords.length} keyword(s). Results sent for display.`,
                data: results
            });
        }

    } catch (error) {
        console.error('❌ Scraping Error:', error.message);
        res.status(500).json({
            message: 'Internal Server Error during scraping.',
            details: error.message
        });
    }
});

// REMOVED: The entire "GET /download/:format" route is no longer needed.

export { router as workflowRouter };