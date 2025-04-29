"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ChatList } from "@/components/chat-list"
import { Chat } from "@/components/chat"
import { Card, CardContent } from "@/components/ui/card"
import { getDropboxUrl } from "@/app/profile/[id]/page"

interface ChatUser {
  id: number
  profile_picture: string
  first_name: string
  middle_name: string | null
  last_name: string
  designation: string | null
  company: string | null
  latest_message: string
  timestamp: string | null
  message_id: number
}

interface Chat {
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


const formatMessageTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      // Invalid date fallback
      return timestamp;
    }

    // Use 12-hour format with AM/PM
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    // Fallback to extracting time manually (assumes ISO format)
    const timePart = timestamp.split('T')[1]?.split('.')[0]?.substring(0, 5);
    return timePart || timestamp;
  }
};


export default function ChatsContent() {
  const [chats, setChats] = useState<ChatUser[]>([])
  const [selectedChat, setSelectedChat] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const currentUserId = typeof window !== "undefined" ? user?.id : null

  useEffect(() => {
    const fetchChats = async () => {
      try {
        if (!currentUserId) {
          throw new Error("Current user ID not found")
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat_list?id=${currentUserId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch chats")
        }

        const data = await response.json()

        // Transform the data to match our interface
        const formattedChats = data.map((chat: any) => ({
          id: chat.id,
          profile_picture: getDropboxUrl(chat.profile_picture || "") || "/placeholder.svg",
          first_name: chat.first_name,
          middle_name: chat.middle_name || null,
          last_name: chat.last_name,
          designation: chat.designation || null,
          company: chat.company || null,
          latest_message: chat.latest_message || "No messages yet",
          timestamp: formatMessageTime(chat.timestamp || "") || "",
          message_id: chat.message_id
        }))

        setChats(formattedChats)
      } catch (error) {
        console.error("Error fetching chats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChats()

    // Check if there's a chat ID in the URL params (from profile page)
    const chatIdFromUrl = searchParams.get("id")
    if (chatIdFromUrl) {
      setSelectedChat(Number(chatIdFromUrl))
    }
  }, [currentUserId, searchParams])

  const handleChatSelect = (chatId: number) => {
    setSelectedChat(chatId)
  }

  const handleCloseChat = () => {
    setSelectedChat(null)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardContent className="flex items-center justify-center h-full">
              <p>Loading chats...</p>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <div className="flex items-center justify-center h-full border rounded-lg bg-muted/50">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }
  
  const chatIdFromUrl = searchParams.get("id")
  const hasUrlChat = chatIdFromUrl !== null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
      <div className={`md:col-span-1 ${selectedChat !== null ? "hidden md:block" : ""}`}>
        {chats.length > 0 ? (
          <ChatList 
            chats={chats} 
            selectedChatId={selectedChat} 
            onChatSelect={handleChatSelect} 
            formatChat={(chat: Chat) => ({
              id: chat.id,
              profileImage: getDropboxUrl(chat.profile_picture || "") || "/placeholder.svg",
              firstName: chat.first_name,
              middleName: chat.middle_name || "",
              lastName: chat.last_name,
              latestMessage: chat.latest_message,
              duration: chat.timestamp || "",
              designation: chat.designation || "",
              company: chat.company || ""
            })}
          />
        ) : (
          <Card className="h-full">
            <CardContent className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No conversations yet</p>
            </CardContent>
          </Card>
        )}
      </div>
      <div className={`md:col-span-2 ${selectedChat === null && !hasUrlChat ? "hidden md:block" : ""}`}>
        {selectedChat !== null || hasUrlChat ? (
          <Chat 
            chatId={selectedChat !== null ? selectedChat : Number(chatIdFromUrl)} 
            onClose={handleCloseChat} 
            currentUserId={currentUserId ? parseInt(currentUserId) : 0}
          />
        ) : (
          <div className="flex items-center justify-center h-full border rounded-lg bg-muted/50">
            <p className="text-muted-foreground">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}