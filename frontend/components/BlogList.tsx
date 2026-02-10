"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchPosts, BlogPost } from "@/lib/api"
import Link from "next/link"
import { FileText, Calendar, ArrowRight, RefreshCw } from "lucide-react"

export function BlogList({ keyProp }: { keyProp?: number }) {
    const [posts, setPosts] = useState<BlogPost[]>([])
    const [loading, setLoading] = useState(true)

    const loadPosts = async () => {
        setLoading(true)
        const data = await fetchPosts()
        setPosts(data)
        setLoading(false)
    }

    useEffect(() => {
        loadPosts()
    }, [keyProp])

    return (
        <Card className="h-full flex flex-col border-border/40 bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle>Recent Blogs</CardTitle>
                    <CardDescription>
                        {posts.length} posts generated so far.
                    </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={loadPosts} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[600px] px-6 pb-6">
                    <div className="space-y-4">
                        {posts.length === 0 && !loading && (
                            <div className="text-center py-10 text-muted-foreground">
                                No blogs found. Generate your first one!
                            </div>
                        )}

                        {posts.map((post) => (
                            <Link key={post.filename} href={`/posts/${post.filename}`} className="block group">
                                <div className="flex flex-col space-y-2 p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold truncate pr-4">{post.title}</h3>
                                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="flex items-center text-xs text-muted-foreground gap-4">
                                        <div className="flex items-center gap-1">
                                            <FileText className="h-3 w-3" />
                                            <span>{post.filename}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{new Date(post.created_at * 1000).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {post.preview.replace(/[#*`]/g, '')}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
