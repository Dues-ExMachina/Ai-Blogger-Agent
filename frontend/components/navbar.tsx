"use client"

import Link from "next/link"
import { Github } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center justify-between pl-25 pr-25">
                <Link href="/" className="mr-6 flex items-center space-x-2 group">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                            <span className="text-white font-bold text-lg">AI</span>
                        </div>
                        <span className="font-bold text-lg bg-linear-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                            AI Blogger
                        </span>
                    </div>
                </Link>
                <div className="flex items-center gap-2">
                    <Link
                        href="/"
                        className="px-3 py-1.5 text-sm font-medium rounded-md transition-all hover:bg-linear-to-r hover:from-cyan-500/10 hover:to-blue-500/10 hover:text-cyan-600 dark:hover:text-cyan-400"
                    >
                        Home
                    </Link>
                    <Link
                        href="/docs"
                        className="px-3 py-1.5 text-sm font-medium rounded-md transition-all hover:bg-linear-to-r hover:from-purple-500/10 hover:to-pink-500/10 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                        Docs
                    </Link>
                </div>
                <nav className="flex items-center gap-2">
                    <Link
                        href="https://github.com/Dues-ExMachina/Ai-Blogger-Agent"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 w-9 hover:bg-linear-to-br hover:from-gray-800 hover:to-gray-900 dark:hover:from-gray-700 dark:hover:to-gray-800 hover:text-white"
                    >
                        <Github className="h-4 w-4" />
                        <span className="sr-only">GitHub</span>
                    </Link>
                    <ModeToggle />
                </nav>
            </div>
        </nav>
    )
}
