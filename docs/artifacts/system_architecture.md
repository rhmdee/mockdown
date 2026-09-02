# System Architecture: Mockdown

## 1. Executive Summary
Mockdown dirancang menggunakan arsitektur **Decoupled Edge-Ready Monorepo**. Desain arsitektur ini memisahkan secara tegas antara antarmuka pengguna frontend (*Pure Client SPA*), layanan backend instan (*ElysiaJS on Bun*), dan mesin inti komputasi data (*Core Domain Packages*), memastikan latensi parsing < 1 detik, rendering 60 FPS, dan nol biaya server untuk komputasi parsing data.

---

## 2. High-Level Architecture Diagram

```mermaid
graph TB
    subgraph Client_Layer["Client Presentation Layer (Browser SPA - Svelte 5 + Vite)"]
        UI["Svelte 5 App (Tailwind CSS + Lucide)"]
        Editor["CodeMirror 6 Markdown Editor"]
        PreviewView["Interactive Table & JSON Previewer"]
        Worker["Web Worker: AST Parsing & Faker Engine"]
    end

    subgraph API_Layer["Backend Service Layer (ElysiaJS on Bun)"]
        DeployRoute["POST /api/v1/deploy (Store Instant Payload)"]
        MockRouter["GET/POST /api/mock/:id (Serve Ephemeral Data)"]
        RateLimiter["Token Bucket Rate Limiter Plugin"]
        CacheStore[("LRU Memory Store / Redis KV (TTL 24h)")]
    end

    subgraph Core_Packages["Shared Monorepo Packages (Pure TypeScript)"]
        ParserCore["@mockdown/parser-core (Unified/Remark AST)"]
        MockEngine["@mockdown/mock-engine (Faker.js + Topological Sort)"]
        PrismaGen["@mockdown/prisma-generator (Seed Script Builder)"]
        SchemaPkg["@mockdown/schema (Shared DTOs & Schemas)"]
    end

    %% Client Internal Flow
    Editor --> UI
    UI <--> Worker
    Worker --> ParserCore
    Worker --> MockEngine
    Worker --> PrismaGen
    UI --> PreviewView

    %% Client to Backend Flow
    UI --> DeployRoute
    DeployRoute --> CacheStore
    MockRouter --> RateLimiter
    MockRouter --> CacheStore
```

---

## 3. Component Breakdown

### 3.1. Client-Side Presentation Layer (`apps/web`)
* **Svelte 5 + Vite (SPA):** Aplikasi *Single Page Application* murni tanpa overhead server-side rendering, memanfaatkan Svelte 5 *Runes* untuk state management yang reaktif dan cepat.
* **CodeMirror 6 Editor:** Editor kode ringan (~300 KB) dengan dukungan GFM syntax highlighting dan line markers.
* **Dedicated Web Worker:** Menjalankan `@mockdown/parser-core` dan `@mockdown/mock-engine` di thread latar belakang (*background thread*) agar browser pengguna tidak membeku (*zero UI freeze*).

### 3.2. Backend API Service (`apps/api`)
* **ElysiaJS (Bun Native):** Server HTTP berkecepatan tinggi untuk menangani pembuatan dan penyajian data endpoint instan (`/api/mock/:id`).
* **In-Memory LRU / Redis Store:** Penyimpanan *volatile* ber-TTL 24 jam dengan auto-purge untuk memastikan data mock kedaluwarsa dibersihkan secara otomatis.
* **Rate Limiting Middleware:** Melindungi server dari DoS dengan membatasi request maksimal 60 req/menit per IP.

### 3.3. Core Domain Packages (`packages/*`)
* **`@mockdown/parser-core`:** Menerjemahkan tabel Markdown menjadi AST dan mengekstrak definisi kolom.
* **`@mockdown/mock-engine`:** Membangun data sintetis (@faker-js/faker) dan menyelesaikan relasi *foreign key* antar entitas.
* **`@mockdown/prisma-generator`:** Mengonversi data entitas menjadi skrip seeder Prisma (`seed.ts`).
* **`@mockdown/schema`:** Definisi tipe data bersama dan validasi runtime.

---

## 4. Latency & Performance SLA
* **Client AST Parsing:** $\le 100\text{ ms}$ di dalam Web Worker.
* **Client Faker Generation (10-100 rows):** $\le 150\text{ ms}$.
* **Total Time-to-Preview:** $\le 550\text{ ms}$ (Debounce 300ms + Parse/Gen 250ms).
* **Mock Endpoint Response Time (Bun + Elysia):** $\le 5\text{ ms}$ (P95 Latency).
