# AI Blogger Agent

**Author:** Anubhab

An advanced AI-powered blogging agent that automates the process of researching, planning, and writing high-quality blog posts. This project combines a powerful LangGraph backend with a modern, dynamic Next.js frontend to deliver a seamless content creation experience.

## 🚀 Features

### Backend (LangGraph + FastAPI)
- **Autonomous Research**: Uses Tavily API to gather real-time web information.
- **Intelligent Planning**: Creates structured outlines based on research.
- **Iterative Drafting**: Writes sections, verifies facts, and refines content using Groq/Llama-3 models.
- **Image Generation**: Automatically suggests and generates relevant images (via Hugging Face/Pollinations).
- **Live Progress**: Streams real-time updates and logs to the frontend via Server-Sent Events (SSE).

### Frontend (Next.js + TypeScript)
- **Modern UI**: Clean, responsive interface built with Tailwind CSS and Shadcn UI.
- **Glassmorphism Design**: Premium aesthetic with backdrop blur effects.
- **Dark/Light Mode**: Full theme support with smooth transitions.
- **Dynamic Background**: Interactive particle background that reacts to scroll and user input.
- **Markdown Rendering**: Beautifully renders generated blogs with syntax highlighting and image support.

## 🛠️ Tech Stack

### Backend
- **Framework**: Python, FastAPI
- **Agent Framework**: LangGraph, LangChain
- **LLM**: Groq (Llama-3.1-8b-instant)
- **Search**: Tavily API
- **Image Gen**: Hugging Face Inference API / Pollinations.ai

### Frontend
- **Framework**: Next.js (App Router), React
- **Styling**: Tailwind CSS, Shadcn UI
- **Icons**: Lucide React
- **Particles**: TSParticles
- **State Management**: React Hooks

## 📦 Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- API Keys:
    - `GROQ_API_KEY`
    - `TAVILY_API_KEY`
    - `HF_API_KEY` (Optional, for image generation)

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-blogger-agent.git
cd ai-blogger-agent/backend

# Create a virtual environment
python -m venv .venv
# Activate:
# Windows: .venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate

# Install dependencies using uv (recommended) or pip
pip install uv
uv sync
# OR
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Fill in your API keys in .env
```

### 2. Frontend Setup

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Running the Application

1.  **Start Backend**:
    ```bash
    # In backend folder
    uv run uvicorn api:app --reload
    ```
    Server will start at `http://localhost:8000`.

2.  **Start Frontend**:
    ```bash
    # In frontend folder
    npm run dev
    ```
    Application will be available at `http://localhost:3000`.

## 🖥️ Usage

1.  Open `http://localhost:3000`.
2.  **Generate New Blog**:
    - Enter a topic (e.g., "The Future of AI Agents in 2025").
    - Select an "As-of Date" (defaults to today).
    - Click **Start Generation**.
3.  **Live Progress**: Watch the agent research, plan, and draft in real-time.
4.  **View Blogs**: Once complete, valid blogs appear in the "Recent Blogs" list and can be read with full formatting.

## 📝 License

This project is licensed under the MIT License.

---
**Crafted with ❤️ by Anubhab**
