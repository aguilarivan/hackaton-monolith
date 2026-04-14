"use client"

import { Suspense, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function LoginForm() {
  const router = useRouter()
  const redirectTo = "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const json = await res.json()

      if (!json.ok) {
        setError(json.error?.message ?? "Login failed.")
        return
      }

      router.push(redirectTo)
    } catch {
      setError("Could not connect to the server.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full border-border/70">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{"Log in"}</CardTitle>
        <CardDescription>
          {"Enter your credentials to continue"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{"Email"}</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{"Password"}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-4 w-4" />
            )}
            {"Log in"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Demo: <span className="font-mono">demo@dayzero.app</span> /{" "}
            <span className="font-mono">password123</span>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-sm items-center justify-center px-4 py-16">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}
