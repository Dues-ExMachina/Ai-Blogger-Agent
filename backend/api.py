from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import asyncio
from datetime import date, datetime

# Import the LangGraph app and Supabase storage
from main import app as graph_app
import supabase_storage

app = FastAPI(title="Blog Writing Agent API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://ai-blogger-agent-beryl.vercel.app",  # Vercel production
        "https://ai-blogger-agent-beryl.vercel.app/",  # With trailing slash
        "https://*.vercel.app",  # All Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    topic: str
    as_of: Optional[str] = None
    image_model: str = "huggingface"
    
class BlogPost(BaseModel):
    filename: str
    title: str
    created_at: float
    preview: str

@app.get("/posts", response_model=List[BlogPost])
async def list_posts():
    """List all generated blog posts from Supabase."""
    try:
        # Get list of blog posts from Supabase
        files = supabase_storage.list_blog_posts()
        posts = []
        
        for file in files:
            filename = file["name"]
            # Get the markdown content to extract title and preview
            content = supabase_storage.get_blog_post(filename)
            
            if content:
                lines = content.splitlines()
                title = filename.replace(".md", "").replace("-", " ").title()
                
                # Extract title from first line if it's a heading
                if lines and lines[0].startswith("# "):
                    title = lines[0][2:].strip()
                
                # Parse created_at timestamp
                created_at = datetime.fromisoformat(file["created_at"].replace("Z", "+00:00")).timestamp() if file.get("created_at") else 0
                
                posts.append({
                    "filename": filename,
                    "title": title,
                    "created_at": created_at,
                    "preview": content[:200] + "..." if len(content) > 200 else content
                })
        
        # Sort by creation time (newest first)
        posts.sort(key=lambda x: x["created_at"], reverse=True)
        return posts
    except Exception as e:
        print(f"Error listing posts: {e}")
        return []

@app.get("/posts/{filename}")
async def get_post(filename: str):
    """Get the content of a specific blog post from Supabase."""
    content = supabase_storage.get_blog_post(filename)
    
    if not content:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return Response(content=content, media_type="text/markdown")

@app.post("/generate")
async def generate_blog(request: GenerateRequest):
    """
    Trigger blog generation and stream updates.
    Returns a Server-Sent Events (SSE) stream.
    """
    
    async def event_generator():
        inputs = {
            "topic": request.topic,
            "as_of": request.as_of or date.today().isoformat(),
            "image_model": request.image_model,
            "recency_days": 30, # Default
            # Initialize other state keys
             "mode": "",
            "needs_research": False,
            "queries": [],
            "evidence": [],
            "plan": None,
            "sections": [],
            "merged_md": "",
            "md_with_placeholders": "",
            "image_specs": [],
            "final": "",
        }

        current_state = {}
        
        try:
            # We use the sync graph_app.stream but run it in a threadpool if it blocks too much,
            # or just iterate if it's fast enough. LangGraph sync stream yields sync.
            # For FastAPI SSE, we need async generator.
            
            # Since LangGraph stream is synchronous (in this codebase), we can iterate it 
            # but wrapping in a loop.
            
            # Note: If graph_app.stream is blocking, this might block the event loop.
            # Ideally verify if 'app' is compiled with async support or runs sync.
            # standard LangGraph 'app.stream' is usually sync or async depending on compile.
            # The codebase uses 'app.stream' in 'try_stream' which implies it's iterable.
            
            # Let's assume it's sync for now and just yield.
            
            for output in graph_app.stream(inputs, stream_mode="updates"):
                # yield step updates
                # Format: match what frontend expects or just generic events
                
                # Check for node name
                node_name = list(output.keys())[0] if output else "unknown"
                
                # Update our tracking state
                # Note: 'extract_latest_state' helper from main.py might be useful if we import it,
                # but simple update logic:
                if isinstance(output, dict):
                    if len(output) == 1 and isinstance(next(iter(output.values())), dict):
                        inner = next(iter(output.values()))
                        current_state.update(inner)
                    else:
                        current_state.update(output)

                # Calculate plan tasks count safely
                plan_tasks_count = 0
                plan_obj = current_state.get("plan")
                if plan_obj:
                    if hasattr(plan_obj, "tasks"): # Pydantic model
                        plan_tasks_count = len(plan_obj.tasks)
                    elif isinstance(plan_obj, dict):
                        plan_tasks_count = len(plan_obj.get("tasks", []))

                # Construct a summary for the frontend
                summary = {
                    "node": node_name,
                    "status": f"Finished step: {node_name}",
                    "state_summary": {
                        "mode": current_state.get("mode"),
                        "plan_tasks": plan_tasks_count,
                        "evidence_count": len(current_state.get("evidence", []) or []),
                        "images_count": len(current_state.get("image_specs", []) or []),
                    }
                }
                
                yield f"data: {json.dumps(summary)}\n\n"
                # Small sleep to let event loop breathe if needed
                await asyncio.sleep(0.01)

            # Final result is in current_state.get("final") -- actually wait
            # After stream ends, we might want to send a "complete" event ?
            # Or reliance on the client seeing the stream close.
            
            # Optionally check if 'final' is in current_state, if not, it might be in the last update
            
            final_md = current_state.get("final")
            if final_md:
                 yield f"data: {json.dumps({'status': 'complete', 'final': final_md})}\n\n"
            else:
                 yield f"data: {json.dumps({'status': 'complete', 'message': 'Stream ended'})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
