"use client"

import Link from "next/link"
import { Github } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <span className="font-bold sm:inline-block">
                        AI Blogger
                    </span>
                </Link>
                <nav className="flex items-center gap-2">
                    <Link
                        href="https://github.com"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 py-2 w-9 px-0"
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
