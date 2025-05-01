"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Send, Paperclip, User, Check, Gift, FileText, Image as ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getDropboxUrl } from "@/app/profile/[id]/page"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Message {
  id: number | null 
  sender_id: number
  receiver_id: number
  message: string
  timestamp: string
  attachment_url: string | null
  sender?: {
    first_name: string
    middle_name: string | null
    last_name: string
    profile_picture: string | null
  }
  receiver?: {
    first_name: string
    middle_name: string | null
    last_name: string
    profile_picture: string | null
  }
}

interface ChatUser {
  id: number
  first_name: string
  middle_name: string | null
  last_name: string
  profile_picture: string | null
  designation: string | null
  company: string | null
}

interface ChatProps {
  chatId: number
  onClose: () => void
  currentUserId: number
}

interface FirstMessageFormData {
  firstName: string
  lastName: string
  degree: string
  university: string
  jobId: string
  experience: string
  email: string
}

export function Chat({ chatId, onClose, currentUserId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [chatUser, setChatUser] = useState<ChatUser | null>(null)
  const [referrer, setReferrer] = useState<ChatUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [referralOption, setReferralOption] = useState<string | undefined>(undefined)
  const [isGrantingReferral, setIsGrantingReferral] = useState(false)
  const [firstMessageFormData, setFirstMessageFormData] = useState<FirstMessageFormData>({
    firstName: "",
    lastName: "",
    degree: "",
    university: "",
    jobId: "",
    experience: "",
    email: "",
  })
  const [attachment, setAttachment] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : null
  const userType = user?.type
  const parsedCurrentUserId = Number(currentUserId)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
      const maxSize = 5 * 1024 * 1024 // 5MB

      if (!validTypes.includes(file.type)) {
        alert('Please select a JPEG, PNG, or PDF file')
        return
      }

      if (file.size > maxSize) {
        alert('File size should be less than 5MB')
        return
      }

      setAttachment(file)
    }
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  const removeAttachment = () => {
    setAttachment(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const grantReferral = async (option: string) => {
    if (!option) return
    setIsGrantingReferral(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/grant_referral`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referred_by: parsedCurrentUserId,
          referred: chatId,
          referred_via: option,
          referred_at: referrer?.company || "",
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to grant referral")
      }
      const successMessage = `I've granted you a referral via ${option}. Your Referral ID is ${data?.referral_id}. Good luck with your application!`
      const msgResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/send_messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender_id: parsedCurrentUserId,
          receiver_id: chatId,
          message: successMessage,
        }),
      })

      if (!msgResponse.ok) {
        throw new Error("Failed to send referral message")
      }

      alert(`Referral granted successfully via ${option}!`)
    } catch (error) {
      console.error("Error granting referral:", error)
      alert("Failed to grant referral. Please try again.")
    } finally {
      setIsGrantingReferral(false)
      setReferralOption(undefined)
    }
  }

  // End chat session
  const endChatSession = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/end_chat_session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender_id: parsedCurrentUserId,
          receiver_id: chatId,
        }),
      })
      if (!response.ok) {
        throw new Error("Failed to end chat session")
      }
      // Optionally fetch messages again to ensure UI reflects flushed messages
      await fetchMessages()
    } catch (error) {
      console.error("Error ending chat session:", error)
      setError("Failed to save chat session. Messages may not be persisted.")
    }
  }

  // Fetch user details and messages
  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile?id=${chatId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch user details")
      }
      const data = await response.json()
      setChatUser({
        id: data.id,
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        profile_picture: data.profile_picture,
        designation: data.designation,
        company: data.company,
      })
    } catch (error) {
      console.error("Error fetching user details:", error)
      setError("Failed to load user details.")
    }

    if (userType === "referrer" || userType === "moderator") {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile?id=${parsedCurrentUserId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch referrer details")
        }
        const data = await response.json()
        setReferrer({
          id: data.id,
          first_name: data.first_name,
          middle_name: data.middle_name,
          last_name: data.last_name,
          profile_picture: data.profile_picture,
          designation: data.designation,
          company: data.company,
        })
      } catch (error) {
        console.error("Error fetching referrer details:", error)
        setError("Failed to load referrer details.")
      }
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/messages?sender_id=${parsedCurrentUserId}&receiver_id=${chatId}`
      )
      if (!response.ok) {
        throw new Error("Failed to fetch messages")
      }
      const data = await response.json()
      setMessages(data.map((msg: Message) => ({
        ...msg,
        sender_id: Number(msg.sender_id),
        receiver_id: Number(msg.receiver_id), 
      })))
    } catch (error) {
      console.error("Error fetching messages:", error)
      setError("Failed to load messages.")
    }
  }

  // Polling for new messages
  useEffect(() => {
    fetchUserDetails()
    fetchMessages()

    // Start polling every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages()
    }, 5000)

    // Cleanup on component unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      // End chat session when component unmounts (e.g., user navigates away)
      endChatSession()
    }
  }, [chatId, parsedCurrentUserId])

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "user" && event.newValue === null) {
        endChatSession()
      }
    }
  
    window.addEventListener("storage", handleStorageChange)
  
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [chatId, parsedCurrentUserId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleFirstMessageFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFirstMessageFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const constructFirstMessage = () => {
    const { firstName, lastName, degree, university, jobId, experience, email } = firstMessageFormData
    return `Hello, I am ${firstName} ${lastName}. I have a degree in ${degree} from ${university}. I saw an opening in your company with the job ID ${jobId}. I have ${experience} years of experience. Can you provide me a referral? My email is ${email}. Thank you.`
  }

  const handleSendFirstMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    const { firstName, lastName, degree, university, jobId, experience, email } = firstMessageFormData
    if (!firstName || !lastName || !degree || !university || !jobId || !experience || !email) {
      alert("Please fill in all fields")
      return
    }

    const messageText = constructFirstMessage()

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/send_messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender_id: parsedCurrentUserId,
          receiver_id: chatId,
          message: messageText,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      setFirstMessageFormData({
        firstName: "",
        lastName: "",
        degree: "",
        university: "",
        jobId: "",
        experience: "",
        email: "",
      })
      // Fetch messages to include the new one (cached in Redis)
      await fetchMessages()
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() && !attachment) return
    setIsUploading(true)
    const tempMessage: Message = {
      id: null,
      sender_id: parsedCurrentUserId,
      receiver_id: chatId,
      message: newMessage.trim() || "",
      timestamp: new Date().toISOString(),
      attachment_url: attachment ? "uploading..." : null,
      sender: user ? {
        first_name: user.first_name || "You",
        middle_name: user.middle_name || null,
        last_name: user.last_name || "",
        profile_picture: user.profile_picture || null,
      } : undefined,
      receiver: chatUser ? {
        first_name: chatUser.first_name,
        middle_name: chatUser.middle_name,
        last_name: chatUser.last_name,
        profile_picture: chatUser.profile_picture,
      } : undefined,
    }
    try {
      setMessages((prev) => [...prev, tempMessage])
      setNewMessage("")

      const formData = new FormData()
      formData.append('sender_id', parsedCurrentUserId.toString())
      formData.append('receiver_id', chatId.toString())
      if (newMessage.trim()) {
        formData.append('message', newMessage)
      }
      if (attachment) {
        formData.append('attachment', attachment)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/send_messages`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }
      removeAttachment()
      // Fetch messages to include the new one (cached in Redis)
      await fetchMessages()
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => prev.filter((msg) => msg.id !== null || msg.timestamp !== tempMessage.timestamp))
      alert("Failed to send message. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleViewProfile = () => {
    router.push(`/profile/${chatId}`)
  }

  const formatMessageTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) {
        return timestamp
      }
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } catch {
      const timePart = timestamp.split('T')[1]?.split('.')[0]?.substring(0, 5)
      return timePart || timestamp
    }
  }

  const getFileIcon = (url: string | null) => {
    if (url?.match(/\.(jpeg|jpg|png|gif)$/i)) {
      return <ImageIcon className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  const isFirstConversation = messages.length === 0

  if (loading && !chatUser) {
    return (
      <Card className="flex flex-col h-full shadow-md">
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-12 bg-muted rounded-full"></div>
            <div className="h-4 w-48 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!chatUser) {
    return (
      <Card className="flex flex-col h-full shadow-md">
        <CardContent className="flex-1 flex items-center justify-center">
          <p>User not found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-full shadow-md border-primary/10">
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between border-b bg-muted/30">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleViewProfile}>
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage
              src={getDropboxUrl(chatUser.profile_picture || "") || "/placeholder.svg"}
              alt={`${chatUser.first_name} ${chatUser.last_name}`}
            />
          </Avatar>
          <div>
            <h3 className="font-medium">
              {chatUser.first_name} {chatUser.middle_name && `${chatUser.middle_name} `}
              {chatUser.last_name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {chatUser.designation} {chatUser.company && `at ${chatUser.company}`}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={async () => {
            await endChatSession()
            onClose()
          }}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
        {error && (
          <div className="bg-red-100 text-red-700 p-2 text-sm text-center">
            {error}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2 max-w-md">
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <p className="text-muted-foreground">No messages yet. Use the form below to start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message.id || `cached-${index}`} // Use index for cached messages
                className={`flex ${message.sender_id == parsedCurrentUserId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 shadow-sm ${
                    message.sender_id == parsedCurrentUserId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted dark:bg-secondary"
                  }`}
                >
                  {message.message && <p>{message.message}</p>}
                  {message.attachment_url && (
                    <div className={`mt-1 ${message.message ? 'mt-2' : ''}`}>
                      <a
                        href={message.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-1 text-sm ${
                          message.sender_id == parsedCurrentUserId
                            ? 'text-primary-foreground/80 hover:text-primary-foreground'
                            : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                        }`}
                      >
                        {getFileIcon(message.attachment_url)}
                        {message.attachment_url.split('/').pop()?.split('?')[0]}
                      </a>
                    </div>
                  )}
                  <p
                    className={`text-xs mt-1 ${
                      message.sender_id == parsedCurrentUserId ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {formatMessageTime(message.timestamp)}
                    {message.id === null && message.sender_id == parsedCurrentUserId && " Sent"}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-3 border-t bg-muted/30">
          {isFirstConversation ? (
            <div className="space-y-4">
              <div className="text-sm font-medium text-center">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-md">
                  Send your first message using this template
                </span>
              </div>
              <form onSubmit={handleSendFirstMessage} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={firstMessageFormData.firstName}
                      onChange={handleFirstMessageFormChange}
                      className="bg-background"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={firstMessageFormData.lastName}
                      onChange={handleFirstMessageFormChange}
                      className="bg-background"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="degree" className="text-sm">
                      Degree
                    </Label>
                    <Input
                      id="degree"
                      name="degree"
                      value={firstMessageFormData.degree}
                      onChange={handleFirstMessageFormChange}
                      placeholder="e.g. Computer Science"
                      className="bg-background"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="university" className="text-sm">
                      University
                    </Label>
                    <Input
                      id="university"
                      name="university"
                      value={firstMessageFormData.university}
                      onChange={handleFirstMessageFormChange}
                      placeholder="e.g. Stanford University"
                      className="bg-background"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobId" className="text-sm">
                      Job ID
                    </Label>
                    <Input
                      id="jobId"
                      name="jobId"
                      value={firstMessageFormData.jobId}
                      onChange={handleFirstMessageFormChange}
                      placeholder="e.g. JOB-123456"
                      className="bg-background"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-sm">
                      Years of Experience
                    </Label>
                    <Input
                      id="experience"
                      name="experience"
                      type="number"
                      min="0"
                      value={firstMessageFormData.experience}
                      onChange={handleFirstMessageFormChange}
                      className="bg-background"
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-1 sm:col-span-2">
                    <Label htmlFor="email" className="text-sm">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={firstMessageFormData.email}
                      onChange={handleFirstMessageFormChange}
                      className="bg-background"
                      required
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-3 bg-background shadow-sm">
                  <div className="text-sm font-medium mb-2 text-primary">Preview:</div>
                  <p className="text-sm">{constructFirstMessage()}</p>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90">
                    <Send className="h-4 w-4" />
                    Send Introduction
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
              />
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 bg-primary hover:bg-primary/90"
                  onClick={handleAttachClick}
                >
                  <Paperclip className="h-5 w-5" />
                  <span className="sr-only">Attach file</span>
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-background"
                />
                {attachment && (
                  <div className="flex items-center gap-2 mr-2">
                    <span className="text-sm text-muted-foreground truncate max-w-[100px]">
                      {attachment.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={removeAttachment}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <Button
                  type="submit"
                  size="icon"
                  className="shrink-0 bg-primary hover:bg-primary/90"
                  disabled={(!newMessage.trim() && !attachment) || isUploading}
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  <span className="sr-only">Send message</span>
                </Button>
                {(userType === "referrer" || userType === "moderator") && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0 bg-success hover:bg-success/90 text-success-foreground"
                      >
                        <Gift className="h-5 w-5" />
                        <span className="sr-only">Grant Referral</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-3" align="end">
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Grant Referral via</h4>
                        <RadioGroup value={referralOption} onValueChange={setReferralOption} className="gap-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="TrueRefer" id="truerefer" />
                            <Label htmlFor="truerefer" className="cursor-pointer">
                              TrueRefer
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Email" id="email" />
                            <Label htmlFor="email" className="cursor-pointer">
                              Email
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Other" id="other" />
                            <Label htmlFor="other" className="cursor-pointer">
                              Other
                            </Label>
                          </div>
                        </RadioGroup>
                        <Button
                          className="w-full mt-2 gap-2"
                          size="sm"
                          onClick={() => grantReferral(referralOption || "")}
                          disabled={!referralOption || isGrantingReferral}
                        >
                          {isGrantingReferral ? (
                            <span>Processing...</span>
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              Confirm
                            </>
                          )}
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </form>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}