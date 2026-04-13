"use client"

import { Zap, ArrowRight, Layout, MessageSquare, Search, Smartphone, Upload, HelpCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const features = [
  { icon: Layout, label: "Hero with value prop" },
  { icon: Layout, label: "Services section" },
  { icon: MessageSquare, label: "WhatsApp contact form" },
  { icon: Search, label: "Basic SEO" },
  { icon: Smartphone, label: "Mobile-first" },
  { icon: Upload, label: "Ready for Netlify" },
]

export function LandingCTA() {
  return (
    <Card className="border-2 border-[oklch(0.5_0.18_270_/_0.5)] bg-gradient-to-br from-[oklch(0.5_0.18_270_/_0.05)] to-transparent">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
          {/* Left side - Icon and text */}
          <div className="flex-1 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.5_0.18_270)] text-white">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                  Generate your landing page now
                </h3>
                <p className="mt-1 text-muted-foreground">
                  AI already has all the context from your analysis and can generate a ready-to-publish HTML landing page in seconds.
                </p>
              </div>
            </div>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-2">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  <feature.icon className="h-3 w-3" />
                  {feature.label}
                </div>
              ))}
            </div>
          </div>

          {/* Right side - CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
            <Button size="lg" className="h-12 px-6 text-base font-semibold">
              Create my landing page
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <button className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              <HelpCircle className="h-3.5 w-3.5" />
              How to publish it for free?
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
