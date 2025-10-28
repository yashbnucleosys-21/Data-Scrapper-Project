# 🕵️‍♀️ Business Lead Scraper Project

A full-stack application designed to scrape business leads, including contact details and social media information, using a React/Vite frontend for user interaction and a robust Node.js/Express backend powered by SerpAPI.

---

## ✨ Features

* **Keyword-Based Search:** Scrape leads based on user-defined industry keywords and locations (e.g., "SEO companies in Pune").
* **Result Limiting:** Control the number of results per keyword via the frontend interface.
* **Detailed Data Extraction:** Collects the following fields:
    * `business_name`
    * `website`
    * `address`
    * `phone`
    * `owner_linkedin` (via secondary search)
    * `emails` (via website scraping)
* **File Exports:** Download scraped results as **CSV** (compatible with Excel) and **JSON** files.
* **Responsive UI:** A modern, clean frontend built with React and Vite.

---

## 💻 Local Setup

### Prerequisites

You need the following installed:

1.  **Node.js** (v14+)
2.  **npm** or **Yarn**
3.  A **SerpAPI API Key** (required for data scraping).

### Step 1: Clone the Repository

```
git clone [https://github.com/yashbnucleosys-21/Data-Scrapper-Project.git](https://github.com/yashbnucleosys-21/Data-Scrapper-Project.git)
cd Data-Scrapper-Project
```
Step 2: Configure Environment Variables
The backend requires your SerpAPI key.
Navigate to the backend directory:

```
cd backend
```
Create a file named .env and add your API key:

# Create this file in the 'backend' folder, not 'config'
```
SERP_API_KEY=YOUR_ACTUAL_SERP_API_KEY_HERE
```

Step 3: Install Dependencies & Run Backend
In the backend directory:
```
npm install
npm start
# Server listening on http://localhost:5000
```

Step 4: Install Dependencies & Run Frontend
Open a new terminal window and navigate to the frontend-vite directory:
```
cd frontend-vite
npm install
npm run dev
# App is available at http://localhost:5173 (or similar port)
The application should automatically open in your browser, ready for scraping.
```

📂 Project Structure
The project uses a standard mono-repository structure separating the client and server:
```
Data-Scrapper-Project/
├── backend/
│   ├── config/
│   ├── data/             # Scraped files (results.csv, results.json)
│   ├── node_modules/
│   ├── package.json
│   ├── server.js         # Express entry point
│   ├── scraper.js        # Core scraping logic
│   └── workflowRoutes.js # API routes (/api/scrape, /api/scrape/download)
└── frontend-vite/
    ├── src/
    │   ├── components/   # React Components (Input, Table, Buttons)
    │   ├── App.jsx
    │   └── App.css       # Styling
    ├── node_modules/
    └── package.json
```

🤝 Contribution
Contributions are welcome!
