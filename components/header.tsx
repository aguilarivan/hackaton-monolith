"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { LogIn, LogOut, Moon, Rocket, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { clearFlowStorage } from "@/lib/flow-storage"

interface AuthUser {
  id: string
  email: string
  name: string
}

export function Header() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const showReset = pathname !== "/" && pathname !== "/login"

  const [user, setUser] = useState<AuthUser | null>(null)

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
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Rocket className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">DayZero</span>
        </button>

        <div className="flex items-center gap-3">
          {showReset && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              Nueva idea
            </Button>
          )}

          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:block">
                {user.name}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </>
          ) : (
            pathname !== "/login" && (
              <Button variant="ghost" size="sm" onClick={() => router.push("/login")} className="gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Ingresar</span>
              </Button>
            )
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Cambiar tema</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
