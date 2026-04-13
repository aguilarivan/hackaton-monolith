"use client"

import { AlertTriangle, Landmark } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Obstacle } from "@/lib/mock-data"

interface ObstaclesSectionProps {
  data: Obstacle[]
}

function getSeverityStyles(severity: "High" | "Medium" | "Low") {
  switch (severity) {
    case "High":
      return {
        card: "bg-destructive/5 border-destructive/30",
        badge: "bg-destructive text-destructive-foreground",
        solution: "bg-destructive/10",
      }
    case "Medium":
      return {
        card: "bg-warning/5 border-warning/30",
        badge: "bg-warning text-warning-foreground",
        solution: "bg-warning/10",
      }
    case "Low":
      return {
        card: "bg-secondary border-border",
        badge: "bg-muted text-muted-foreground",
        solution: "bg-muted/50",
      }
  }
}

export function ObstaclesSection({ data }: ObstaclesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.55_0.18_30_/_0.1)]">
            <AlertTriangle className="h-5 w-5 text-[oklch(0.55_0.18_30)]" />
          </div>
          <div>
            <CardTitle className="text-xl">Obstacles and Solutions</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Real failure cases included to avoid common mistakes</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((obstacle, index) => {
          const styles = getSeverityStyles(obstacle.severity)
          return (
            <div key={index} className={cn("rounded-lg border p-4", styles.card)}>
              <div className="flex items-start gap-3">
                <span className={cn("shrink-0 rounded px-2 py-0.5 text-xs font-bold", styles.badge)}>{obstacle.severity}</span>
                <h4 className="font-semibold text-foreground">{obstacle.title}</h4>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{obstacle.description}</p>

              <div className={cn("mt-4 rounded-md p-3", styles.solution)}>
                <p className="text-sm">
                  <span className="font-semibold text-foreground">How to tackle it: </span>
                  <span className="text-muted-foreground">{obstacle.solution}</span>
                </p>
              </div>

              {obstacle.failureCase && (
                <div className="mt-3 rounded-md border border-border bg-card p-3">
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground">
                    <Landmark className="h-3.5 w-3.5 text-primary" />
                    Failure case: {obstacle.failureCase.startup}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Why it failed:</span> {obstacle.failureCase.reason}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Lesson:</span> {obstacle.failureCase.lesson}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
