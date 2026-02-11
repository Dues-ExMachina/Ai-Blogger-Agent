"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BlogGenerator } from "@/components/BlogGenerator"
import { BlogList } from "@/components/BlogList"
import { PenTool, Library } from "lucide-react"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("generate")
  const [refreshKey, setRefreshKey] = useState(0)

  const handleGenerationComplete = () => {
    setRefreshKey(prev => prev + 1)
    // Optionally switch tab after a delay? 
    // For now, let user see the success message in Generator.
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-8 max-w-5xl">
      <div className="flex flex-col items-center mb-10 text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-linear-to-r from-cyan-500 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient pb-2">
          AI Blog Writer Agent
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Powered by LangGraph. Research, plan, and write technical blogs in seconds.
        </p>
      </div>

      <Tabs defaultValue="generate" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="generate" className="flex items-center gap-2 cursor-pointer">
              <PenTool className="h-4 w-4" />
              Write New
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2 cursor-pointer">
              <Library className="h-4 w-4" />
              Past Blogs
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="generate" className="mt-0">
          <BlogGenerator onComplete={handleGenerationComplete} />
        </TabsContent>

        <TabsContent value="library" className="mt-0">
          <BlogList keyProp={refreshKey} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
