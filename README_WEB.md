# AI Blog Agent Web App

## Prerequisites
- Python 3.10+
- Node.js 18+
- API Keys (in `.env`):
    - `GROQ_API_KEY`
    - `TAVILY_API_KEY`
    - `HF_API_KEY` (Optional, for images)

## Backend (FastAPI)
1. Navigate to `backend` folder.
2. Install dependencies (if not already):
   ```bash
   pip install fastapi uvicorn python-multipart
   ```
   (And ensure other requirements from `pyproject.toml` are installed)
3. Run the server:
   ```bash
   uvicorn api:app --reload
   ```
   Backend will run at `http://localhost:8000`.

## Frontend (Next.js)
1. Navigate to `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   Frontend will run at `http://localhost:3000`.

## Usage
1. Open `http://localhost:3000`.
2. Enter a topic and click "Start Generation".
3. Watch the logs and wait for completion.
4. View the generated blog in the "Past Blogs" tab.
