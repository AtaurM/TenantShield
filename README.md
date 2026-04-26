# TenantShield

NYC Housing Rights complaint assistant. Upload a photo of a housing issue or describe it in text — get back the relevant NYC housing code violation and a formal legal letter in your language.

## Setup

### 1. Backend (Python / FastAPI)

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Copy `.env.example` to `.env` and add your Gemini API key:
```bash
cp .env.example .env
# Edit .env and set GEMINI_API_KEY=your_key
```

Get a free API key at https://aistudio.google.com/apikey

Start the backend:
```bash
uvicorn main:app --reload
```
Backend runs at http://localhost:8000

### 2. Frontend (React / Vite)

```bash
cd frontend
npm install
npm run dev
```
Frontend runs at http://localhost:5173

## Usage

1. Open http://localhost:5173
2. Upload a photo of the housing issue and/or describe it in text
3. Select the language for the letter
4. Click "Analyze Issue & Generate Letter"
5. Review the violation summary and download the PDF letter
6. Fill in the placeholder fields in the PDF before sending

## Tech Stack

- **Backend:** Python, FastAPI, Google Gemini 1.5 Flash, ReportLab
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Axios
