"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import ChatsContent from "@/components/chats-content"

interface ChatUser {
  id: number
  profile_picture: string | null
  first_name: string
  middle_name: string | null
  last_name: string
  designation: string | null
  company: string | null
  latest_message: string
  timestamp: string | null
  message_id: number
}

export default function ChatsPage() {
  const searchParams = useSearchParams()
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = typeof window !== "undefined" ? user.id : null
  if (!currentUserId) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container py-6">
          <Card className="h-[calc(100vh-10rem)]">
            <CardContent className="flex items-center justify-center h-full">
              <p className="text-destructive">Please login to view your chats</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-6">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
              <div className="md:col-span-1">
                <Card className="h-full">
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p>Loading your chats...</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center justify-center h-full border rounded-lg bg-muted/50">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Preparing chat...</p>
                  </div>
                </div>
              </div>
            </div>
          }
        >
          <ChatsContent />
        </Suspense>
      </main>
    </div>
  )
}