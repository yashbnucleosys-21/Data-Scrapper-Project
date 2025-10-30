# 🚀 Web Data Scraper Project

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/Frontend-React%20(Vite)-blue?logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Backend-Express-orange?logo=express)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://vercel.com/)
[![Deployed on Render](https://img.shields.io/badge/Backend-Render-purple?logo=render)](https://render.com/)

> A full-stack, cloud-ready **Web Data Scraper** that extracts business leads and contact details using keyword + location search. Built with **React (Vite)** frontend and **Node.js (Express)** backend; scraping powered by **SerpAPI + Puppeteer**. Results are downloadable as CSV or JSON.

---

## 🌐 Live Demo
**Try it:** https://ncs-data-scrapper.vercel.app/

---

## 🖼️ Screenshots
*(Add your screenshots inside `/screenshots` and update filenames below)*

| Dashboard View | Scraping Results |
|----------------|------------------|
| ![Dashboard](./screenshots/dashboard.png) | ![Results](./screenshots/results.png) |

---

## ✨ Key Features
- 🔍 Keyword + Location based scraping (e.g., "SEO companies in Pune")  
- 🎯 Limit number of results per search  
- 🧾 Extracted fields: `business_name`, `website`, `address`, `phone`, `owner_linkedin`, `emails`  
- ⚡ In-memory caching for cloud deployments (no reliance on persistent filesystem)  
- 💾 Instant CSV (Excel compatible) and JSON downloads  
- 🖥️ Responsive UI built with React + Vite (Tailwind can be added)  
- ☁️ Frontend hosted on Vercel, Backend hosted on Render (example setup)

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite) |
| Backend | Node.js + Express |
| Scraper Engine | Puppeteer + Cheerio |
| CSV Conversion | json2csv |
| Hosting (FE) | Vercel |
| Hosting (BE) | Render |

---

## ⚙️ Local Development Setup

### 1) Prerequisites
- Node.js v18+ (recommended)  
- npm or Yarn  
- Git  
- SerpAPI API Key (https://serpapi.com/)

### 2) Clone repo
    git clone https://github.com/yashbnucleosys-21/Data-Scrapper-Project.git
    cd Data-Scrapper-Project

### 3) Backend setup (backend/)
    cd backend
    npm install

Create a `.env` file inside the `backend/` folder and add:
    SERP_API_KEY=YOUR_SERPAPI_KEY_HERE

Start the backend:
    npm run dev
(Backend typically runs at http://localhost:5000)

### 4) Frontend setup (frontend-vite/)
Open a new terminal:
    cd ../frontend-vite
    npm install

Create `.env.local` to point to your local backend:
    VITE_API_URL=http://localhost:5000/api/scrape

Start the frontend:
    npm run dev
(Frontend typically runs at http://localhost:5173)

---

## 🌐 Deployment Pipeline

### 🚀 1. Backend (Render)
**Platform:** Render  
**Type:** Web Service  
**Build Command:**  
    npm install

**Start Command:**  
    npm start

**Key Configurations:**
- Enable CORS to allow requests from your Vercel frontend domain.  
- Store scraped results in-memory (e.g., `global.scrapedDataCache`) because Render's file system is ephemeral (resets between deploys and instances).

### 🌍 2. Frontend (Vercel)
**Platform:** Vercel  
**Framework:** Vite + React

Set environment variable in Vercel:
    VITE_API_URL=https://<your-render-backend-url>/api/scrape

The production build will use `import.meta.env.VITE_API_URL` to contact the backend.

### 🔗 Service Communication (Endpoints)
| Direction | Endpoint | Description |
|-----------|----------|-------------|
| FE → BE | `POST /api/scrape` | Initiates a scrape with user-input keywords & locations |
| FE → BE | `GET /api/scrape/download/csv` | Download CSV results |
| FE → BE | `GET /api/scrape/download/json` | Download JSON results |
| BE → FE | `HTTP Response` | Returns data with correct CORS headers |

---

## 🧰 Key Libraries Used

- **express** — Web API framework for Node.js  
- **cors** — Enable cross-origin requests between front & back ends  
- **puppeteer** — Headless browser automation for scraping pages and dynamic content  
- **cheerio** — Parse and query HTML for structured scraping  
- **json2csv** — Convert JSON arrays to CSV for downloads  
- **react** — Frontend UI library  
- **vite** — Fast build/dev environment for frontend

---

## 📂 Project Structure

    Data-Scrapper-Project/
    ├── backend/
    │   ├── config/
    │   ├── data/               # (optional local results)
    │   ├── scraper.js          # Core scraping logic (Puppeteer + parsing)
    │   ├── workflowRoutes.js   # API routes (POST /api/scrape, GET downloads)
    │   ├── server.js           # Express entry point
    │   ├── package.json
    │   └── .env                # SERP_API_KEY=...
    └── frontend-vite/
        ├── src/
        │   ├── components/     # Input forms, Results table, Buttons
        │   ├── App.jsx
        │   └── App.css
        ├── package.json
        └── .env.local          # VITE_API_URL=http://localhost:5000/api/scrape

---

## ✅ Example Backend Notes (implementation tips)
- Use a single global cache object to store the last scrape results per user/session id:
      global.scrapedDataCache = { "<sessionId>": [ ...results ] }
- When a scrape completes, store results in the cache and return a success response with a session id.
- Download endpoints read the cache by session id and return either CSV or JSON.
- Avoid writing persistent files on Render — use memory or an external storage (S3) for persistent data.

---

## 🤝 Contribution Guidelines

Contributions are welcome 🎉

To contribute:
1. Fork the repository  
2. Create a feature branch:
    git checkout -b feature-name
3. Commit your changes:
    git commit -m "Add brief description"
4. Push and open a Pull Request:
    git push origin feature-name

Report bugs or request features via Issues:
https://github.com/yashbnucleosys-21/Data-Scrapper-Project/issues

---

## 📜 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute it with attribution.

---

## 👨‍💻 Author

**Developed by:** Yash Bhilare – Nucleosys Tech  
📧 **Contact:** yashbnucleosys21@gmail.com  
🌐 **Live Demo:** https://ncs-data-scrapper.vercel.app/

---

⭐ If you find this project helpful, please give it a star on GitHub!
