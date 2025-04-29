"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { getDropboxUrl } from "@/app/profile/[id]/page"

interface User {
  id: number
  first_name: string
  middle_name: string | null
  last_name: string
  designation: string | null
  company: string | null
  profile_picture: string | null
}

interface SearchResultsProps {
  query: string
  onClose: () => void
}

export function SearchResults({ query, onClose }: SearchResultsProps) {
  const [results, setResults] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const searchUsers = async () => {
      if (!query) {
        setResults([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/search_users?q=${encodeURIComponent(query)}`
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setResults(data)
      } catch (err) {
        console.error("Failed to fetch search results:", err)
        setError("Failed to load search results. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    const debounceTimer = setTimeout(() => {
      searchUsers()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleUserClick = (userId: number) => {
    router.push(`/profile/${userId}`)
    onClose()
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
        <p className="text-sm font-medium">
          {isLoading ? "Searching..." : 
           error ? "Error" :
           `${results.length} ${results.length === 1 ? "result" : "results"} found`}
        </p>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      <CardContent className="p-0 max-h-[300px] overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="p-4 text-center text-destructive">{error}</div>
        ) : results.length > 0 ? (
          <div className="divide-y">
            {results.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50"
                onClick={() => handleUserClick(user.id)}
              >
                <Image
                  src={getDropboxUrl(user.profile_picture ?? "") || "/placeholder.svg"}
                  alt={`${user.first_name} ${user.last_name}`}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {user.first_name} {user.middle_name && `${user.middle_name} `}
                    {user.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.designation || "No role specified"}{user.company && ` at ${user.company}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-4 text-center text-muted-foreground">
            {query ? "No results found" : "Start typing to search"}
          </p>
        )}
      </CardContent>
    </Card>
  )
}