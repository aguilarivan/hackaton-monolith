"use client"

import { useEffect, useRef, useState } from "react"
import { Check, HelpCircle, Loader2, Pencil, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  getBrandIdentity,
  saveBrandIdentity,
  type BrandIdentity,
  type LogoConfig,
  type LogoShape,
} from "@/lib/flow-storage"
import type { BusinessInputData } from "@/components/hero-input"

// ── Palette ────────────────────────────────────────────────────────────────
const COLORS = [
  { label: "Violeta",  value: "#7c3aed", text: "#fff" },
  { label: "Azul",     value: "#2563eb", text: "#fff" },
  { label: "Teal",     value: "#0d9488", text: "#fff" },
  { label: "Verde",    value: "#16a34a", text: "#fff" },
  { label: "Ámbar",    value: "#d97706", text: "#fff" },
  { label: "Naranja",  value: "#ea580c", text: "#fff" },
  { label: "Rosa",     value: "#db2777", text: "#fff" },
  { label: "Índigo",   value: "#4f46e5", text: "#fff" },
]

const SHAPES: { value: LogoShape; label: string }[] = [
  { value: "circle",   label: "Círculo"  },
  { value: "rounded",  label: "Cuadrado" },
  { value: "hexagon",  label: "Hexágono" },
]

// ── Logo renderer ──────────────────────────────────────────────────────────
interface LogoProps {
  config: LogoConfig
  size?: "sm" | "md" | "lg"
}

function shapeClass(shape: LogoShape) {
  if (shape === "circle")  return "rounded-full"
  if (shape === "rounded") return "rounded-2xl"
  return "rounded-full" // hexagon fallback via clip-path below
}

export function BrandLogo({ config, size = "md" }: LogoProps) {
  const sizeClass = size === "sm" ? "h-10 w-10 text-sm" : size === "lg" ? "h-20 w-20 text-2xl" : "h-14 w-14 text-base"

  if (config.type === "uploaded" && config.imageDataUrl) {
    return (
      <div
        className={cn("shrink-0 overflow-hidden border-2 border-white/20", sizeClass, shapeClass(config.shape))}
        style={config.shape === "hexagon" ? { clipPath: "polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)" } : {}}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={config.imageDataUrl} alt="Logo" className="h-full w-full object-cover" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center font-bold tracking-widest text-white shadow-lg",
        sizeClass,
        shapeClass(config.shape)
      )}
      style={{
        backgroundColor: config.color,
        ...(config.shape === "hexagon"
          ? { clipPath: "polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)" }
          : {}),
      }}
    >
      {config.initials.slice(0, 3).toUpperCase()}
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────
interface BrandIdentityCardProps {
  businessData: BusinessInputData
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase() || "??"
}

export function BrandIdentityCard({ businessData }: BrandIdentityCardProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  // ── State ──────────────────────────────────────────────────────────────
  const [name, setName] = useState(businessData.brandName ?? "")
  const [savedName, setSavedName] = useState(businessData.brandName ?? "")
  const [logo, setLogo] = useState<LogoConfig>({
    type: "builder",
    initials: getInitials(businessData.brandName ?? ""),
    color: COLORS[0].value,
    shape: "circle",
  })
  const [showBuilder, setShowBuilder] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load persisted brand identity on mount
  useEffect(() => {
    const stored = getBrandIdentity()
    if (stored) {
      setName(stored.name)
      setSavedName(stored.name)
      if (stored.logo) setLogo(stored.logo)
    }
  }, [])

  // Keep initials in sync with name
  useEffect(() => {
    if (logo.type === "builder") {
      setLogo((prev) => ({ ...prev, initials: getInitials(name) || prev.initials }))
    }
  }, [name, logo.type])

  // ── Actions ────────────────────────────────────────────────────────────
  const handleSave = () => {
    const identity: BrandIdentity = { name, logo }
    saveBrandIdentity(identity)
    setSavedName(name)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const fetchSuggestions = async () => {
    if (suggestions.length > 0) {
      setShowSuggestions((v) => !v)
      return
    }
    setLoadingSuggestions(true)
    setShowSuggestions(true)
    try {
      const res = await fetch("/api/brand-names", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessInput: businessData }),
      })
      const json = await res.json()
      if (json.ok) setSuggestions(json.data.names)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const pickSuggestion = (s: string) => {
    setName(s)
    setShowSuggestions(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setLogo((prev) => ({ ...prev, type: "uploaded", imageDataUrl: dataUrl }))
      setShowBuilder(true)
    }
    reader.readAsDataURL(file)
  }

  const resetToBuilder = () => {
    setLogo((prev) => ({ ...prev, type: "builder", imageDataUrl: undefined }))
  }

  const isDirty = name !== savedName

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      {/* Top row: logo + name + actions */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="relative shrink-0">
          <BrandLogo config={logo} size="lg" />
          <button
            onClick={() => setShowBuilder((v) => !v)}
            className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border shadow-sm hover:bg-secondary transition-colors"
            title="Editar logo"
          >
            <Pencil className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>

        {/* Name input */}
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Nombre de tu marca
            </label>
            <button
              onClick={fetchSuggestions}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              title="Sugerencias de nombre"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: La Moka Porteña"
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!name.trim() || (!isDirty && !saved)}
              className="shrink-0 gap-1.5"
            >
              {saved ? (
                <><Check className="h-3.5 w-3.5" /> Guardado</>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Name suggestions */}
      {showSuggestions && (
        <div className="rounded-xl border border-border/60 bg-secondary/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">Sugerencias para tu marca</p>
            <button onClick={() => setShowSuggestions(false)}>
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
          {loadingSuggestions ? (
            <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generando ideas...
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => pickSuggestion(s)}
                  className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Logo builder */}
      {showBuilder && (
        <div className="space-y-4 rounded-xl border border-border/60 bg-secondary/20 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Diseñá tu logo</p>
            <button onClick={() => setShowBuilder(false)}>
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-4">
            <BrandLogo config={logo} size="lg" />
            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              <span>Vista previa</span>
              {logo.type === "uploaded" && (
                <button
                  onClick={resetToBuilder}
                  className="text-destructive hover:underline text-left"
                >
                  Quitar imagen
                </button>
              )}
            </div>
          </div>

          {/* Initials (only for builder type) */}
          {logo.type === "builder" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Iniciales</label>
              <input
                type="text"
                maxLength={3}
                value={logo.initials}
                onChange={(e) => setLogo((prev) => ({ ...prev, initials: e.target.value.toUpperCase() }))}
                className="w-20 rounded-lg border border-input bg-background px-3 py-1.5 text-center text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          {/* Color palette */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  title={c.label}
                  onClick={() => setLogo((prev) => ({ ...prev, color: c.value }))}
                  className={cn(
                    "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                    logo.color === c.value ? "border-foreground scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          {/* Shape */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Forma</label>
            <div className="flex gap-2">
              {SHAPES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setLogo((prev) => ({ ...prev, shape: s.value }))}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center border-2 text-xs font-bold text-white transition-all",
                    s.value === "circle"  && "rounded-full",
                    s.value === "rounded" && "rounded-2xl",
                    s.value === "hexagon" && "rounded-full",
                    logo.shape === s.value ? "border-foreground scale-110" : "border-transparent opacity-70"
                  )}
                  style={{
                    backgroundColor: logo.color,
                    ...(s.value === "hexagon"
                      ? { clipPath: "polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)" }
                      : {}),
                  }}
                  title={s.label}
                >
                  {logo.initials.slice(0, 2)}
                </button>
              ))}
            </div>
          </div>

          {/* Upload button */}
          <div className="border-t border-border/40 pt-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              className="gap-2"
            >
              <Upload className="h-3.5 w-3.5" />
              Subir mi propio logo
            </Button>
            <p className="mt-1.5 text-xs text-muted-foreground">PNG, JPG o SVG · Se muestra en un círculo</p>
          </div>

          {/* Apply */}
          <Button size="sm" onClick={handleSave} className="w-full gap-1.5">
            {saved ? <><Check className="h-3.5 w-3.5" /> Guardado</> : "Aplicar y guardar"}
          </Button>
        </div>
      )}
    </div>
  )
}
