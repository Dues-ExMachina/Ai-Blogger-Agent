"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateBlog, GenerationUpdate } from "@/lib/api"
import { Loader2, CheckCircle2, AlertCircle, FileText, Image as ImageIcon, Search } from "lucide-react"

export function BlogGenerator({ onComplete }: { onComplete: () => void }) {
    const [topic, setTopic] = useState("")
    const [asOf, setAsOf] = useState<string>(new Date().toISOString().split('T')[0])
    const [imageModel, setImageModel] = useState<'huggingface' | 'pollinations'>('huggingface')
    const [isGenerating, setIsGenerating] = useState(false)
    const [logs, setLogs] = useState<string[]>([])
    const [currentStep, setCurrentStep] = useState<string>("")
    const [stats, setStats] = useState<GenerationUpdate['state_summary']>({})
    const [error, setError] = useState<string | null>(null)
    const [finalMarkdown, setFinalMarkdown] = useState<string | null>(null)

    const handleGenerate = () => {
        if (!topic.trim()) return

        setIsGenerating(true)
        setLogs([])
        setError(null)
        setFinalMarkdown(null)
        setStats({})

        generateBlog(
            topic,
            asOf,
            imageModel,
            (msg) => setLogs(prev => [...prev, msg]), // logger
            (update) => {
                if (update.node) setCurrentStep(update.node)
                if (update.state_summary) setStats(update.state_summary)
            },
            (final) => {
                setIsGenerating(false)
                setFinalMarkdown(final)
                setCurrentStep("Completed")
                onComplete()
            },
            (err) => {
                setIsGenerating(false)
                setError(err)
            }
        )
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/40 bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60">
                <CardHeader>
                    <CardTitle>Generate New Blog Post</CardTitle>
                    <CardDescription>Enter a topic and let the AI agent research, plan, and write for you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="topic">Topic</Label>
                        <Textarea
                            id="topic"
                            placeholder="e.g., The Future of AI Agents in 2025"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            disabled={isGenerating}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="as-of">As-of Date</Label>
                        <Input
                            id="as-of"
                            type="date"
                            value={asOf}
                            onChange={(e) => setAsOf(e.target.value)}
                            disabled={isGenerating}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Image Generation Model</Label>
                        <Tabs defaultValue="huggingface" value={imageModel} onValueChange={(v) => setImageModel(v as 'huggingface' | 'pollinations')} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="huggingface" disabled={isGenerating}>HuggingFace (Key)</TabsTrigger>
                                <TabsTrigger value="pollinations" disabled={isGenerating}>Pollinations (Free)</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <p className="text-xs text-muted-foreground">
                            {imageModel === 'huggingface'
                                ? "Requires HF_API_KEY in backend .env. Fastest & high quality."
                                : "Free to use, slower, no API key required."}
                        </p>
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full"
                        onClick={handleGenerate}
                        disabled={isGenerating || !topic.trim()}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            "Start Generation"
                        )}
                    </Button>
                </CardFooter>
            </Card>

            <Card className="flex flex-col h-[600px] border-border/40 bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60">
                <CardHeader>
                    <CardTitle>Live Progress</CardTitle>
                    <CardDescription>
                        {isGenerating ? `Current Step: ${currentStep}` : "Ready to start"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden flex flex-col gap-4">
                    {/* Stats Dashboard */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 p-2 bg-muted rounded">
                            <Search className="h-4 w-4 text-blue-500" />
                            <span>Mode: {stats?.mode || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-muted rounded">
                            <FileText className="h-4 w-4 text-green-500" />
                            <span>Tasks: {stats?.plan_tasks || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-muted rounded">
                            <Search className="h-4 w-4 text-orange-500" />
                            <span>Evidence: {stats?.evidence_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-muted rounded">
                            <ImageIcon className="h-4 w-4 text-purple-500" />
                            <span>Images: {stats?.images_count || 0}</span>
                        </div>
                    </div>

                    <div className="flex-1 border rounded-md p-4 bg-black/5 font-mono text-xs">
                        <ScrollArea className="h-full w-full">
                            {logs.length === 0 && <span className="text-muted-foreground">Waiting for logs...</span>}
                            {logs.map((log, i) => (
                                <div key={i} className="mb-1 break-all">
                                    {log}
                                </div>
                            ))}
                        </ScrollArea>
                    </div>
                </CardContent>
                <CardFooter>
                    {finalMarkdown && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">Success</AlertTitle>
                            <AlertDescription className="text-green-700">
                                Blog generated successfully! Check the "Past Blogs" tab.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
