// cache.js
// This object will hold the last set of scraped results in memory
export let scrapedDataCache = {
    results: [],
    lastUpdated: null
};

// Function to update the cache
export const updateCache = (newResults) => {
    console.log(`[Cache] Attempting to update cache with ${newResults.length} new results.`); // ADD THIS
    scrapedDataCache.results = newResults;
    scrapedDataCache.lastUpdated = new Date().toISOString();
    console.log(`[Cache] Cache updated successfully at ${scrapedDataCache.lastUpdated}. Current cache size: ${scrapedDataCache.results.length}`); // MODIFIED
    // Optionally log a snippet of the data to confirm it's not empty
    if (newResults.length > 0) {
        console.log(`[Cache] First result in cache:`, newResults[0]);
    } else {
        console.log(`[Cache] No results were added to the cache.`);
    }
};