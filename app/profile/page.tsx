"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProfileRedirect() {
  const router = useRouter()
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : null
  useEffect(() => {
    router.push(`/profile/${user?.id}`)
  }, [router])

  return null
}
