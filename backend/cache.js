// This object will hold the last set of scraped results in memory
export let scrapedDataCache = {
    results: [],
    lastUpdated: null
};

// Function to update the cache
export const updateCache = (newResults) => {
    scrapedDataCache.results = newResults;
    scrapedDataCache.lastUpdated = new Date().toISOString();
    console.log(`[Cache] Updated at ${scrapedDataCache.lastUpdated} with ${newResults.length} results.`);
};