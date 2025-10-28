import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { workflowRouter } from './workflowRoutes.js'; 

// Load environment variables from config/.env
dotenv.config({ path: "./config/.env" }); 

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// TEMPORARY FIX: Apply simple wildcard CORS to allow ALL origins for debugging.
// If the connection works now, the previous issue was a subtle Vercel URL mismatch.
app.use(cors()); 

// Enable JSON body parsing for POST requests
app.use(express.json()); 

// Routes
// Use the workflow router for scraping tasks
app.use('/api/scrape', workflowRouter);

app.get('/', (req, res) => {
  res.send('Ncs Lead Data Scraper Backend API is running!');
});

// --------------------------------------------------------
// Start the server
app.listen(PORT, () => {
  console.log(`✅ Backend server listening on http://localhost:${PORT}`);
});