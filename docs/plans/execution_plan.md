# Execution Plan: Mockdown Project

## Phase 1: Initial Setup (Completed)
- [x] Monorepo workspace setup (Bun + Turborepo)
- [x] Shared packages skeleton (`tsconfig`, `eslint-config`, `schema`)
- [x] Core packages skeleton (`parser-core`, `mock-engine`, `prisma-generator`)
- [x] App skeletons (`apps/api` with Elysia, `apps/web` with Svelte 5 + Vite + Tailwind)
- [x] Ensure `check-types`, `lint`, `test`, `build` pipelines are working

## Phase 2: Core Packages Implementation
### 2.1 Schema Definition (`packages/schema`)
- [x] Define robust TypeScript interfaces/DTOs for AST nodes, Mock Entities, and API responses.
- [x] Export TypeBox or Zod schemas if needed for Elysia validation.

### 2.2 Parser Core (`packages/parser-core`)
- [x] Install `unified`, `remark-parse`, `remark-gfm`.
- [x] Implement Markdown AST table parser to extract table headers and rows.
- [x] Implement Semantic Column Type Matcher (mapping text like 'id', 'email', 'name' to logical types).
- [x] Add unit tests for various table formats.

### 2.3 Mock Engine (`packages/mock-engine`)
- [x] Install `@faker-js/faker`.
- [x] Implement data generators mapping to semantic types (e.g., generate UUIDs, realistic emails, names).
- [x] Implement Topological Sort (Kahn's Algorithm) for foreign key resolution (handling table dependencies).
- [x] Add unit tests for generation and relations.

### 2.4 Prisma Generator (`packages/prisma-generator`)
- [x] Implement seed script builder based on the generated mock data.
- [x] Output valid TypeScript for a `seed.ts` file.

## Phase 3: Backend API (`apps/api`)
- [x] Set up Elysia routes for `/api/mock/:id` and `/api/v1/deploy`.
- [x] Integrate `@mockdown/schema` for validation.
- [x] Implement in-memory LRU cache / Redis connection for storing generated mock payloads.
- [x] Implement rate limiting.
- [x] Write integration tests for API endpoints.

## Phase 4: Frontend Web App (`apps/web`)
- [x] Set up global UI shell (Header, Layout, Split-Screen).
- [x] Implement Markdown Code Editor using CodeMirror 6.
- [x] Set up Web Worker for non-blocking AST parsing & generation.
- [x] Implement Right Panel (Preview):
  - [x] JSON Viewer component.
  - [x] Prisma Seeder Viewer component.
  - [x] Mock API Card / Deployment flow.
- [x] State Management using Svelte 5 Runes (e.g., `editorStore.svelte.ts`, `mockDataStore.svelte.ts`).
- [x] Polish UI with Tailwind CSS (soft rounded corners, glassmorphism, dark mode).

## Phase 5: Testing, Polish, and Deployment
- [ ] E2E testing for the main user flow.
- [ ] UI/UX polish and micro-interactions.
- [ ] Deploy `apps/web` to Vercel/Cloudflare.
- [ ] Deploy `apps/api` to Fly.io/Railway.
