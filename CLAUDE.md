# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start development server
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

Package manager is **pnpm**. No test suite is configured.

## Architecture Overview

**Day Zero** is a Next.js 16 (App Router) startup-idea validator written in TypeScript with React 19 and Tailwind CSS v4. The UI is in Argentine Spanish.

### 3-step user flow

1. **`/`** — User enters a business idea, city, and initial investment. A flow session is created server-side and the `flowId` is persisted to `localStorage`.
2. **`/preguntas-claude`** — Clarification questions are fetched from `/api/questions` and displayed. Answers are saved to the server (`PATCH /api/flow`) and to `localStorage`.
3. **`/analisis`** — The flow session is re-fetched, then `/api/analysis` generates a full `StartupAnalysis`. A multi-section dashboard is rendered.

Navigating backwards without an active session redirects to `/`.

### API layer

All routes live in `app/api/` and follow a consistent envelope:
- Success: `{ ok: true, data: T }`
- Error: `{ ok: false, error: { code, message, requestId } }`

Helpers in `lib/server/api-response.ts` (`apiSuccess`, `apiError`, `parseJsonBody`) must be used in every route handler.

### Server-side state

`lib/server/flow-store.ts` holds an **in-memory `Map`** of `FlowRecord` objects keyed by UUID. This store is not persisted — it resets on every server restart. Sessions are lost on redeploy.

### Client-side persistence

`lib/flow-storage.ts` wraps `localStorage` under the `dayzero.*` namespace for `businessInput`, `claudeAnswers`, and `flowId`. All functions guard against SSR with a `canUseStorage()` check.

### Typed API client

`lib/flow-api.ts` provides the client-side fetch layer (`createFlowSession`, `saveFlowAnswers`, `getFlowSession`, `generateAnalysisFromApi`, `getClarificationQuestionsFromApi`). It uses a shared `requestJson<T>` helper that parses the envelope and throws a typed `ApiClientError` on failure. Always use `isApiClientError(error)` to branch on structured API errors vs unknown exceptions.

### Analysis generation

`lib/mock-data.ts` exports `generateAnalysis(input)`, which deterministically generates a full `StartupAnalysis` using hash-based pseudo-randomness seeded from the idea string and city. There is **no real Claude / AI API call** — the analysis is synthetic. The `StartupAnalysis` type and all its sub-types are defined in this file.

### UI components

- `components/ui/` — shadcn/ui primitives (do not edit manually; regenerate via `npx shadcn@latest add <component>`).
- `components/dashboard/` — one file per analysis section (viability, competitors, clients, monetization, legal, kit, roadmap, obstacles, landing CTA).
- `components/startup-dashboard.tsx` — assembles all dashboard sections; accepts `data: BusinessInputData` and `analysisOverride?: StartupAnalysis`.

### Path alias

`@/` maps to the repository root in both TypeScript and Next.js config.
