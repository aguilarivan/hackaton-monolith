"use client"

import { useMemo, useState } from "react"
import { Map, Check, X, Target, CheckCircle2, Globe, LayoutTemplate, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { RoadmapStep, ValidationStep } from "@/lib/mock-data"

interface RoadmapSectionProps {
  data: RoadmapStep[]
  validationPlan: ValidationStep[]
}

export function RoadmapSection({ data, validationPlan }: RoadmapSectionProps) {
  const [isGeneratingLanding, setIsGeneratingLanding] = useState(false)
  const [landingGenerated, setLandingGenerated] = useState(false)
  const [domainChecked, setDomainChecked] = useState(false)

  const domainOptions = useMemo(
    () => data.flatMap((step) => step.domainChecks ?? (step.domainSuggestion ? [step.domainSuggestion] : [])),
    [data]
  )

  const handleGenerateLanding = async () => {
    setIsGeneratingLanding(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setIsGeneratingLanding(false)
    setLandingGenerated(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Idea Validation Plan</CardTitle>
              <p className="text-sm text-muted-foreground">Validate before investing heavily</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {validationPlan.map((step, index) => (
              <div key={index} className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/30">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-bold text-primary">{index + 1}</span>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-foreground">{step.action}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{step.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-md bg-success/10 px-3 py-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-success">Success metric: {step.metric}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <LayoutTemplate className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Launch Tools</CardTitle>
              <p className="text-sm text-muted-foreground">Integrated landing creation and domain availability checks</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleGenerateLanding} disabled={isGeneratingLanding} className="gap-2">
              {isGeneratingLanding ? <Loader2 className="h-4 w-4 animate-spin" /> : <LayoutTemplate className="h-4 w-4" />}
              {isGeneratingLanding ? "Generating..." : "Create landing page"}
            </Button>
            <Button variant="outline" onClick={() => setDomainChecked(true)} className="gap-2">
              <Globe className="h-4 w-4" />
              Check available domains
            </Button>
          </div>

          {landingGenerated && (
            <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-sm">
              <p className="font-semibold text-success">Landing page draft generated</p>
              <p className="text-muted-foreground">A launch-ready one-page structure is now included in your roadmap workflow.</p>
            </div>
          )}

          {domainChecked && (
            <div className="space-y-2 rounded-lg border border-border bg-card p-3">
              <p className="text-sm font-semibold text-foreground">Domain availability</p>
              {domainOptions.length > 0 ? (
                domainOptions.map((domain, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm">
                    <span className="font-medium text-foreground">{domain.domain}</span>
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", domain.available ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                      {domain.available ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {domain.available ? "available" : "taken"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No domain suggestions available for this idea yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Map className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl">Launch Roadmap</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute left-0 right-0 top-6 h-0.5 bg-border" />

              <div className="grid grid-cols-4 gap-4">
                {data.map((step, index) => (
                  <div key={index} className="relative">
                    <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-background">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>

                    <div className="mt-4 text-center">
                      <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{step.period}</span>
                      <h4 className="mt-2 font-semibold text-foreground">{step.title}</h4>
                      <ul className="mt-2 space-y-1 text-left">
                        {step.actions.map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                            {action}
                          </li>
                        ))}
                      </ul>

                      {step.domainSuggestion && (
                        <div className="mt-3 rounded-md bg-secondary/50 p-2">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xs font-medium text-foreground">{step.domainSuggestion.domain}</span>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                                step.domainSuggestion.available ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                              )}
                            >
                              {step.domainSuggestion.available ? <><Check className="h-3 w-3" />available</> : <><X className="h-3 w-3" />taken</>}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <div className="relative">
              <div className="absolute bottom-0 left-5 top-0 w-0.5 bg-border" />

              <div className="space-y-6">
                {data.map((step, index) => (
                  <div key={index} className="relative flex gap-4">
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>

                    <div className="flex-1 pb-2">
                      <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{step.period}</span>
                      <h4 className="mt-2 font-semibold text-foreground">{step.title}</h4>
                      <ul className="mt-2 space-y-1">
                        {step.actions.map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                            {action}
                          </li>
                        ))}
                      </ul>

                      {step.domainSuggestion && (
                        <div className="mt-3 rounded-md bg-secondary/50 p-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{step.domainSuggestion.domain}</span>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                                step.domainSuggestion.available ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                              )}
                            >
                              {step.domainSuggestion.available ? <><Check className="h-3 w-3" />available</> : <><X className="h-3 w-3" />taken</>}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
