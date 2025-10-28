// This object will hold the last set of scraped results in memory
// Key: 'scrapedData' (or any key you choose)
// Value: The array of JavaScript objects containing the scraped data
export let scrapedDataCache = {
    results: [],
    lastUpdated: null
};

// Function to update the cache
export const updateCache = (newResults) => {
    scrapedDataCache.results = newResults;
    scrapedDataCache.lastUpdated = new Date().toISOString();
};