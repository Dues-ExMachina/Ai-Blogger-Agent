
from __future__ import annotations

import operator
import os
import re
from datetime import date, timedelta
from pathlib import Path
from typing import TypedDict, List, Optional, Literal, Annotated

from pydantic import BaseModel, Field, ConfigDict

from langgraph.graph import StateGraph, START, END
from langgraph.types import Send

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from dotenv import load_dotenv

import requests
import base64

# Import Supabase storage helper
import supabase_storage

load_dotenv()

# ============================================================
# Blog Writer (Router → (Research?) → Orchestrator → Workers → ReducerWithImages)
# Patches image capability using your 3-node reducer flow:
#   merge_content -> decide_images -> generate_and_place_images
# ============================================================


# -----------------------------
# 1) Schemas
# -----------------------------
class Task(BaseModel):
    """Single task in blog outline with strict field ordering"""
    model_config = ConfigDict(extra='forbid', strict=True)
    
    id: int
    title: str
    goal: str = Field(..., description="One sentence describing what the reader should understand")
    bullets: List[str] = Field(..., min_length=3, max_length=3, description="Exactly 3 key points")
    target_words: int = Field(default=300, description="Target word count")
    requires_research: bool = Field(default=False)
    requires_citations: bool = Field(default=False)
    requires_code: bool = Field(default=False)


class Plan(BaseModel):
    """Blog outline plan with strict field ordering for Groq compatibility"""
    model_config = ConfigDict(extra='forbid', strict=True)
    
    blog_title: str
    blog_kind: Literal["explainer", "tutorial", "news_roundup", "comparison", "system_design"] = "explainer"
    audience: str = Field(default="Technical Professionals")
    tone: str = Field(default="Neutral")
    recency_days: int = Field(default=30)
    tasks: List[Task] = Field(..., min_length=3, max_length=3, description="Exactly 3 tasks")


class EvidenceItem(BaseModel):
    title : str
    url : str
    published_at : Optional[str] = None  # ISO "YYYY-MM-DD"
    snippet : Optional[str] = None
    source : Optional[str] = None



class RouterDecision(BaseModel):
    needs_research: bool
    mode: Literal["closed_book", "hybrid", "open_book"]
    reason: str
    queries: List[str] = Field(default_factory=list)
    max_results_per_query: int = Field(3)


class EvidencePack(BaseModel):
    evidence: List[EvidenceItem] = Field(default_factory=list)


# --- Image Planning Schema(Ported from your image flow) ---
class ImageSpec(BaseModel):
    """Image specification with strict requirements to minimize payload"""
    model_config = ConfigDict(extra='forbid', strict=True)
    
    placeholder: str = Field(..., description="REQUIRED: [[IMAGE_1]] or [[IMAGE_2]]")
    filename: str = Field(..., description="image_1.png or image_2.png")
    alt: str = Field(..., max_length=50, description="Short alt text, max 50 chars")
    caption: str = Field(..., max_length=80, description="Short caption, max 80 chars")
    prompt: str = Field(..., max_length=200, description="Image generation prompt, max 200 chars")
    
class GlobalImagePlan(BaseModel):
    """Image plan - Returns only image specs, not full markdown to avoid payload bloat"""
    model_config = ConfigDict(extra='forbid', strict=True)
    
    images: List[ImageSpec] = Field(default_factory=list, max_length=2, description="0-2 image specs")


# --- Define state ---
class State(TypedDict):
    topic: str

    # Routing / Research
    mode: str
    needs_research: bool
    queries: List[str]
    evidence: List[EvidenceItem]
    plan: Optional[Plan]
    image_model: Optional[str]

    # Recency
    as_of: str
    recency_days: int

    # Workers
    sections: Annotated[List[tuple[int,str]], operator.add] # (task_id, section_md)

    # Reducer/Image
    merged_md:str
    md_with_placeholders: str
    image_specs: List[dict]

    final: str




# -----------------------------
# 2) LLM
# -----------------------------
llm = ChatGroq(model="llama-3.1-8b-instant")

# -----------------------------
# 3) Router
# -----------------------------
ROUTER_SYSTEM="""You are a routing module for a technical blog planner.

Decide whether web research is needed BEFORE planning.

Modes:
- closed_book (needs_research=false): evergreen concepts.
- hybrid (needs_research=true): evergreen + needs up-to-date examples/tools/models.
- open_book (needs_research=true): volatile weekly/news/"latest"/pricing/policy.

If needs_research=true:
- Output 3–10 high-signal, scoped queries.
- For open_book weekly roundup, include queries reflecting last 7 days.
"""

def router_node(state: State) -> dict:
    decider = llm.with_structured_output(RouterDecision)
    decision = decider.invoke(
        [
            SystemMessage(content=ROUTER_SYSTEM),
            HumanMessage(content=f"Topic: {state['topic']}\nAs-of Date:{state['as_of']}"),
        ]
    )

    if decision.mode == "open_book":
        recency_days = 7
    elif decision.mode == "hybrid":
        recency_days = 45
    else:
        recency_days = 3650

    return {
        "needs_research": decision.needs_research,
        "mode": decision.mode,
        "queries": decision.queries,
        "recency_days": recency_days,
    }

def route_next(state: State) -> str:
    return "research" if state["needs_research"] else "orchestrator"

# -----------------------------
# 4) Research (Tavily)
# -----------------------------
# def _tavily_search(query: str, max_results: int = 3) -> List[dict]:
#     if not os.getenv("TAVILY_API_KEY"):
#         return []
#     try:
#         from langchain_community.tools.tavily_search import TavilySearchResults
#         tool = TavilySearchResults(max_results=max_results)
#         results = tool.invoke({"query":query})
#         out: List[dict] = []
#         for r in results or []:
#             out.append(
#                 {
#                     "title": r.get("title") or "",
#                     "url": r.get("url") or "",
#                     "snippet": r.get("content") or r.get("snippet") or "",
#                     "published_at": r.get("published_date") or r.get("published_at"),
#                     "source": r.get("source"),
#                 }
#             )
#         return out
#     except Exception:
#         return []
def _tavily_search(query: str, max_results: int = 3) -> List[dict]:
    if not os.getenv("TAVILY_API_KEY"):
        return []
    try:
        #  import - use TavilySearch
        from langchain_tavily import TavilySearch
        
        tool = TavilySearch(max_results=max_results)
        results = tool.invoke({"query": query})
        
        out: List[dict] = []
        for r in results or []:
            out.append(
                {
                    "title": r.get("title") or "",
                    "url": r.get("url") or "",
                    "snippet": r.get("content") or r.get("snippet") or "",
                    "published_at": r.get("published_date") or r.get("published_at"),
                    "source": r.get("source"),
                }
            )
        return out
    except Exception:
        return []

def _iso_to_date(s: Optional[str]) -> Optional[date]:
    if not s:
        return None
    try:
        return date.fromisoformat(s[:10])
    except Exception:
        return None
    

RESEARCH_SYSTEM = """You are a research synthesizer.

Given raw web search results, produce EvidenceItem objects.

Rules:
- Only include items with a non-empty url.
- Prefer relevant + authoritative sources.
- Normalize published_at to ISO YYYY-MM-DD if reliably inferable; else null (do NOT guess).
- Keep snippets short.
- Deduplicate by URL.
"""

def research_node(state: State) -> dict:
    queries = (state.get("queries") or [])[:10]
    raw: List[dict] = []   
    for q in queries:
        raw.extend(_tavily_search(q, max_results=5))
    
    if not raw:
        return {"evidence":[]}

    extractor = llm.with_structured_output(EvidencePack)
    pack = extractor.invoke(
        [
            SystemMessage(content=RESEARCH_SYSTEM),
            HumanMessage(
                content=(
                    f"As-of date: {state['as_of']}\n"
                    f"Recency days: {state['recency_days']}\n\n"
                    f"Raw results:\n{raw}"
                )
            ),
        ]
    )

    dedup = {}
    for e in pack.evidence:
        if e.url:
            dedup[e.url] = e
    evidence = list(dedup.values())

    if state.get("mode") == "open_book":
        as_of = date.fromisoformat(state["as_of"])
        cutoff = as_of - timedelta(days=int(state["recency_days"]))
        evidence = [e for e in evidence if (d:= _iso_to_date(e.published_at)) and d >= cutoff]

    return {"evidence": evidence}

# -----------------------------
# 5) Orchestrator (Plan)
# -----------------------------
ORCH_SYSTEM = """Create a concise blog outline.

STRICT REQUIREMENTS:
- Generate EXACTLY 3 tasks (no more, no less)
- Each task must have EXACTLY 3 bullets
- Use target_words=300 for all tasks
- Only set boolean flags to true when absolutely essential

Modes:
- closed_book: evergreen content
- hybrid: concepts + recent examples
- open_book: set blog_kind="news_roundup"
"""


def orchestrator_node(state: State) -> dict:
    planner = llm.with_structured_output(Plan)
    mode = state.get("mode", "closed_book")
    evidence = state.get("evidence", [])

    forced_kind = "news_roundup" if mode == "open_book" else None

    plan = planner.invoke(
        [
            SystemMessage(content= ORCH_SYSTEM),
            HumanMessage(
                content=(
                    f"Topic: {state['topic']}\n"
                    f"Mode: {mode}\n"
                    f"As-of: {state['as_of']} (recency_days={state['recency_days']})\n"
                    f"{'Force blog_kind=news_roundup' if forced_kind else ''}\n\n"
                    f"Evidence:\n{[e.model_dump() for e in evidence][:16]}"
                )
            ),
        ]
    )
    if forced_kind:
        plan.blog_kind = "news_roundup"

    return {"plan": plan}


# -----------------------------
# 6) Fanout (Condition of conditional EDGE)
# -----------------------------
def fanout(state:State):
    assert state['plan'] is not None
    return [
        Send(
            "worker",
            {
                "task": task.model_dump(),
                "topic": state["topic"],
                "mode": state["mode"],
                "as_of": state["as_of"],
                "recency_days": state["recency_days"],
                "plan": state["plan"].model_dump(),
                "evidence": [e.model_dump() for e in state.get("evidence", [])],
            },
        )
        for task in state['plan'].tasks
    ]



# -----------------------------
# 7) Worker
# -----------------------------
WORKER_SYSTEM = """You are a senior technical writer and developer advocate.
Write ONE section of a technical blog post in Markdown.

Constraints:
- Cover ALL bullets in order.
- Target words ±15%.
- Output only section markdown starting with "## <Section Title>".

Scope guard:
- If blog_kind=="news_roundup", do NOT drift into tutorials (scraping/RSS/how to fetch).
  Focus on events + implications.

Grounding:
- If mode=="open_book": do not introduce any specific event/company/model/funding/policy claim unless supported by provided Evidence URLs.
  For each supported claim, attach a Markdown link ([Source](URL)).
  If unsupported, write "Not found in provided sources."
- If requires_citations==true (hybrid tasks): cite Evidence URLs for external claims.

Code:
- If requires_code==true, include at least one minimal snippet.
"""

def worker_node(payload: dict) -> dict:
    task = Task(**payload["task"])
    plan = Plan(**payload['plan'])
    evidence = [EvidenceItem(**e) for e in payload.get("evidence", [])]

    bullets_text = "\n- " + "\n- ".join(task.bullets)
    evidence_text = "\n".join(
        f"- {e.title} | {e.published_at or 'date:Unknown'}" for e in evidence[:20]
    )

    section_md = llm.invoke(
        [
            SystemMessage(content=WORKER_SYSTEM),
            HumanMessage(
                content=(
                    f"Blog title: {plan.blog_title}\n"
                    f"Audience: {plan.audience}\n"
                    f"Tone: {plan.tone}\n"
                    f"Blog kind: {plan.blog_kind}\n"
                    f"Topic: {payload['topic']}\n"
                    f"Mode: {payload.get('mode')}\n"
                    f"As-of: {payload.get('as_of')} (recency_days={payload.get('recency_days')})\n\n"
                    f"Section title: {task.title}\n"
                    f"Goal: {task.goal}\n"
                    f"Target words: {task.target_words}\n"
                    f"requires_research: {task.requires_research}\n"
                    f"requires_citations: {task.requires_citations}\n"
                    f"requires_code: {task.requires_code}\n"
                    f"Bullets:{bullets_text}\n\n"
                    f"Evidence (ONLY cite these URLs):\n{evidence_text}\n"
                )
            ),
        ]
    ).content.strip()

    return {"sections": [(task.id, section_md)]}



# ============================================================
# 8) ReducerWithImages (subgraph)
#    merge_content -> decide_images -> generate_and_place_images
# ============================================================
def merge_content(state: State) -> dict:
    plan = state["plan"]
    if plan is None:
        raise ValueError("merge_content called without plan.")
    ordered_sections = [md for _, md in sorted(state["sections"], key=lambda x: x[0])]
    body = "\n\n".join(ordered_sections).strip()
    merged_md = f"# {plan.blog_title}\n\n{body}\n"
    return {"merged_md": merged_md}


DECIDE_IMAGES_SYSTEM = """Expert technical editor: Decide which images to add to blog.

STRICT RULES:
- Return 0-2 image specs (prefer 0 if blog is clear without images)
- Only add images if they materially improve understanding
- For each image: placeholder=[[IMAGE_1]] or [[IMAGE_2]], filename=image_1.png or image_2.png
- Keep all text fields SHORT (alt<50 chars, caption<80 chars, prompt<200 chars)
- Focus on technical diagrams, flows, or charts - NOT decorative images

DO NOT return the full markdown - only return the image specs array.
"""

def decide_images(state: State) -> dict:
    planner = llm.with_structured_output(GlobalImagePlan)
    merged_md = state["merged_md"]
    plan = state["plan"]
    assert plan is not None

    # Truncate markdown for LLM to avoid huge payloads
    preview_md = merged_md[:2000] + ("..." if len(merged_md) > 2000 else "")

    image_plan = planner.invoke(
        [
            SystemMessage(content=DECIDE_IMAGES_SYSTEM),
            HumanMessage(
                content=(
                    f"Blog kind: {plan.blog_kind}\n"
                    f"Topic: {state['topic']}\n\n"
                    f"Blog preview (first 2000 chars):\n{preview_md}\n\n"
                    "Return image specs array. Output ONLY the image specs, NOT the markdown."
                )
            ),
        ]
    )

    # Manually insert placeholders into markdown
    md_with_placeholders = merged_md
    for img in image_plan.images:
        # Insert placeholder at the end of the first section after the title
        # Simple heuristic: after first "##" heading
        lines = md_with_placeholders.split('\n')
        insert_idx = None
        for i, line in enumerate(lines):
            if line.startswith('## ') and insert_idx is None:
                # Find end of this section (next ## or end)
                for j in range(i+1, len(lines)):
                    if lines[j].startswith('## ') or j == len(lines) - 1:
                        insert_idx = j
                        break
                break
        
        if insert_idx:
            lines.insert(insert_idx, f"\n{img.placeholder}\n")
            md_with_placeholders = '\n'.join(lines)

    return {
        "md_with_placeholders": md_with_placeholders,
        "image_specs": [img.model_dump() for img in image_plan.images],
    }



def _pollinations_generate_image_bytes(prompt: str) -> bytes:
    """
    Generate image using Pollinations.ai (FREE, no API key needed!)
    Uses FLUX Pro model via their free API.
    """
    import urllib.parse
    
    # URL encode the prompt
    encoded_prompt = urllib.parse.quote(prompt)
    
    # Build the URL with parameters
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}"
    params = {
        "width": "1024",
        "height": "768",
        "nologo": "true",
        "model": "flux",  # Options: flux, flux-realism, flux-anime, flux-3d
        "enhance": "true"  # AI prompt enhancement
    }
    
    # Add params to URL
    param_str = "&".join([f"{k}={v}" for k, v in params.items()])
    full_url = f"{url}?{param_str}"
    
    response = requests.get(full_url, timeout=60)
    
    if response.status_code != 200:
        raise RuntimeError(f"Pollinations API error {response.status_code}")
    
    return response.content


def _huggingface_generate_image_bytes(prompt: str) -> bytes:
    """
    Generate image using Hugging Face Inference API (FREE with API key)
    Get your free API key at: https://huggingface.co/settings/tokens
    """
    api_key = os.environ.get("HF_API_KEY")
    if not api_key:
        raise RuntimeError("HF_API_KEY is not set. Get free key at https://huggingface.co/settings/tokens")
    
    # FLUX.1-schnell is fast and free
    # API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell"
    API_URL = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell"
    
    headers = {"Authorization": f"Bearer {api_key}"}
    
    payload = {"inputs": prompt}
    
    response = requests.post(API_URL, headers=headers, json=payload, timeout=60)
    
    if response.status_code != 200:
        raise RuntimeError(f"HuggingFace API error {response.status_code}: {response.text}")
    
    return response.content
# --------------------------------------------------------------------
# def _huggingface_generate_image_bytes(prompt: str) -> bytes:
#     """
#     Generate image using Hugging Face Inference API (Requests version).
#     """
#     # Try to get key from either variable name
#     api_key = os.environ.get("HF_API_KEY") or os.environ.get("HF_TOKEN")
#     if not api_key:
#         raise RuntimeError("HF_API_KEY or HF_TOKEN is not set in .env")
    
#     # FIX: Use the new 'router' URL instead of the old 'api-inference' one
#     API_URL = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell"
    
#     headers = {"Authorization": f"Bearer {api_key}"}
#     payload = {"inputs": prompt}
    
#     # Perform the request
#     response = requests.post(API_URL, headers=headers, json=payload, timeout=60)
    
#     if response.status_code != 200:
#         raise RuntimeError(f"HuggingFace API error {response.status_code}: {response.text}")
    
#     # This returns the raw binary data of the image (PNG/JPG)
#     return response.content


def _nvidia_generate_image_bytes(prompt: str) -> bytes:
    """
    Returns raw image bytes generated by NVIDIA Stable Diffusion 3.
    Env var required: NVIDIA_API_KEY
    """

    api_key = os.environ.get("NVIDIA_API_KEY")
    if not api_key:
        raise RuntimeError("NVIDIA_API_KEY is not set.")

    invoke_url = (
        "https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3-medium"
    )

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
    }

    payload = {
        "prompt": prompt,
        "cfg_scale": 5,
        "aspect_ratio": "16:9",
        "seed": 0,
        "steps": 50,
        "negative_prompt": "",
    }

    response = requests.post(invoke_url, headers=headers, json=payload)
    
    # Better error handling
    if response.status_code != 200:
        error_msg = f"NVIDIA API error {response.status_code}: {response.text}"
        raise RuntimeError(error_msg)

    data = response.json()
    
    # Debug: print the response structure if artifacts are missing
    if "artifacts" not in data:
        print(f"DEBUG: NVIDIA API response: {data}")
        raise RuntimeError(f"No image artifacts returned. Response keys: {list(data.keys())}")

    artifacts = data.get("artifacts")
    if not artifacts:
        raise RuntimeError("Artifacts field is empty.")

    image_base64 = artifacts[0].get("base64")
    if not image_base64:
        raise RuntimeError("No base64 image found in first artifact.")

    return base64.b64decode(image_base64)

def _safe_slug(title: str) -> str:
    s = title.strip().lower()
    s = re.sub(r"[^a-z0-9 _-]+", "", s)
    s = re.sub(r"\s+", "_", s).strip("_")
    return s or "blog"


def generate_and_place_images(state: State) -> dict:
    plan = state["plan"]
    assert plan is not None

    md = state.get("md_with_placeholders") or state["merged_md"]
    image_specs = state.get("image_specs", []) or []
    
    # OPTION: Set to False to disable image generation entirely
    ENABLE_IMAGE_GENERATION = os.getenv("ENABLE_IMAGE_GENERATION", "true").lower() == "true"
    
    # Priority: State > Env Var > Default
    IMAGE_PROVIDER = state.get("image_model") or os.getenv("IMAGE_PROVIDER", "huggingface").lower()

    # If no images requested or image generation disabled, just write merged markdown
    if not image_specs or not ENABLE_IMAGE_GENERATION:
        if image_specs and not ENABLE_IMAGE_GENERATION:
            # Remove image placeholders if generation is disabled
            for spec in image_specs:
                placeholder = spec["placeholder"]
                md = md.replace(placeholder, f"*[Image: {spec.get('caption', 'Illustration')}]*")
        
        filename = f"{_safe_slug(plan.blog_title)}.md"
        # Upload markdown to Supabase
        supabase_storage.upload_markdown(md, filename)
        return {"final": md}

    print(f"🖼️  Generating images using: {IMAGE_PROVIDER}")

    for spec in image_specs:
        placeholder = spec["placeholder"]
        filename = spec["filename"]

        try:
            # Select provider based on IMAGE_PROVIDER env variable
            if IMAGE_PROVIDER == "huggingface":
                img_bytes = _huggingface_generate_image_bytes(spec["prompt"])
            elif IMAGE_PROVIDER == "pollinations":
                img_bytes = _pollinations_generate_image_bytes(spec["prompt"])
            elif IMAGE_PROVIDER == "nvidia":
                img_bytes = _nvidia_generate_image_bytes(spec["prompt"])
            else:
                # Default to HuggingFace with Pollinations fallback
                try:
                    img_bytes = _huggingface_generate_image_bytes(spec["prompt"])
                except RuntimeError as e:
                    if "HF_API_KEY" in str(e):
                        print(f"⚠️  HF_API_KEY not set, falling back to Pollinations.ai...")
                        img_bytes = _pollinations_generate_image_bytes(spec["prompt"])
                    else:
                        raise
            
            # Upload image to Supabase and get public URL
            public_url = supabase_storage.upload_image(img_bytes, filename)
            print(f"  ✅ Generated and uploaded: {filename}")
            
            # Use Supabase public URL in markdown
            img_md = f"![{spec['alt']}]({public_url})\n*{spec['caption']}*"
            md = md.replace(placeholder, img_md)
            
        except Exception as e:
            # graceful fallback: keep doc usable
            prompt_block = (
                f"> **[IMAGE GENERATION FAILED]** {spec.get('caption','')}\n>\n"
                f"> **Alt:** {spec.get('alt','')}\n>\n"
                f"> **Prompt:** {spec.get('prompt','')}\n>\n"
                f"> **Error:** {e}\n"
            )
            md = md.replace(placeholder, prompt_block)
            continue

    # Upload final markdown to Supabase
    filename = f"{_safe_slug(plan.blog_title)}.md"
    supabase_storage.upload_markdown(md, filename)
    print(f"📝 Uploaded markdown to Supabase: {filename}")
    return {"final": md}




# -----------------------------
# 9) Build Reducer sub-graph
# -----------------------------
reducer_graph = StateGraph(State)
reducer_graph.add_node("merge_content", merge_content)
reducer_graph.add_node("decide_images", decide_images)
reducer_graph.add_node("generate_and_place_images", generate_and_place_images)
reducer_graph.add_edge(START, "merge_content")
reducer_graph.add_edge("merge_content", "decide_images")
reducer_graph.add_edge("decide_images", "generate_and_place_images")
reducer_graph.add_edge("generate_and_place_images", END)
reducer_subgraph = reducer_graph.compile()



# -----------------------------
# 10) Build main graph
# -----------------------------
g = StateGraph(State)
g.add_node("router", router_node)
g.add_node("research", research_node)
g.add_node("orchestrator", orchestrator_node)
g.add_node("worker", worker_node)
g.add_node("reducer", reducer_subgraph)

g.add_edge(START, "router")
g.add_conditional_edges("router", route_next, {"research": "research", "orchestrator": "orchestrator"})
g.add_edge("research", "orchestrator")

g.add_conditional_edges("orchestrator", fanout, ["worker"])
g.add_edge("worker", "reducer")
g.add_edge("reducer", END)

app = g.compile()
app

if __name__ == "__main__":
    # 1. Prepare the initial state
    initial_state = {
        "topic": "The future of Agentic Workflows in 2026",
        "as_of": date.today().isoformat(),
        "recency_days": 30,
        "sections": []
    }

    # 2. Run the graph
    print("--- Starting Blog Generation ---")
    final_output = app.invoke(initial_state)

    # 3. Print the final result location
    print("\n--- Generation Complete! ---")
    print(f"Final blog content length: {len(final_output['final'])} characters.")
    print("Check the current directory for the generated .md file and the /images folder.")