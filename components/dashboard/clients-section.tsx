"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Building2, Users, Mail, Wand2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ClientData } from "@/lib/mock-data"

interface ClientsSectionProps {
  data: ClientData
  city?: string
}

function buildB2BEmail(clientName: string, city: string | undefined, role: string, context: string): string {
  return `Asunto: Una idea rápida para mejorar resultados en ${clientName}

Hola ${role},

Noté que ${clientName}${city ? ` está creciendo en ${city}` : ""}. Ayudo a equipos como el tuyo a mejorar resultados con un enfoque práctico y de bajo riesgo que arranca con un piloto corto.

Por qué esto puede ser relevante para vos:
- ${context}
- Podemos entregar mejoras medibles en el primer mes
- No se requiere compromiso a largo plazo para la fase de piloto

¿Te copa una llamada de 20 minutos esta semana?

Saludos,
[Tu Nombre]
Fundador de DayZero`
}

function buildB2CMessage(segment: string, city: string | undefined): string {
  const locationSuffix = city ? ` en ${city}` : ""
  return `Borrador de campaña para ${segment}

Titular: Mejores soluciones para ${segment.toLowerCase()}${locationSuffix}
CTA: Sumate a la lista de acceso anticipado y obtené el beneficio de lanzamiento del primer mes.

Mensaje:
Creamos esto específicamente para ${segment.toLowerCase()}${locationSuffix}. Registrate hoy y sé de los primeros en tener onboarding prioritario, precio de lanzamiento y soporte personalizado durante las primeras semanas.`
}

export function ClientsSection({ data, city }: ClientsSectionProps) {
  const t = useTranslations("clientsSection")
  const locale = useLocale()
  const isB2B = data.type === "b2b"
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({})

  const handleGenerate = (key: string, content: string) => {
    setGeneratedContent((prev) => ({ ...prev, [key]: content }))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.55_0.18_270_/_0.1)]">
            {isB2B ? <Building2 className="h-5 w-5 text-[oklch(0.55_0.18_270)]" /> : <Users className="h-5 w-5 text-[oklch(0.55_0.18_270)]" />}
          </div>
          <CardTitle className="text-xl">
            {isB2B ? t("b2bTitle", { city: city ? ` en ${city}` : "" }) : t("b2cTitle", { city: city ? ` en ${city}` : "" })}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isB2B && data.b2bClients ? (
          <div className="space-y-4">
            {data.b2bClients.map((client, index) => {
              const contentKey = `b2b-${index}`
              return (
                <div key={index} className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/30">
                  <h4 className="font-semibold text-foreground">{client.name}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{client.reason}</p>
                  <div className="mt-3 rounded-md bg-secondary/50 p-2.5 text-xs text-muted-foreground">
                    <p>
                      <span className="font-semibold text-foreground">{t("approach")}</span> {client.approach}
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold text-foreground">{t("contactRole")}</span> {client.contactRole}
                    </p>
                  </div>

                  <div className="mt-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => handleGenerate(contentKey, buildB2BEmail(client.name, city, client.contactRole, client.companyContext))}
                    >
                      <Mail className="h-4 w-4" />
                      {t("generateEmail")}
                    </Button>
                  </div>

                  {generatedContent[contentKey] && (
                    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-md border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-foreground">
                      {generatedContent[contentKey]}
                    </pre>
                  )}
                </div>
              )
            })}
          </div>
        ) : data.b2cSegments ? (
          <div className="space-y-4">
            {data.b2cSegments.map((segment, index) => {
              const contentKey = `b2c-${index}`
              return (
                <div key={index} className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/30">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-semibold text-foreground">{segment.segment}</h4>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {segment.estimatedSize}
                    </span>
                  </div>
                  <div className="mt-3 rounded-md bg-secondary/50 p-2.5 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{t("approach")}</span> {segment.reachStrategy}
                  </div>
                  <div className="mt-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => handleGenerate(contentKey, buildB2CMessage(segment.segment, city))}
                    >
                      <Wand2 className="h-4 w-4" />
                      {t("generateMessage")}
                    </Button>
                  </div>
                  {generatedContent[contentKey] && (
                    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-md border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-foreground">
                      {generatedContent[contentKey]}
                    </pre>
                  )}
                </div>
              )
            })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
