# SnapSpend — Smart Expense Tracker with Receipt OCR

A full-stack personal finance app that lets users snap a photo of a paper receipt
and automatically extracts the merchant, amount, and spending category using OCR —
no manual typing required. Includes budget tracking and analytics dashboards.

## ✨ Features

- **JWT Authentication** — secure register/login with hashed passwords (bcrypt)
- **Receipt OCR** — upload a receipt photo, Tesseract.js extracts the raw text
- **Smart Auto-Categorization** — a rule-based keyword engine guesses merchant, amount, and category from the OCR text (groceries, dining, transport, utilities, etc.) so the user just reviews and confirms
- **Manual Entry** — for expenses without a receipt
- **Monthly Budget Tracking** — set a budget, see a live usage bar and remaining balance
- **Analytics Dashboard** — category breakdown pie chart + 6-month spending trend bar chart (Recharts)
- **Containerized** — Docker + docker-compose for one-command setup

## 🏗️ Architecture

```
React (SPA)  <--REST API-->  Express.js  <--Sequelize-->  PostgreSQL
                                  |
                          Tesseract.js (OCR engine)
                                  |
                        Rule-based categorizer service
```

- **Backend**: Node.js, Express, Sequelize, PostgreSQL, JWT, bcrypt, Multer (file upload), Tesseract.js (OCR)
- **Frontend**: React, React Router, Recharts, Axios
- **Infra**: Docker, docker-compose

## 🧠 How the "smart" part works

1. User uploads a receipt photo → sent to `POST /api/expenses/scan`
2. **Tesseract.js** runs OCR on the image and returns raw text
3. A lightweight rule-based engine (`services/categorizer.js`) then:
   - Guesses the **merchant name** (first line of the receipt)
   - Guesses the **total amount** (looks for a line containing "total", falls back to the largest number on the receipt)
   - Guesses the **category** by matching keywords (e.g. "pharmacy" → health, "uber" → transport)
4. The user reviews/edits this auto-filled draft before saving — OCR is rarely
   perfect, so the UI treats it as a smart starting point, not a black box.

This keeps the project fully self-contained (no paid AI API key needed) while still
demonstrating practical AI/OCR integration — a good talking point in interviews.

## 🚀 Getting Started

### Option A — Docker (recommended)

```bash
docker-compose up --build
```

- Frontend: http://localhost:3001
- Backend API: http://localhost:5001/api
- Postgres: localhost:5433 (mapped to avoid clashing with other local Postgres instances)

Just register a new account from the UI — there's no separate seed step needed here.

> Note: Tesseract.js downloads its English language model (~10MB) the first time
> OCR runs, which requires internet access on that first call. It's cached after that.

### Option B — Run locally without Docker

**Backend**
```bash
cd backend
cp .env.example .env      # edit DB credentials if needed
npm install
# make sure a local PostgreSQL server is running and the DB in .env exists
npm run dev                 # starts on http://localhost:5001
```

**Frontend**
```bash
cd frontend
cp .env.example .env
npm install
npm start                    # starts on http://localhost:3001
```

## 📡 API Overview

| Method | Endpoint                  | Auth   | Description                                  |
|--------|----------------------------|--------|-----------------------------------------------|
| POST   | /api/auth/register            | Public | Create an account                             |
| POST   | /api/auth/login                | Public | Get a JWT                                     |
| GET    | /api/auth/me                     | Bearer | Current user profile                          |
| PUT    | /api/auth/budget                   | Bearer | Update monthly budget                         |
| POST   | /api/expenses/scan                    | Bearer | Upload receipt image → OCR draft (not saved)  |
| POST   | /api/expenses                             | Bearer | Save a confirmed expense                      |
| GET    | /api/expenses?month=YYYY-MM                  | Bearer | List expenses (optional month/category filter)|
| PUT    | /api/expenses/:id                              | Bearer | Edit an expense                               |
| DELETE | /api/expenses/:id                                | Bearer | Delete an expense                             |
| GET    | /api/analytics/summary?month=YYYY-MM                | Bearer | Total spend + category breakdown + budget     |
| GET    | /api/analytics/trend                                  | Bearer | Last 6 months of totals                       |

## 🗄️ Data Model (simplified)

```
User (id, name, email, password_hash, monthlyBudget)
Expense (id, merchant, amount, category, note, expenseDate,
         receiptImagePath, ocrRawText, source, userId)
```

## 🧪 Suggested Next Steps (great CV talking points if you extend this)

- Swap the rule-based categorizer for a small ML classifier trained on labeled receipts
- Add recurring expense detection / subscription tracking
- Add CSV/PDF export of monthly statements
- Add Jest/Supertest test suite + GitHub Actions CI
- Deploy: backend to Render/Railway, frontend to Vercel/Netlify, DB to Supabase/Neon

## 📁 Project Structure

```
expense-tracker/
├── backend/
│   ├── config/         # DB connection
│   ├── models/          # Sequelize models & associations
│   ├── middleware/       # JWT auth + file upload (multer)
│   ├── routes/             # auth, expenses, analytics
│   ├── services/            # ocrService.js, categorizer.js
│   ├── uploads/               # stored receipt images
│   └── server.js
├── frontend/
│   └── src/
│       ├── pages/               # Login, Register, Dashboard
│       ├── components/           # ReceiptUpload, ManualExpenseForm, ExpenseList, AnalyticsCharts
│       ├── context/                # AuthContext
│       └── services/                # api.js
└── docker-compose.yml
```

