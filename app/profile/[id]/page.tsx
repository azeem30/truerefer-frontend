"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Linkedin, MessageSquare, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export const getDropboxUrl = (url: string) => {
  if (!url) return null
  // If it's already a direct link, return as is
  if (url.includes("dl=1")) return url
  // Convert to direct download link
  return url.replace("www.dropbox.com", "dl.dropboxusercontent.com")
}

export default function ProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : null
  const userId = params.id 
  const currentUserId = user?.id
  // Convert Dropbox URL to direct download link


  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (!userId) {
          throw new Error("User ID not found")
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile?id=${userId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch user details")
        }

        const data = await response.json()
        setProfile(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserDetails()
  }, [userId])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container py-6 flex items-center justify-center">
          <p>Loading...</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container py-6 flex items-center justify-center">
          <Card>
            <CardContent className="p-6">
              <p>{error}</p>
              <Button onClick={() => router.push("/profile/edit")} className="mt-4">
                Create Profile
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container py-6 flex items-center justify-center">
          <Card>
            <CardContent className="p-6">
              <p>Profile not found</p>
              <Button onClick={() => router.push("/home")} className="mt-4">
                Go back to home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const handleStartChat = async () => {
    if (!currentUserId) {
      console.error("Current user ID not found")
      return
    }

    try {
      router.push(`/chats?id=${profile.id}`)
    } catch (error) {
      console.error("Error initiating chat:", error)
    }
  }

  const profileImageUrl = getDropboxUrl(profile.profile_picture) || "/placeholder.svg"
  const resumeUrl = getDropboxUrl(profile.resume)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-6">
        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="relative w-[150px] h-[150px] rounded-full overflow-hidden">
                <Image
                  src={profileImageUrl}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  width={150}
                  fill
                  height={150}
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">
                  {profile.first_name} {profile.middle_name && `${profile.middle_name} `}
                  {profile.last_name}
                </h1>
                <p className="text-muted-foreground">{profile.designation}</p>
                <p className="text-muted-foreground">{profile.company}</p>
                <p className="text-muted-foreground mt-1">{profile.country}</p>

                {userId !== currentUserId && (
                  <div className="flex gap-3 mt-4 justify-center md:justify-start">
                    <Button onClick={handleStartChat} className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Button>
                    {profile.linkedin && (
                      <Button variant="outline" className="gap-2" asChild>
                        <a href={`https://www.linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </a>
                      </Button>
                    )}
                    {userId == currentUserId && (
                      <div>
                        <Button variant="outline" onClick={() => router.push("/profile/edit")}>
                        Edit Profile
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="education" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b">
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="resume">Resume</TabsTrigger>
              </TabsList>
              <TabsContent value="education" className="p-6">
                <div className="space-y-6">
                  <div className="border-b pb-4 last:border-0">
                    <h3 className="font-medium">{profile.degree}</h3>
                    <p className="text-muted-foreground">{profile.college}</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.start_year} - {profile.end_year}
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="experience" className="p-6">
                <div className="space-y-6">
                  <div className="border-b pb-4 last:border-0">
                    <h3 className="font-medium">{profile.designation}</h3>
                    <p className="text-muted-foreground">{profile.company}</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.experience} {profile.experience === 1 ? "year" : "years"} experience
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="resume" className="p-6">
                {resumeUrl ? (
                  <div className="flex flex-col items-center gap-4">
                    <Button asChild variant="outline">
                      <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in New Tab
                      </a>
                    </Button>
                  </div>
                ) : (
                  <p>No resume available</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}