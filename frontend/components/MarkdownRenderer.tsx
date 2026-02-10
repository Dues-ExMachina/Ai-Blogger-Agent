"use client"

import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { API_BASE_URL } from '@/lib/api'
import Image from 'next/image'

export function MarkdownRenderer({ content }: { content: string }) {
    return (
        <article className="prose prose-slate lg:prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown
                components={{
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                            <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        )
                    },
                    img({ src, alt }: any) {
                        // Handle relative image paths from backend
                        // Backend markdown uses "images/filename.png"
                        // Start with /, so we need to prepend API_BASE_URL if it's served via static mount
                        // or just use /images if we proxy.
                        // My API mounts /images at root.

                        let finalSrc = src;
                        if (src && !src.startsWith('http')) {
                            // If it starts with images/, prepend API URL
                            if (src.startsWith('images/')) {
                                finalSrc = `${API_BASE_URL}/${src}`;
                            } else if (!src.startsWith('/')) {
                                finalSrc = `${API_BASE_URL}/images/${src}`;
                            }
                        }

                        return (
                            <img
                                src={finalSrc}
                                alt={alt || 'Blog Image'}
                                className="my-6 rounded-lg shadow-md max-h-[500px] w-auto mx-auto border block"
                            />
                        )
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </article>
    )
}
