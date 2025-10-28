import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { workflowRouter } from './workflowRoutes.js'; 

// Load environment variables from config/.env
dotenv.config({ path: "./config/.env" }); 

const app = express();
const PORT = process.env.PORT || 5000;

// --- CRUCIAL: CORS Configuration for Live Deployment ---

const allowedOrigins = [
    // 1. Localhost for development
    'http://localhost:5173', 
    // 2. The live Vercel frontend domain (Confirmed)
    'https://data-scrapper-project.vercel.app' 
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps) or from an allowed origin
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true
};

// Middleware
// Apply the secure CORS configuration
app.use(cors(corsOptions)); 
// --------------------------------------------------------

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