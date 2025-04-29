import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowRight, CheckCircle, Users, Briefcase, Award, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AnimatedLogo } from "@/components/animated-logo"
import { AnalyticsClient } from "@/components/analytics-client"
import landingPageImage from "@/assets/landingPage.webp"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <AnimatedLogo size={32} />
            <span className="text-xl font-bold">TrueRefer</span>
          </div>

          <nav className="hidden gap-6 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Features
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Testimonials
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 animate-gradient bg-size-200"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <Badge className="w-fit colorful-badge mb-2">
                  <Sparkles className="h-3 w-3 mr-1" /> The #1 Referral Platform
                </Badge>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                    Connect with Professionals for Referrals
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    TrueRefer helps you connect with employees at your dream organizations to secure referrals and boost
                    your job applications.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="w-full group">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="#learn-more">
                    <Button size="lg" variant="outline" className="w-full">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[500px] aspect-square animate-float">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 via-secondary/20 to-info/20 blur-xl"></div>
                  <Image
                    src={landingPageImage}
                    alt="TrueRefer Platform"
                    width={500}
                    height={500}
                    fill
                    className="rounded-lg object-cover shadow-xl relative z-10"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-background rounded-lg p-4 shadow-lg border z-20">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span className="text-sm font-medium">Referral Secured!</span>
                    </div>
                  </div>
                  <div className="absolute -top-6 -left-6 bg-background rounded-lg p-4 shadow-lg border z-20">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">500+ Referrals</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-secondary/20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                Platform Analytics
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-info">
                Our Growing Community
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of professionals who are already benefiting from TrueRefer
              </p>
            </div>
          </div>
          <div className="mx-auto max-w-5xl py-12">
            <AnalyticsClient />
          </div>
        </div>
      </section>
      </main>
      <footer className="w-full border-t py-6 bg-gradient-to-t from-secondary/20 to-background">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <AnimatedLogo size={32} />
            <span className="font-semibold">TrueRefer</span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © {new Date().getFullYear()} TrueRefer. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}