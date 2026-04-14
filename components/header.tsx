"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "@/i18n/navigation"
import { LogIn, LogOut, Moon, Rocket, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { LanguageToggle } from "@/components/language-toggle"
import { SpaceProgress } from "@/components/space-progress"
import { clearFlowStorage, getBrandIdentity, getBusinessInput, getLandingProgress, landingProgressRatio, LANDING_PROGRESS_EVENT } from "@/lib/flow-storage"
import type { SpaceProgressProps } from "@/components/space-progress"

const STEP_MAP: Record<string, SpaceProgressProps["currentStep"]> = {
  "/":                  1,
  "/preguntas-claude":  2,
  "/analisis":          3,
}

interface AuthUser {
  id: string
  email: string
  name: string
}

export function Header() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations("common")
  const showReset = pathname !== "/" && pathname !== "/login"

  const [user, setUser] = useState<AuthUser | null>(null)
  const [brandName, setBrandName] = useState<string | null>(null)
  const [landingRatio, setLandingRatio] = useState<{ done: number; total: number } | null>(null)
  const showBrandName = showReset && brandName // only on steps 2/3, never on home

  const routeStep = STEP_MAP[pathname] ?? null
  // Promote to step 4 when user has started engaging with the roadmap
  const currentStep = routeStep === 3 && landingRatio && landingRatio.done > 0
    ? 4 as SpaceProgressProps["currentStep"]
    : routeStep
  const showProgress = currentStep !== null && pathname !== "/login"

  useEffect(() => {
    const input = getBusinessInput()
    const stored = getBrandIdentity()
    setBrandName(stored?.name ?? input?.brandName ?? null)
  }, [pathname])

  // Read landing progress on mount + listen for changes from roadmap section
  useEffect(() => {
    const sync = () => {
      const p = getLandingProgress()
      setLandingRatio(p ? landingProgressRatio(p) : null)
    }
    sync()
    window.addEventListener(LANDING_PROGRESS_EVENT, sync)
    return () => window.removeEventListener(LANDING_PROGRESS_EVENT, sync)
  }, [pathname])

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok) setUser(json.data.user)
      })
      .catch(() => {/* not authenticated */})
  }, [pathname])

  const handleReset = () => {
    clearFlowStorage()
    router.push("/")
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    clearFlowStorage()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Rocket className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-base font-semibold tracking-tight">DayZero</span>
          {showBrandName && (
            <>
              <span className="text-muted-foreground/40 text-base font-light">/</span>
              <span className="text-sm font-medium text-primary">{brandName}</span>
            </>
          )}
        </button>

        {showProgress && (
          <SpaceProgress
            currentStep={currentStep as SpaceProgressProps["currentStep"]}
            brandName={brandName ?? undefined}
            landingRatio={landingRatio}
          />
        )}

        <div className="flex items-center gap-2">
          {showReset && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              {t("newIdea")}
            </Button>
          )}

          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:block">
                {user.name}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t("logout")}</span>
              </Button>
            </>
          ) : (
            pathname !== "/login" && (
              <Button variant="ghost" size="sm" onClick={() => router.push("/login")} className="gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">{t("login")}</span>
              </Button>
            )
          )}

          <LanguageToggle />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-8 w-8"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">{t("toggleTheme")}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
