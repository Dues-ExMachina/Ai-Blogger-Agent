"use client"

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="container flex flex-col items-center justify-center gap-4 py-10 md:h-24 md:py-0">
                <p className="text-center text-sm leading-loose text-muted-foreground">
                    Built by{" "}
                    <a
                        href="#"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium underline underline-offset-4"
                    >
                        AI Blogger
                    </a>
                    . The source code is available on{" "}
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium underline underline-offset-4"
                    >
                        GitHub
                    </a>
                    .
                </p>
            </div>
        </footer>
    )
}
