import { fetchPost } from "@/lib/api"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import Link from "next/link"
import { ArrowLeft, Calendar } from "lucide-react"

export default async function PostPage(
    props: {
        params: Promise<{ filename: string }>;
    }
) {
    const params = await props.params;
    const { filename } = params;

    // Note: Filename is URI encoded by browser usually, but Next.js params decodes it.
    // filename includes .md extension if we set href that way.
    // fetchPost expects filename.

    // Handling decoding just in case
    const decodedFilename = decodeURIComponent(filename)

    let content = "# Post Not Found";
    try {
        content = await fetchPost(decodedFilename);
    } catch (e) {
        console.error(e);
        content = `# Error\n\nCould not load post: ${decodedFilename}`;
    }

    // Extract title (simple heuristic)
    const titleMatch = content.match(/^# (.*)/);
    const title = titleMatch ? titleMatch[1] : decodedFilename;

    return (
        <div className="container mx-auto py-10 max-w-4xl px-4">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group">
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </Link>

            <div className="bg-background rounded-xl border p-8 md:p-12 shadow-sm">
                <div className="mb-8 border-b pb-4">
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">{title}</h1>
                    <div className="flex items-center text-muted-foreground gap-4 text-sm">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Now
                        </span>
                        <span>•</span>
                        <span>AI Generated</span>
                    </div>
                </div>

                <MarkdownRenderer content={content} />
            </div>
        </div>
    )
}
