"""
Supabase Storage Helper Module

Provides functions to interact with Supabase Storage for uploading and retrieving
blog posts (markdown files) and images.
"""

import os
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from supabase import create_client, Client
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
SUPABASE_BUCKET = os.environ.get("SUPABASE_BUCKET", "blog-posts")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def upload_image(image_bytes: bytes, filename: str) -> str:
    """
    Upload an image to Supabase Storage.
    
    Args:
        image_bytes: Image data as bytes
        filename: Name of the image file (e.g., 'image_1.png')
    
    Returns:
        Public URL of the uploaded image
    """
    path = f"images/{filename}"
    
    # Upload to Supabase Storage
    supabase.storage.from_(SUPABASE_BUCKET).upload(
        path=path,
        file=image_bytes,
        file_options={"content-type": "image/png", "upsert": "true"}
    )
    
    # Get public URL
    public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(path)
    return public_url


def upload_markdown(content: str, filename: str) -> str:
    """
    Upload a markdown file to Supabase Storage.
    
    Args:
        content: Markdown content as string
        filename: Name of the markdown file (e.g., 'blog-title.md')
    
    Returns:
        Public URL of the uploaded markdown file
    """
    path = f"markdown/{filename}"
    
    # Convert string to bytes
    content_bytes = content.encode('utf-8')
    
    # Upload to Supabase Storage
    supabase.storage.from_(SUPABASE_BUCKET).upload(
        path=path,
        file=content_bytes,
        file_options={"content-type": "text/markdown", "upsert": "true"}
    )
    
    # Get public URL
    public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(path)
    return public_url


def list_blog_posts() -> List[Dict[str, any]]:
    """
    List all blog posts (markdown files) from Supabase Storage.
    
    Returns:
        List of dictionaries containing file metadata
    """
    try:
        # List all files in the markdown folder
        files = supabase.storage.from_(SUPABASE_BUCKET).list("markdown")
        
        blog_posts = []
        for file in files:
            if file.get("name", "").endswith(".md"):
                blog_posts.append({
                    "name": file["name"],
                    "created_at": file.get("created_at"),
                    "updated_at": file.get("updated_at"),
                    "size": file.get("metadata", {}).get("size", 0)
                })
        
        return blog_posts
    except Exception as e:
        print(f"Error listing blog posts: {e}")
        return []


def get_blog_post(filename: str) -> Optional[str]:
    """
    Retrieve markdown content from Supabase Storage.
    
    Args:
        filename: Name of the markdown file (e.g., 'blog-title.md')
    
    Returns:
        Markdown content as string, or None if not found
    """
    try:
        path = f"markdown/{filename}"
        
        # Download file content
        response = supabase.storage.from_(SUPABASE_BUCKET).download(path)
        
        # Decode bytes to string
        content = response.decode('utf-8')
        return content
    except Exception as e:
        print(f"Error retrieving blog post {filename}: {e}")
        return None


def get_public_url(path: str) -> str:
    """
    Get public URL for a file in Supabase Storage.
    
    Args:
        path: Path to the file in storage (e.g., 'images/image_1.png')
    
    Returns:
        Public URL of the file
    """
    return supabase.storage.from_(SUPABASE_BUCKET).get_public_url(path)


def delete_blog_post(filename: str) -> bool:
    """
    Delete a blog post and its associated images from Supabase Storage.
    
    Args:
        filename: Name of the markdown file
    
    Returns:
        True if successful, False otherwise
    """
    try:
        path = f"markdown/{filename}"
        supabase.storage.from_(SUPABASE_BUCKET).remove([path])
        return True
    except Exception as e:
        print(f"Error deleting blog post {filename}: {e}")
        return False
