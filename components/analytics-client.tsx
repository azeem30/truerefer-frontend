// components/analytics-client.tsx
"use client"

import { useState, useEffect } from "react"
import { Users, Briefcase, Award, UserCheck, MessageSquare, Handshake, Sparkles } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface AnalyticsData {
  growth_trend?: Array<{ month: string; new_users: number }>
  totals?: {
    total_users: number
    verified_users: number
    profiles_completed: number
  }
  user_types?: Array<{ userType: string; count: number }>
  top_countries?: Array<{ country: string; count: number }>
  top_companies?: Array<{ company: string; referrers: number }>
  total_referrals?: number
  top_referrers?: Array<{
    email: string
    first_name: string
    last_name: string
    referrals: number
  }>
  referral_channels?: Array<{ referred_via: string; count: number }>
  messaging_activity?: Array<{ month: string; messages: number }>
  active_conversations?: number
  profile_completion?: {
    completed: number
    total: number
    completion_rate: number
  }
  success_stories?: Array<{
    referral_id: string
    referrer_first_name: string
    referrer_last_name: string
    referrer_company: string
    referred_first_name: string
    referred_last_name: string
    referred_at: string
    referred_via: string
  }>
}

export function AnalyticsClient() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const responses = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/platform-growth`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/user-demographics`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/referral-network`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/engagement`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/success-stories`)
        ])

        const [
          growthData,
          demographicsData,
          referralData,
          engagementData,
          successData
        ] = await Promise.all(responses.map(res => res.json()))

        setAnalytics({
          ...growthData,
          ...demographicsData,
          ...referralData,
          ...engagementData,
          ...successData
        })
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!analytics) return <div className="text-center py-8">Failed to load analytics</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Platform Growth */}
      <div className="rounded-lg border p-6 bg-gradient-to-br from-white to-secondary/10 dark:from-secondary/5 dark:to-background">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
          <Users className="h-4 w-4 text-primary" />
        </div>
        <p className="mt-2 text-2xl font-bold">
          {analytics.totals?.total_users.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          {analytics.totals?.verified_users.toLocaleString()} verified
        </p>
      </div>

      {/* Active Referrers */}
      <div className="rounded-lg border p-6 bg-gradient-to-br from-white to-secondary/10 dark:from-secondary/5 dark:to-background">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Successful Referrals</h3>
          <Handshake className="h-4 w-4 text-success" />
        </div>
        <p className="mt-2 text-2xl font-bold">
          {analytics.total_referrals?.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          Top referrer: {analytics.top_referrers?.[0]?.first_name} {analytics.top_referrers?.[0]?.last_name}
        </p>
      </div>

      {/* User Engagement */}
      <div className="rounded-lg border p-6 bg-gradient-to-br from-white to-secondary/10 dark:from-secondary/5 dark:to-background">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Active Conversations</h3>
          <MessageSquare className="h-4 w-4 text-info" />
        </div>
        <p className="mt-2 text-2xl font-bold">
          {analytics.active_conversations?.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          {analytics.messaging_activity?.[analytics.messaging_activity.length - 1]?.messages} messages this month
        </p>
      </div>

      {/* Profile Completion */}
      <div className="rounded-lg border p-6 bg-gradient-to-br from-white to-secondary/10 dark:from-secondary/5 dark:to-background">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Profile Completion</h3>
          <UserCheck className="h-4 w-4 text-warning" />
        </div>
        <p className="mt-2 text-2xl font-bold">
          {Math.round(analytics.profile_completion?.completion_rate || 0)}%
        </p>
        <p className="text-xs text-muted-foreground">
          {analytics.profile_completion?.completed} of {analytics.profile_completion?.total} users
        </p>
      </div>

      {/* User Types */}
      <div className="rounded-lg border p-6 md:col-span-2 bg-gradient-to-br from-white to-secondary/10 dark:from-secondary/5 dark:to-background">
        <h3 className="text-sm font-medium text-muted-foreground">User Distribution</h3>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {analytics.user_types?.map((type) => (
            <div key={type.userType} className="flex items-center justify-between">
              <span className="text-sm capitalize">{type.userType}</span>
              <span className="font-medium">{type.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Companies */}
      <div className="rounded-lg border p-6 md:col-span-2 bg-gradient-to-br from-white to-secondary/10 dark:from-secondary/5 dark:to-background">
        <h3 className="text-sm font-medium text-muted-foreground">Top Companies</h3>
        <div className="mt-4 space-y-3">
          {analytics.top_companies?.map((company) => (
            <div key={company.company} className="flex items-center justify-between">
              <span className="text-sm">{company.company}</span>
              <span className="font-medium">{company.referrers} referrers</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}