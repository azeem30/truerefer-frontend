"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Search, UserCheck, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { AnimatedLogo } from "@/components/animated-logo"
import { motion } from "framer-motion"

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
  unread?: boolean
  status?: "online" | "away" | "offline"
}

interface ChatListProps {
  chats: Chat[]
  selectedChatId: number | null
  onChatSelect: (chatId: number) => void
  formatChat?: (chat: Chat) => {
    id: number
    profileImage: string
    firstName: string
    middleName: string
    lastName: string
    latestMessage: string
    duration: string
    designation: string
    company: string
    unread?: boolean
    status?: "online" | "away" | "offline"
  }
}

const formatMessageTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp)
    const now = new Date()

    if (isNaN(date.getTime())) {
      // Invalid date fallback
      return timestamp
    }

    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    }

    // If within the last week, show day name
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    if (date > oneWeekAgo) {
      return date.toLocaleDateString([], { weekday: "short" })
    }

    // Otherwise show date
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    })
  } catch {
    // Fallback to extracting time manually (assumes ISO format)
    const timePart = timestamp.split("T")[1]?.split(".")[0]?.substring(0, 5)
    return timePart || timestamp
  }
}

export function ChatList({ chats, selectedChatId, onChatSelect, formatChat }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "unread" | "recent">("all")

  const defaultFormatChat = (chat: Chat) => ({
    id: chat.id,
    profileImage: chat.profile_picture || "/placeholder.svg",
    firstName: chat.first_name,
    middleName: chat.middle_name || "",
    lastName: chat.last_name,
    latestMessage: chat.latest_message || "No messages yet",
    duration: formatMessageTime(chat.timestamp || "") || "",
    designation: chat.designation || "",
    company: chat.company || "",
    unread: chat.unread || false,
    status: chat.status || "offline",
  })

  const formatFunction = formatChat || defaultFormatChat

  // Filter chats based on search query and filter type
  const filteredChats = chats.filter((chat) => {
    const formattedChat = formatFunction(chat)
    const fullName = `${formattedChat.firstName} ${formattedChat.middleName} ${formattedChat.lastName}`.toLowerCase()
    const matchesSearch =
      searchQuery === "" ||
      fullName.includes(searchQuery.toLowerCase()) ||
      formattedChat.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formattedChat.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formattedChat.latestMessage.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (filterType === "unread") return formattedChat.unread
    if (filterType === "recent") {
      // Consider chats from the last 24 hours as recent
      if (!chat.timestamp) return false
      const chatDate = new Date(chat.timestamp)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return chatDate > yesterday
    }

    return true
  })

  const listItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
  }

  return (
    <Card className="h-full shadow-md border-primary/10 overflow-hidden">
      <CardHeader className="px-4 py-3 bg-gradient-to-r from-background to-secondary/20 space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chats
          </CardTitle>
          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
            {filteredChats.length}
          </Badge>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8 pr-4 h-9 text-sm bg-background/80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-1 -mt-1">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            className="text-xs h-7 px-2 flex-1"
            onClick={() => setFilterType("all")}
          >
            All
          </Button>
          <Button
            variant={filterType === "unread" ? "default" : "outline"}
            size="sm"
            className="text-xs h-7 px-2 flex-1"
            onClick={() => setFilterType("unread")}
          >
            <UserCheck className="h-3 w-3 mr-1" />
            Unread
          </Button>
          <Button
            variant={filterType === "recent" ? "default" : "outline"}
            size="sm"
            className="text-xs h-7 px-2 flex-1"
            onClick={() => setFilterType("recent")}
          >
            <Clock className="h-3 w-3 mr-1" />
            Recent
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-y-auto h-[calc(100%-8.5rem)]">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-md"></div>
              <AnimatedLogo size={60} className="relative z-10" />
            </div>
            <div className="space-y-2 max-w-xs">
              <p className="font-medium text-primary">No conversations found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search terms or filters"
                  : "Start connecting with professionals to build your network!"}
              </p>
            </div>
            <Button size="sm" variant="outline" className="mt-2">
              Find Professionals
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {filteredChats.map((chat, index) => {
              const formattedChat = formatFunction(chat)
              return (
                <motion.div
                  key={chat.id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={listItemVariants}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-all ${
                    selectedChatId === chat.id ? "bg-primary/10 border-l-4 border-primary pl-3" : ""
                  } ${formattedChat.unread ? "bg-primary/5" : ""}`}
                  onClick={() => onChatSelect(chat.id)}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage
                        src={formattedChat.profileImage || "/placeholder.svg"}
                        alt={`${formattedChat.firstName} ${formattedChat.lastName}`}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {formattedChat.firstName.charAt(0)}
                        {formattedChat.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Status indicator */}
                    {formattedChat.status && (
                      <span
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                          formattedChat.status === "online"
                            ? "bg-success"
                            : formattedChat.status === "away"
                              ? "bg-warning"
                              : "bg-muted"
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium truncate text-primary flex items-center gap-1">
                          {formattedChat.firstName} {formattedChat.middleName && `${formattedChat.middleName} `}
                          {formattedChat.lastName}
                          {formattedChat.unread && (
                            <Badge variant="default" className="ml-1 h-2 w-2 p-0 rounded-full" />
                          )}
                        </h3>
                        {(formattedChat.designation || formattedChat.company) && (
                          <p className="text-xs text-muted-foreground truncate">
                            {formattedChat.designation}
                            {formattedChat.designation && formattedChat.company ? " at " : ""}
                            {formattedChat.company}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-xs whitespace-nowrap ml-2 ${
                          formattedChat.unread ? "text-primary font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {formattedChat.duration}
                      </span>
                    </div>
                    <p
                      className={`text-sm truncate mt-1 ${
                        formattedChat.unread ? "text-foreground font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {formattedChat.latestMessage}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
