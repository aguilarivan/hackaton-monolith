"use client"

import { useRouter } from "next/navigation"
import { HeroInput, BusinessInputData } from "@/components/hero-input"
import { Header } from "@/components/header"
import { saveBusinessInput } from "@/lib/flow-storage"

export default function Home() {
  const router = useRouter()

  const handleSubmit = (data: BusinessInputData) => {
    saveBusinessInput(data)
    router.push("/preguntas-claude")
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroInput onSubmit={handleSubmit} />
    </main>
  )
}
