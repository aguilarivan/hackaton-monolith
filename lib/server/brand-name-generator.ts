import type { BusinessInputData } from "@/components/hero-input"

const STOPWORDS = new Set([
  "de", "del", "la", "el", "los", "las", "un", "una", "unos", "unas",
  "en", "con", "para", "por", "que", "y", "o", "a", "al", "su", "sus",
  "mi", "mis", "tu", "tus", "se", "es", "son", "hay", "sin", "como",
  "quiero", "armar", "hacer", "tener", "una", "tipo", "estilo",
])

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i)
  }
  return Math.abs(h)
}

function pick<T>(arr: T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length]
}

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-záéíóúüñ\s]/gi, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w))
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

const SUFFIXES = ["Hub", "Studio", "Lab", "Zone", "Nest", "Plus", "Co", "Ar", "Ba"]
const PREFIXES = ["Neo", "Viva", "Alta", "Pura", "Bien", "Real", "Nova", "Aura"]
const SPANISH_PATTERNS = [
  (kw: string) => `La ${capitalize(kw)}`,
  (kw: string) => `${capitalize(kw)} BA`,
  (kw: string) => `El ${capitalize(kw)}`,
  (kw: string) => `Rincón ${capitalize(kw)}`,
  (kw: string) => `Casa ${capitalize(kw)}`,
]

export function generateBrandNames(input: BusinessInputData): string[] {
  const seed = hashStr(input.idea + (input.city ?? ""))
  const keywords = extractKeywords(input.idea)

  if (keywords.length === 0) {
    const word = input.city?.split(" ")[0] || "Mi"
    keywords.push(word.toLowerCase())
  }

  const kw1 = capitalize(pick(keywords, seed, 0))
  const kw2 = capitalize(pick(keywords, seed, 1))
  const suffix = pick(SUFFIXES, seed, 0)
  const prefix = pick(PREFIXES, seed, 1)
  const spanishPattern = pick(SPANISH_PATTERNS, seed, 2)

  return [
    spanishPattern(keywords[0] ?? "negocio"),         // e.g. "La Cafetería"
    `${kw1}${suffix}`,                                // e.g. "CaféHub"
    `${prefix}${kw1}`,                                // e.g. "VivaRoastery"
    `${kw1} & ${kw2}`,                                // e.g. "Café & Pastelería"
    `${kw1}${pick(SUFFIXES, seed, 3)}`,               // e.g. "CaféLab"
  ].filter((name, i, arr) => arr.indexOf(name) === i) // deduplicate
}
