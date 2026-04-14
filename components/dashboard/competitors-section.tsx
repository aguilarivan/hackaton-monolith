"use client"

import { useMemo } from "react"
import dynamic from "next/dynamic"
import { Users, ThumbsUp, ThumbsDown, MapPin, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CompetitorData } from "@/lib/mock-data"

interface CompetitorsSectionProps {
  data: CompetitorData
  city: string
}

type Coordinate = {
  lat: number
  lng: number
}

type GridZone = {
  zone: string
  center: Coordinate
  competitorDensity: number
  demandSignal: number
  launchScore: number
  color: string
}

const MapContainer = dynamic(async () => (await import("react-leaflet")).MapContainer, { ssr: false })
const TileLayer = dynamic(async () => (await import("react-leaflet")).TileLayer, { ssr: false })
const Circle = dynamic(async () => (await import("react-leaflet")).Circle, { ssr: false })
const CircleMarker = dynamic(async () => (await import("react-leaflet")).CircleMarker, { ssr: false })
const Popup = dynamic(async () => (await import("react-leaflet")).Popup, { ssr: false })
const Tooltip = dynamic(async () => (await import("react-leaflet")).Tooltip, { ssr: false })

const BA_CENTER: Coordinate = { lat: -34.6037, lng: -58.3816 }
const BA_BOUNDS = {
  north: -34.53,
  south: -34.72,
  west: -58.53,
  east: -58.34,
}

const BA_FALLBACK_COMPETITORS = [
  {
    name: "ScaleOps",
    cityArea: "Microcentro",
    location: { lat: -34.6024, lng: -58.3789 },
  },
  {
    name: "FlowPilot",
    cityArea: "Palermo",
    location: { lat: -34.5885, lng: -58.4305 },
  },
  {
    name: "LegacySuite",
    cityArea: "Belgrano",
    location: { lat: -34.5621, lng: -58.4562 },
  },
  {
    name: "NicheCloud",
    cityArea: "Caballito",
    location: { lat: -34.6195, lng: -58.4432 },
  },
  {
    name: "UrbanAssist",
    cityArea: "Barracas",
    location: { lat: -34.6469, lng: -58.3743 },
  },
]

const DEMAND_HOTSPOTS = [
  { lat: -34.5885, lng: -58.4305, weight: 9.4 },
  { lat: -34.5975, lng: -58.3728, weight: 9.0 },
  { lat: -34.6039, lng: -58.4108, weight: 8.7 },
  { lat: -34.5621, lng: -58.4562, weight: 8.1 },
  { lat: -34.6242, lng: -58.4119, weight: 7.8 },
]

function toLeafletPosition(point: Coordinate): [number, number] {
  return [point.lat, point.lng]
}

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function haversineKm(a: Coordinate, b: Coordinate) {
  const earthRadiusKm = 6371
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)
  const haversine =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine))
}

function colorForLaunchScore(score: number) {
  if (score >= 8) {
    return { fill: "#22c55e", stroke: "#15803d" }
  }
  if (score >= 7) {
    return { fill: "#84cc16", stroke: "#4d7c0f" }
  }
  if (score >= 6) {
    return { fill: "#f59e0b", stroke: "#b45309" }
  }
  return { fill: "#ef4444", stroke: "#b91c1c" }
}

function buildBuenosAiresGrid(competitorLocations: Coordinate[]): GridZone[] {
  const rows = 4
  const cols = 4
  const latStep = (BA_BOUNDS.north - BA_BOUNDS.south) / rows
  const lngStep = (BA_BOUNDS.east - BA_BOUNDS.west) / cols
  const zones: GridZone[] = []

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const zoneCenter = {
        lat: BA_BOUNDS.north - latStep * (row + 0.5),
        lng: BA_BOUNDS.west + lngStep * (col + 0.5),
      }

      const nearbyCompetitors = competitorLocations.filter((location) => haversineKm(location, zoneCenter) <= 2.8)
      const densityScore = Math.min(10, nearbyCompetitors.length * 2.6)

      const demandContrib = DEMAND_HOTSPOTS.map((hotspot) => {
        const distance = Math.max(0.4, haversineKm(zoneCenter, hotspot))
        return hotspot.weight / distance
      })
      const demandSignal = Math.min(
        10,
        demandContrib.reduce((acc, current) => acc + current, 0) / 4.5
      )

      const launchScore = Number((demandSignal * 0.6 + (10 - densityScore) * 0.4).toFixed(1))
      const color = colorForLaunchScore(launchScore)

      zones.push({
        zone: `Grid ${String.fromCharCode(65 + row)}${col + 1}`,
        center: zoneCenter,
        competitorDensity: Number(densityScore.toFixed(1)),
        demandSignal: Number(demandSignal.toFixed(1)),
        launchScore,
        color: color.fill,
      })
    }
  }

  return zones
}

export function CompetitorsSection({ data, city }: CompetitorsSectionProps) {
  const normalizedCity = city.trim().toLowerCase()
  const isBuenosAires = normalizedCity.includes("buenos aires") || normalizedCity.includes("caba")

  const mapCenter = isBuenosAires ? BA_CENTER : data.mapCenter

  const competitorLocations = useMemo(() => {
    const valid = data.competitors
      .filter((competitor) => competitor.location)
      .map((competitor) => competitor.location as Coordinate)
    return valid.length > 0 ? valid : BA_FALLBACK_COMPETITORS.map((c) => c.location)
  }, [data.competitors])

  const launchZones = useMemo(() => buildBuenosAiresGrid(competitorLocations), [competitorLocations])
  const bestZone = useMemo(
    () => [...launchZones].sort((a, b) => b.launchScore - a.launchScore)[0],
    [launchZones]
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.55_0.18_270_/_0.1)]">
              <Users className="h-5 w-5 text-[oklch(0.55_0.18_270)]" />
            </div>
            <div>
              <CardTitle className="text-xl">Competitor Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">{data.competitors.length} main competitors in {city}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.competitors.map((competitor, index) => (
            <div key={index} className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-foreground">{competitor.name}</h4>
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {competitor.cityArea}
                    </span>
                    <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">
                      Share: {competitor.marketShare}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{competitor.description}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-success">Strengths</span>
                  </div>
                  <ul className="space-y-1">
                    {competitor.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium text-destructive">Weaknesses</span>
                  </div>
                  <ul className="space-y-1">
                    {competitor.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.55_0.18_270_/_0.1)]">
              <MapPin className="h-5 w-5 text-[oklch(0.55_0.18_270)]" />
            </div>
            <div>
              <CardTitle className="text-xl">Launch Opportunity Map</CardTitle>
              <p className="text-sm text-muted-foreground">
                Grid map in Buenos Aires. Colors are calculated from nearby competitors and demand hotspots.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="h-80 overflow-hidden rounded-lg border border-border">
              <MapContainer center={toLeafletPosition(mapCenter)} zoom={12} scrollWheelZoom={false} className="h-full w-full">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {launchZones.map((zone) => {
                  const color = colorForLaunchScore(zone.launchScore)
                  return (
                    <Circle
                      key={zone.zone}
                      center={toLeafletPosition(zone.center)}
                      radius={1450}
                      pathOptions={{ color: color.stroke, weight: 1.25, fillColor: color.fill, fillOpacity: 0.28 }}
                    >
                      <Tooltip direction="top" offset={[0, -8]}>
                        <div className="text-xs">
                          <p className="font-semibold">{zone.zone}</p>
                          <p>Opportunity: {zone.launchScore}/10</p>
                        </div>
                      </Tooltip>
                    </Circle>
                  )
                })}

                {data.competitors.map((competitor, index) => {
                  const position = competitor.location
                    ? toLeafletPosition(competitor.location)
                    : toLeafletPosition(BA_FALLBACK_COMPETITORS[index % BA_FALLBACK_COMPETITORS.length].location)

                  return (
                    <CircleMarker
                      key={`${competitor.name}-${index}`}
                      center={position}
                      radius={6}
                      pathOptions={{ color: "#1d4ed8", weight: 2, fillColor: "#3b82f6", fillOpacity: 0.9 }}
                    >
                      <Popup>
                        <div className="space-y-1 text-xs">
                          <p className="font-semibold text-foreground">{competitor.name}</p>
                          <p className="text-muted-foreground">{competitor.cityArea}</p>
                          <p className="text-muted-foreground">Share: {competitor.marketShare}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  )
                })}
              </MapContainer>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
                High opportunity
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#84cc16]" />
                Medium-high
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
                Medium
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
                Low opportunity
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {launchZones.map((zone, index) => (
              <div key={index} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{zone.zone}</p>
                  <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: zone.color }}>
                    Score {zone.launchScore}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <p>Competitor density: {zone.competitorDensity}/10</p>
                  <p>Demand signal: {zone.demandSignal}/10</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-success/30 bg-success/5 p-4">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-success">
              <Target className="h-4 w-4" />
              Best launch zone: {bestZone.zone}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              This area balances lower competitor pressure with strong demand indicators.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
