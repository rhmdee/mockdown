# Project Structure (Monorepo Architecture): Mockdown

## 1. Overview
Proyek ini diorganisasi menggunakan **Bun Workspaces** dan **Turborepo** untuk memungkinkan manajemen *multi-package* modular dengan performa tinggi, runtime TypeScript bawaan, dan isolasi penuh antara aplikasi frontend SPA dan backend service.

---

## 2. Directory Tree

```
mockdown/
├── .github/
│   └── workflows/
│       ├── ci.yml                          # Continuous Integration (Lint, Typecheck, Bun Test)
│       └── deploy.yml                      # Deployment Pipelines (Vercel & Bun Edge)
├── apps/
│   ├── web/                                # Frontend SPA: Svelte 5 + Vite
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── components/
│   │   │   │   │   ├── editor/
│   │   │   │   │   │   ├── CodeMirrorEditor.svelte
│   │   │   │   │   │   └── SplitScreenLayout.svelte
│   │   │   │   │   ├── preview/
│   │   │   │   │   │   ├── TablePreview.svelte
│   │   │   │   │   │   ├── JsonViewer.svelte
│   │   │   │   │   │   ├── PrismaSeederView.svelte
│   │   │   │   │   │   └── MockApiCard.svelte
│   │   │   │   │   ├── common/
│   │   │   │   │   │   ├── HeaderToolbar.svelte
│   │   │   │   │   │   └── StatusBadge.svelte
│   │   │   │   │   └── modals/
│   │   │   │   │       └── DeployMockModal.svelte
│   │   │   │   ├── stores/
│   │   │   │   │   ├── editorStore.svelte.ts # Svelte 5 Runes state
│   │   │   │   │   └── mockDataStore.svelte.ts
│   │   │   │   └── workers/
│   │   │   │       └── ast-worker.ts       # Web Worker untuk AST parsing
│   │   │   ├── App.svelte                  # Root Svelte Component
│   │   │   ├── main.ts                     # Vite Entry point
│   │   │   └── app.css                     # Tailwind CSS & Design Tokens
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tailwind.config.ts
│   │   └── vite.config.ts
│   └── api/                                # Backend Service: ElysiaJS on Bun
│       ├── src/
│       │   ├── routes/
│       │   │   ├── mock.ts                 # /api/mock/:id (Instant REST handler)
│       │   │   └── deploy.ts               # /api/v1/deploy (Store payload to KV/Cache)
│       │   ├── services/
│       │   │   ├── cache-store.ts          # LRU / Redis TTL store
│       │   │   └── rate-limiter.ts         # Rate limiter middleware
│       │   └── index.ts                    # Elysia server entry
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── parser-core/                        # Markdown AST Extraction Engine
│   │   ├── src/
│   │   │   ├── table-parser.ts             # Unified / Remark GFM parser
│   │   │   ├── schema-inferrer.ts          # Semantic column type matcher
│   │   │   └── index.ts
│   │   ├── tests/
│   │   │   └── table-parser.test.ts        # Bun test suite
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── mock-engine/                        # Data Generator (@faker-js/faker)
│   │   ├── src/
│   │   │   ├── generators/                 # Typed faker data builders
│   │   │   ├── relational-resolver.ts      # Toposort / Foreign Key resolver
│   │   │   └── index.ts
│   │   ├── tests/
│   │   │   └── relational-resolver.test.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── prisma-generator/                   # Generator Script Seed Prisma
│   │   ├── src/
│   │   │   ├── seed-builder.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── schema/                             # Shared Types & DTOs
│   │   ├── src/
│   │   │   ├── entity.ts
│   │   │   ├── endpoint.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── tsconfig/                           # Shared TSConfigs
│   │   ├── base.json
│   │   └── svelte.json
│   └── eslint-config/                      # Shared ESLint Configuration
│       ├── package.json
│       └── index.js
├── docs/
│   ├── artifacts/
│   │   ├── prd_mock_data_generator.md
│   │   ├── tech_stack.md
│   │   ├── ui_ux_specification.md
│   │   ├── business_rules.md
│   │   ├── user_flow.md
│   │   ├── state_status_flow.md
│   │   ├── validation_rules.md
│   │   ├── system_architecture.md
│   │   ├── project_structure.md
│   │   └── security_rules.md
│   └── plans/
├── turbo.json                              # Turborepo task pipeline
├── package.json                            # Root Bun workspace manifest
└── README.md
```

---

## 3. Konfigurasi Kunci Monorepo

### `package.json` (Root Bun Workspace)
```json
{
  "name": "mockdown",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "check-types": "turbo run check-types"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

### `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "inputs": ["src/**/*.ts", "tests/**/*.ts"]
    },
    "lint": {},
    "check-types": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```
