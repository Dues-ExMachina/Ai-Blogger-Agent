export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface BlogPost {
    filename: string;
    title: string;
    created_at: number;
    preview: string;
}

export interface GenerationUpdate {
    node?: string;
    status: string;
    state_summary?: {
        mode?: string;
        plan_tasks?: number;
        evidence_count?: number;
        images_count?: number;
    };
    final?: string;
    error?: string;
    message?: string;
}

export async function fetchPosts(): Promise<BlogPost[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/posts`);
        if (!res.ok) throw new Error('Failed to fetch posts');
        return await res.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function fetchPost(filename: string): Promise<string> {
    const res = await fetch(`${API_BASE_URL}/posts/${filename}`);
    if (!res.ok) throw new Error('Failed to fetch post content');
    return await res.text();
}

export function generateBlog(
    topic: string,
    as_of: string | undefined,
    imageModel: 'huggingface' | 'pollinations',
    onLog: (msg: string) => void,
    onUpdate: (update: GenerationUpdate) => void,
    onComplete: (finalContent: string) => void,
    onError: (error: string) => void
) {
    // Using fetch with ReadableStream for SSE-like streaming over POST
    fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, as_of, image_model: imageModel }),
    }).then(async (response) => {
        if (!response.body) {
            throw new Error("ReadableStream not supported.");
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            const lines = buffer.split('\n');
            // Keep the last partial line in buffer if not empty
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.trim() === '') continue;
                if (line.startsWith('data: ')) {
                    const dataStr = line.replace('data: ', '').trim();
                    if (!dataStr) continue;

                    try {
                        const data = JSON.parse(dataStr);
                        if (data.error) {
                            onError(data.error);
                        } else if (data.final) {
                            onComplete(data.final);
                        } else {
                            onUpdate(data);
                            onLog(`[${data.node || 'update'}] ${data.status}`);
                        }
                    } catch (e) {
                        console.error("Error parsing SSE data", e);
                    }
                }
            }
        }
    }).catch(e => {
        onError(e instanceof Error ? e.message : String(e));
    });
}
