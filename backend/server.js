import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { workflowRouter } from './workflowRoutes.js'; 

// Load environment variables from config/.env
dotenv.config({ path: "./config/.env" }); 

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Enable CORS for all routes (allows React frontend to communicate)
app.use(cors()); 
// Enable JSON body parsing for POST requests
app.use(express.json()); 

// Routes
// Use the workflow router for scraping tasks
app.use('/api/scrape', workflowRouter);

app.get('/', (req, res) => {
  res.send('N8N Workflow Scraper Backend API is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Backend server listening on http://localhost:${PORT}`);
});