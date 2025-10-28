import axios from "axios";

const CONCURRENCY_LIMIT = 3; 
const WAIT_MS = 2000; 

const wait = (ms) => new Promise(res => setTimeout(res, ms));

// --- Core Data Fetching Functions ---

// MODIFIED: Accepts 'limit' argument
async function fetchGoogleMaps(keyword, limit = 20) { 
  // Enforce max limit of 50 for safety
  const safeLimit = Math.min(parseInt(limit) || 20, 50); 
  try {
    const SERP_API_KEY = process.env.SERP_API_KEY; 
    const url = "https://serpapi.com/search.json";
    // Uses safeLimit for 'num'
    const params = { q: keyword, engine: "google_maps", api_key: SERP_API_KEY, num: safeLimit }; 
    const res = await axios.get(url, { params, timeout: 60000 }); 
    return res.data;
  } catch (err) {
    console.error(`❌ Error fetching Google Maps for "${keyword}":`, err.message);
    return {};
  }
}

function parseCompanyInfo(raw) {
  const output = [];
  const candidates = [...(raw.local_results || []), ...(raw.places_results || []), ...(raw.organic_results || [])];
  for (const c of candidates) {
    if (!c.title && !c.name) continue;
    output.push({
      business_name: c.title || c.name,
      website: c.website || c.link || null,
      address: c.address || "",
      phone: c.phone || null
    });
  }
  return output;
}

async function fetchLinkedIn(company) {
  try {
    const SERP_API_KEY = process.env.SERP_API_KEY; 
    const url = "https://serpapi.com/search.json";
    const params = {
      engine: "google",
      q: `${company} founder site:linkedin.com/in`,
      api_key: SERP_API_KEY
    };
    const res = await axios.get(url, { params });
    const match = res.data.organic_results?.find(r => r.link?.includes("/in/"));
    if (!match) return null;

    const title = match.title || "";
    const owner_name = title.split(" - ")[0]?.trim() || "";
    return { owner_name, owner_linkedin: match.link };
  } catch (err) {
    console.error(`❌ Error fetching LinkedIn for "${company}":`, err.message);
    return null;
  }
}

async function scrapeWebsiteEmails(url) {
  try {
    const res = await axios.get(url, { timeout: 50000 }); 
    const html = res.data;
    const emails = [
      ...new Set(
        (html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [])
          .filter(e => !e.match(/\.(png|jpg|jpeg|gif|svg|webp|bmp|ico)$/i))
      )
    ];
    return emails;
  } catch (err) {
    console.error(`❌ Error scraping emails from "${url}":`, err.message);
    return [];
  }
}

async function processCompany(company, keyword) {
  if (!company.website) return null;
  await wait(WAIT_MS); 
  const linkedInData = await fetchLinkedIn(company.business_name);
  const emails = await scrapeWebsiteEmails(company.website); 
  
  return { keyword, ...company, ...(linkedInData || {}), emails };
}

// MODIFIED: Accepts 'limit' argument
export async function runWorkflow(keywordsArray, limit) { 
  if (!process.env.SERP_API_KEY) {
      throw new Error("SERP_API_KEY is not set in environment variables.");
  }
  
  const finalResults = [];

  for (const keyword of keywordsArray) {
    console.log(`🔍 Searching: ${keyword}, Limit: ${limit || 20}`);
    // PASSES limit to fetchGoogleMaps
    const serpData = await fetchGoogleMaps(keyword, limit); 
    const companies = parseCompanyInfo(serpData);

    for (let i = 0; i < companies.length; i += CONCURRENCY_LIMIT) {
      const batch = companies.slice(i, i + CONCURRENCY_LIMIT);
      
      const results = await Promise.all(
        batch.map(c => processCompany(c, keyword))
      );
      finalResults.push(...results.filter(r => r));
    }
  }

  return finalResults;
}