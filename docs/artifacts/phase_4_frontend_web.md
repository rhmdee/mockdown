# Phase 4: Frontend Web App Implementation Details

## Overview
Aplikasi `apps/web` adalah Single Page Application (SPA) berbasis **Svelte 5 (Runes)**, **Vite**, dan **Tailwind CSS v4** yang mengimplementasikan antarmuka *Split-Screen* untuk mengedit data dictionary Markdown, menghasilkan mock data secara asinkronus tanpa memblokir thread UI (via Web Worker), serta mempublikasikan mock API instan.

## Key Implementations
- **Lokasi Proyek**: `apps/web`
- **Framework**: Svelte 5 + Vite + Tailwind CSS v4
- **Desain**: Mengikuti `DESIGN.md` (Viewport-Locked Frame Shell, Semantic Tokens, Geist Typography, Border Radius System).

### 1. Design System Tokens & Styling (`src/app.css` & `index.html`)
- Mengonfigurasi seluruh token semantik (`--background`, `--foreground`, `--accent`, `--primary`, `--border`, dll.) untuk Light dan Dark Mode.
- Mengimpor font modern **Geist Sans** (UI copy) dan **Geist Mono** (JSON viewer & Prisma code).
- Mengatur custom scrollbar dan styling CodeMirror agar selaras dengan palet tema.

### 2. State Management Svelte 5 Runes (`src/lib/stores/`)
- **`editorStore.svelte.ts`**:
  - Mengelola state Markdown teks (`$state`).
  - Mengatur konfigurasi jumlah baris yang di-generate (`rowCount`).
  - Melacak status parsing aktif (`isParsing`).
- **`mockDataStore.svelte.ts`**:
  - Menyimpan hasil skema AST (`schema`), mock data records (`mockData`), dan skrip Prisma seeder (`prismaSeed`).
  - Mengatur navigasi tab preview aktif (`activeTab`: `'json'` | `'prisma'` | `'deploy'`).
  - Mengelola state status deployment mock API (`deployedEndpoint`, `isDeploying`, `deployError`).
  - Mengelola toggle tema (Dark/Light) secara reaktif.

### 3. Non-Blocking Web Worker (`src/lib/workers/parser.worker.ts`)
- Memisahkan beban komputasi parsing AST (`@mockdown/parser-core`), pembuatan dummy data (`@mockdown/mock-engine`), dan pembuatan Prisma seeder (`@mockdown/prisma-generator`) ke background thread Web Worker.
- Di-trigger secara otomatis setiap kali ada perubahan teks Markdown atau jumlah baris dengan mekanisme *debouncing* 200ms.

### 4. Components & Viewport-Locked Layout (`src/lib/components/` & `src/App.svelte`)
- **`Header.svelte`**: Menampilkan identitas Mockdown Studio, *live sync indicator*, pemilih jumlah baris (*row selector*), toggle dark/light mode, dan tombol CTA deployment.
- **`Editor.svelte`**: Editor Markdown bertenaga **CodeMirror 6** dengan line wrapping, syntax highlighting, active line highlight, dan tombol reset ke contoh template.
- **`JsonViewer.svelte`**: Penampil output raw JSON terformat (*pretty-printed*) lengkap dengan metadata jumlah tabel & baris, tombol copy ke clipboard, dan tombol download `.json`.
- **`PrismaViewer.svelte`**: Penampil kode `seed.ts` untuk Prisma ORM, petunjuk eksekusi CLI, tombol copy, dan tombol download file seeder.
- **`DeployCard.svelte`**: Kartu integrasi deployment yang mengirim payload ke backend API (`POST /api/v1/deploy`), menampilkan timer kedaluwarsa 24 jam, URL endpoint yang dapat langsung diuji, rute per-tabel, dan contoh perintah cURL.

## Verification & Build Results
- `turbo run check-types`: **0 errors, 0 warnings** across all 8 monorepo workspaces.
- `turbo run test`: **4/4 test suites passed**.
- `turbo run build`: Bundle produksi `apps/web` berhasil di-build oleh Vite dengan output assets teroptimasi.
