"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Workflow,
    Code2,
    Database,
    Zap,
    Search,
    FileText,
    Image as ImageIcon,
    CheckCircle,
    ArrowRight,
    Layers,
    Globe,
    Sparkles
} from "lucide-react"

export default function DocsPage() {
    return (
        <div className="container mx-auto py-10 max-w-6xl">
            <div className="flex flex-col items-center mb-10 text-center space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-linear-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent drop-shadow-lg pb-2">
                    Documentation
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                    Complete guide to the AI Blog Writer Agent architecture, components, and workflow
                </p>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="architecture">Architecture</TabsTrigger>
                    <TabsTrigger value="components">Components</TabsTrigger>
                    <TabsTrigger value="workflow">Workflow</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-blue-600" />
                                What is AI Blog Writer Agent?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                An autonomous AI-powered blogging agent that automates the entire process of researching,
                                planning, writing, and illustrating high-quality technical blog posts using LangGraph and LLMs.
                            </p>

                            <div className="grid md:grid-cols-2 gap-4 mt-6">
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-yellow-600" />
                                        Key Features
                                    </h3>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li>• Autonomous web research via Tavily API</li>
                                        <li>• Intelligent content planning</li>
                                        <li>• Iterative drafting with fact verification</li>
                                        <li>• Automatic image generation</li>
                                        <li>• Real-time progress streaming</li>
                                        <li>• Dark/Light mode support</li>
                                    </ul>
                                </div>

                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <Code2 className="h-4 w-4 text-green-600" />
                                        Tech Stack
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <Badge variant="outline" className="mr-2">Backend</Badge>
                                            <span className="text-muted-foreground">Python, FastAPI, LangGraph</span>
                                        </div>
                                        <div>
                                            <Badge variant="outline" className="mr-2">Frontend</Badge>
                                            <span className="text-muted-foreground">Next.js, React, TypeScript</span>
                                        </div>
                                        <div>
                                            <Badge variant="outline" className="mr-2">AI</Badge>
                                            <span className="text-muted-foreground">Groq (Llama 3.1), Tavily</span>
                                        </div>
                                        <div>
                                            <Badge variant="outline" className="mr-2">Images</Badge>
                                            <span className="text-muted-foreground">HuggingFace, Pollinations</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Architecture Tab */}
                <TabsContent value="architecture" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Layers className="h-5 w-5 text-purple-600" />
                                System Architecture
                            </CardTitle>
                            <CardDescription>
                                The application follows a client-server architecture with a LangGraph state machine
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Architecture Diagram */}
                            <div className="bg-muted p-6 rounded-lg font-mono text-sm">
                                <div className="space-y-2">
                                    <div className="text-center font-bold text-blue-600">┌─────────────────────┐</div>
                                    <div className="text-center font-bold text-blue-600">│   Next.js Frontend  │</div>
                                    <div className="text-center font-bold text-blue-600">└──────────┬──────────┘</div>
                                    <div className="text-center">│ HTTP/SSE</div>
                                    <div className="text-center">▼</div>
                                    <div className="text-center font-bold text-green-600">┌─────────────────────┐</div>
                                    <div className="text-center font-bold text-green-600">│   FastAPI Backend   │</div>
                                    <div className="text-center font-bold text-green-600">└──────────┬──────────┘</div>
                                    <div className="text-center">│</div>
                                    <div className="text-center">▼</div>
                                    <div className="text-center font-bold text-purple-600">┌─────────────────────┐</div>
                                    <div className="text-center font-bold text-purple-600">│  LangGraph Engine   │</div>
                                    <div className="text-center font-bold text-purple-600">└──────────┬──────────┘</div>
                                    <div className="text-center">│</div>
                                    <div className="text-center grid grid-cols-3 gap-4">
                                        <div>
                                            <div className="text-orange-600">┌──────────┐</div>
                                            <div className="text-orange-600">│  Tavily  │</div>
                                            <div className="text-orange-600">└──────────┘</div>
                                        </div>
                                        <div>
                                            <div className="text-blue-600">┌──────────┐</div>
                                            <div className="text-blue-600">│   Groq   │</div>
                                            <div className="text-blue-600">└──────────┘</div>
                                        </div>
                                        <div>
                                            <div className="text-pink-600">┌──────────┐</div>
                                            <div className="text-pink-600">│ Images   │</div>
                                            <div className="text-pink-600">└──────────┘</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="font-semibold">Layer Breakdown</h3>

                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <div className="w-2 bg-blue-600 rounded"></div>
                                        <div>
                                            <h4 className="font-medium">Frontend Layer</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Next.js application with React components, Tailwind CSS styling, and real-time SSE streaming
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="w-2 bg-green-600 rounded"></div>
                                        <div>
                                            <h4 className="font-medium">API Layer</h4>
                                            <p className="text-sm text-muted-foreground">
                                                FastAPI server handling HTTP requests, SSE streaming, and file management
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="w-2 bg-purple-600 rounded"></div>
                                        <div>
                                            <h4 className="font-medium">Agent Layer</h4>
                                            <p className="text-sm text-muted-foreground">
                                                LangGraph state machine orchestrating research, planning, drafting, and image generation
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="w-2 bg-orange-600 rounded"></div>
                                        <div>
                                            <h4 className="font-medium">External Services</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Tavily (search), Groq (LLM), HuggingFace/Pollinations (images)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Components Tab */}
                <TabsContent value="components" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Code2 className="h-5 w-5 text-green-600" />
                                Frontend Components
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div className="border rounded-lg p-4">
                                    <h3 className="font-semibold mb-2">BlogGenerator.tsx</h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Main generation interface with topic input, date selector, and image model toggle
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        <Badge variant="secondary">State Management</Badge>
                                        <Badge variant="secondary">SSE Streaming</Badge>
                                        <Badge variant="secondary">Real-time Logs</Badge>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <h3 className="font-semibold mb-2">BlogList.tsx</h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Displays generated blog posts with preview and full-view modal
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        <Badge variant="secondary">API Integration</Badge>
                                        <Badge variant="secondary">Markdown Rendering</Badge>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <h3 className="font-semibold mb-2">MarkdownRenderer.tsx</h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Renders markdown with syntax highlighting and image support
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        <Badge variant="secondary">react-markdown</Badge>
                                        <Badge variant="secondary">Syntax Highlighting</Badge>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <h3 className="font-semibold mb-2">DynamicBackground.tsx</h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Interactive particle background with theme awareness
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        <Badge variant="secondary">TSParticles</Badge>
                                        <Badge variant="secondary">Theme Adaptive</Badge>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <h3 className="font-semibold mb-2">Navbar.tsx & Footer.tsx</h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Navigation and footer with glassmorphism styling
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        <Badge variant="secondary">Glassmorphism</Badge>
                                        <Badge variant="secondary">Dark Mode Toggle</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5 text-blue-600" />
                                Backend Components
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div className="border rounded-lg p-4">
                                    <h3 className="font-semibold mb-2">api.py</h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        FastAPI server with endpoints for blog generation, listing, and retrieval
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        <Badge variant="secondary">FastAPI</Badge>
                                        <Badge variant="secondary">SSE Streaming</Badge>
                                        <Badge variant="secondary">CORS</Badge>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <h3 className="font-semibold mb-2">main.py</h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        LangGraph state machine with nodes for research, planning, drafting, and image generation
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        <Badge variant="secondary">LangGraph</Badge>
                                        <Badge variant="secondary">State Machine</Badge>
                                        <Badge variant="secondary">Pydantic Models</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Workflow Tab */}
                <TabsContent value="workflow" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Workflow className="h-5 w-5 text-indigo-600" />
                                LangGraph State Machine
                            </CardTitle>
                            <CardDescription>
                                The agent follows a multi-step workflow orchestrated by LangGraph
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Workflow Steps */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                        <Zap className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold mb-1">1. Router Node</h3>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Determines if research is needed or if we can proceed directly to orchestration
                                        </p>
                                        <Badge variant="outline">Input: Topic, As-of Date</Badge>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground my-2" />
                                        <Badge variant="outline">Output: Routing Decision</Badge>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                                        <Search className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold mb-1">2. Research Node</h3>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Uses Tavily API to search the web and gather evidence about the topic
                                        </p>
                                        <Badge variant="outline">Input: Topic, Recency Days</Badge>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground my-2" />
                                        <Badge variant="outline">Output: Evidence Items (URLs, snippets)</Badge>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold mb-1">3. Orchestrator Node</h3>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Creates a detailed plan with sections, tasks, and structure for the blog post
                                        </p>
                                        <Badge variant="outline">Input: Topic, Evidence</Badge>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground my-2" />
                                        <Badge variant="outline">Output: Plan with Tasks</Badge>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                        <Code2 className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold mb-1">4. Worker Node (Parallel)</h3>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Executes tasks in parallel - writes individual sections based on the plan
                                        </p>
                                        <Badge variant="outline">Input: Task, Evidence</Badge>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground my-2" />
                                        <Badge variant="outline">Output: Section Markdown</Badge>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                        <Layers className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold mb-1">5. Reducer Subgraph</h3>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Three-step process to finalize the blog post
                                        </p>
                                        <div className="mt-3 space-y-2 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                                            <div>
                                                <h4 className="text-sm font-medium">5a. Merge Content</h4>
                                                <p className="text-xs text-muted-foreground">Combines all sections into a single markdown document</p>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium">5b. Decide Images</h4>
                                                <p className="text-xs text-muted-foreground">Analyzes content and determines which images to generate (0-2 images)</p>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium">5c. Generate and Place Images</h4>
                                                <p className="text-xs text-muted-foreground">Creates images using selected provider and embeds them in the markdown</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="bg-muted p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Graph Flow</h3>
                                <div className="font-mono text-xs bg-background p-3 rounded border space-y-1">
                                    <div>START → router</div>
                                    <div>router → research (if needed) OR orchestrator (if not)</div>
                                    <div>research → orchestrator</div>
                                    <div>orchestrator → [worker, worker, ...] (parallel fanout)</div>
                                    <div>workers → reducer</div>
                                    <div>reducer → END</div>
                                </div>
                            </div>

                            <Separator />
                            <div className="bg-muted p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">State Object</h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                    The LangGraph state maintains all information throughout the workflow:
                                </p>
                                <div className="font-mono text-xs bg-background p-3 rounded border">
                                    <div>topic: str</div>
                                    <div>as_of: str</div>
                                    <div>image_model: str</div>
                                    <div>queries: List[str]</div>
                                    <div>evidence: List[EvidenceItem]</div>
                                    <div>plan: Plan</div>
                                    <div>draft: str</div>
                                    <div>image_specs: List[ImageSpec]</div>
                                    <div>final_markdown: str</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-blue-600" />
                                API Integration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="border-l-4 border-blue-600 pl-4">
                                    <h4 className="font-semibold">Tavily Search API</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Real-time web search for gathering evidence and facts
                                    </p>
                                </div>

                                <div className="border-l-4 border-green-600 pl-4">
                                    <h4 className="font-semibold">Groq (Llama 3.1)</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Fast LLM inference for planning, drafting, and verification
                                    </p>
                                </div>

                                <div className="border-l-4 border-purple-600 pl-4">
                                    <h4 className="font-semibold">HuggingFace Inference API</h4>
                                    <p className="text-sm text-muted-foreground">
                                        High-quality image generation (requires API key)
                                    </p>
                                </div>

                                <div className="border-l-4 border-pink-600 pl-4">
                                    <h4 className="font-semibold">Pollinations.ai</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Free alternative for image generation (no API key required)
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
