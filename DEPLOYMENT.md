# Deployment Guide

## Backend (Render)

**URL**: https://ai-blogger-agent.onrender.com

### Environment Variables Required:
```
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
HF_API_KEY=your_huggingface_api_key (optional, for HuggingFace image generation)
```

### Deploy Steps:
1. Push code to GitHub
2. Connect Render to your GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn api:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in Render dashboard

## Frontend (Vercel)

**URL**: https://ai-blogger-agent-beryl.vercel.app

### Environment Variables Required:
```
NEXT_PUBLIC_API_URL=https://ai-blogger-agent.onrender.com
```

### Deploy Steps:
1. Push code to GitHub
2. Import project in Vercel
3. Set root directory to `frontend`
4. Add environment variable `NEXT_PUBLIC_API_URL`
5. Deploy

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (local development)
- `https://ai-blogger-agent-beryl.vercel.app` (production)
- `https://*.vercel.app` (preview deployments)

## Testing Deployment

1. Visit your Vercel URL
2. Try generating a blog post
3. Check browser console for any CORS errors
4. Verify API calls are going to Render backend
