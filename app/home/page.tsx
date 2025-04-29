"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, TrendingUp, Users } from "lucide-react"
import referrersImage from "@/assets/referrals.png"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [profileCompleteness, setProfileCompleteness] = useState<{
    filled_fields: number
    total_fields: number
    completion_percentage: number
    missing_fields: string[]
  } | null>(null)
  const [referralActivity, setReferralActivity] = useState<{
    total_referrals: number
    successful_referrals: number
    referral_methods: { referred_via: string; count: number }[]
  } | null>(null)
  const [networkInsights, setNetworkInsights] = useState<{
    referred_users: { referral_id: string; email: string; first_name?: string; last_name?: string; referred_at: string; referred_via: string }[]
    referrers: { referral_id: string; email: string; first_name?: string; last_name?: string; referred_at: string; referred_via: string }[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch analytics data on mount
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        const userId = user.id
        if (!userId) {
          throw new Error("User not found in localStorage")
        }

        // Fetch all analytics concurrently
        const [profileRes, referralRes, networkRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/profile-completeness?user_id=${userId}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/referral-activity?user_id=${userId}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/network-insights?user_id=${userId}`),
        ])

        if (!profileRes.ok || !referralRes.ok || !networkRes.ok) {
          throw new Error("Failed to fetch analytics")
        }

        const profileData = await profileRes.json()
        const referralData = await referralRes.json()
        const networkData = await networkRes.json()

        setProfileCompleteness(profileData.profile_completeness)
        setReferralActivity({
          total_referrals: referralData.total_referrals,
          successful_referrals: referralData.successful_referrals,
          referral_methods: referralData.referral_methods,
        })
        setNetworkInsights({
          referred_users: networkData.referred_users,
          referrers: networkData.referrers,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  // Prepare data for Recommended Referrers (using referrers from network-insights)
  const recommendedReferrers = networkInsights?.referrers.slice(0, 3).map((referrer, index) => ({
    id: index + 1,
    name: `${referrer.first_name || ""} ${referrer.last_name || ""}`.trim() || referrer.email,
    role: "Professional", // Placeholder; extend schema if role is available
    company: "Unknown", // Placeholder; extend schema if company is available
    image: "/placeholder.svg?height=100&width=100",
  })) || []

  // Prepare data for Recent Activity (using referred_users and referrers)
  const recentActivity = [
    ...(networkInsights?.referred_users || []).map((user, index) => ({
      id: index + 1,
      user: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email,
      action: "was referred by you",
      time: user.referred_at, // Use referred_at as-is
      image: "/placeholder.svg?height=40&width=40",
    })),
    ...(networkInsights?.referrers || []).map((referrer, index) => ({
      id: index + 100,
      user: `${referrer.first_name || ""} ${referrer.last_name || ""}`.trim() || referrer.email,
      action: "referred you",
      time: referrer.referred_at,
      image: "/placeholder.svg?height=40&width=40",
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 3)

  // Prepare data for Quick Stats
  const quickStats = [
    {
      label: "Profile Completion",
      value: profileCompleteness ? `${Math.round(profileCompleteness.completion_percentage)}%` : "0%",
      icon: <Users className="h-5 w-5 text-primary" />,
    },
    {
      label: "Total Referrals",
      value: referralActivity?.total_referrals.toString() || "0",
      icon: <Users className="h-5 w-5 text-info" />,
    },
    {
      label: "Network Size",
      value: ((networkInsights?.referred_users.length || 0) + (networkInsights?.referrers.length || 0)).toString(),
      icon: <Users className="h-5 w-5 text-warning" />,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-6">
        {loading && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        )}
        {error && (
          <div className="text-center py-10">
            <p className="text-destructive">Error: {error}</p>
          </div>
        )}
        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Welcome Card */}
            <Card className="col-span-full colorful-card overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-info/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                  Welcome to TrueRefer
                </CardTitle>
                <CardDescription className="text-base">
                  Connect with professionals and secure referrals for your dream job
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex-1">
                    <p className="mb-4">
                      Complete your profile to increase your chances of getting noticed by referrers.
                      {profileCompleteness && (
                        <span> Your profile is {Math.round(profileCompleteness.completion_percentage)}% complete!</span>
                      )}
                    </p>
                    <Link href="/profile/edit">
                      <Button className="group">
                        Complete Your Profile
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                  <div className="hidden sm:block relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-info/20 rounded-lg blur-xl opacity-70"></div>
                    <Image
                      src={referrersImage}
                      alt="Complete Profile"
                      width={300}
                      height={150}
                      className="rounded-lg relative z-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Referrers */}
            <Card className="col-span-full md:col-span-1 lg:col-span-2 colorful-card-alt">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recommended Referrers</CardTitle>
                  <CardDescription>Your referral network</CardDescription>
                </div>
                <Badge className="colorful-badge">
                  <Sparkles className="h-3 w-3 mr-1" /> Network
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recommendedReferrers.length > 0 ? (
                    recommendedReferrers.map((referrer) => (
                      <Link href={`/profile/${referrer.id}`} key={referrer.id}>
                        <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors card-hover bg-background">
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-primary/20 blur-md"></div>
                            <Image
                              src={referrer.image || "/placeholder.svg"}
                              alt={referrer.name}
                              width={80}
                              height={80}
                              className="rounded-full mb-3 relative z-10 border-2 border-primary/20"
                            />
                          </div>
                          <h3 className="font-medium text-center">{referrer.name}</h3>
                          <p className="text-sm text-primary text-center font-medium">{referrer.role}</p>
                          <p className="text-sm text-muted-foreground text-center">{referrer.company}</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-muted-foreground col-span-full text-center">
                      No referrers found. Start building your network!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="col-span-full md:col-span-1 colorful-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your referral activity</CardDescription>
                </div>
                <Badge variant="outline" className="bg-background border-primary/20 text-primary">
                  <TrendingUp className="h-3 w-3 mr-1" /> New
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-info/20 blur-sm"></div>
                          <Image
                            src={activity.image || "/placeholder.svg"}
                            alt={activity.user}
                            width={40}
                            height={40}
                            className="rounded-full relative z-10 border border-info/30"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium text-info">{activity.user}</span> {activity.action}
                          </p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No recent activity.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="col-span-full bg-gradient-to-r from-background to-secondary/20">
        <CardHeader>
          <CardTitle className="text-primary">Your Stats</CardTitle>
          <CardDescription>Track your progress and engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 justify-items-center sm:grid-cols-3">
            {quickStats.map((stat, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-4 border rounded-lg card-hover bg-background w-full max-w-[200px]"
              >
                <div className="mb-2">{stat.icon}</div>
                <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-info">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground text-center">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
          </div>
        )}
      </main>
      <footer className="w-full border-t py-4 bg-muted/20">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © {new Date().getFullYear()} TrueRefer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}