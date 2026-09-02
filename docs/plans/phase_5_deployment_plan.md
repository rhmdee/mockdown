# Implementation Plan: Phase 5 Testing, Polish, and Deployment

Dokumen ini adalah rencana implementasi (blueprint teknis) untuk **Phase 5** dari proyek Mockdown. Fokus dari fase ini adalah menjamin kualitas sistem melalui **End-to-End (E2E) & Integration Testing**, penyempurnaan **UI/UX & Micro-interactions** sesuai `DESIGN.md`, serta penyiapan konfigurasi **Deployment Production** (Docker & Serverless config).

---

## User Review Required

> [!IMPORTANT]
> 1. **E2E Testing Tool**: Untuk E2E testing pada monorepo Bun/Svelte ini, kita akan menambahkan integration test suite komprehensif berbasis `bun test` yang memverifikasi aliran penuh (Markdown Input -> Web Worker Mock Generation -> API Deployment -> Live Endpoint Data Consumption).
> 2. **Docker Containerization**: Kami akan membuat `Dockerfile` multi-stage berbasis `oven/bun:alpine` yang ringan dan siap di-deploy ke platform seperti Fly.io, Railway, atau Render.
> 3. **Static Frontend Config**: Kami akan menyiapkan konfigurasi build statis untuk `apps/web` yang siap di-deploy ke Vercel atau Cloudflare Pages.

---

## Proposed Changes

Berikut adalah urutan implementasi yang **wajib** diikuti oleh Agent:

### 1. End-to-End Flow & Integration Tests
Membuat skrip pengujian alur lengkap pengguna:
- **[NEW] `tests/e2e-flow.test.ts` (Root test suite)**:
  1. Parsing teks Markdown dari awal (menggunakan `@mockdown/parser-core`).
  2. Menghasilkan mock data dan skrip Prisma seeder (menggunakan `@mockdown/mock-engine` dan `@mockdown/prisma-generator`).
  3. Mengirimkan payload ke server ElysiaJS (`apps/api`) via endpoint `POST /api/v1/deploy`.
  4. Mengambil data dari endpoint dinamis `GET /api/mock/:id` dan memvalidasi bahwa data yang diterima sesuai dengan skema Markdown awal.
  5. Memvalidasi bahwa pemanggilan endpoint spesifik `GET /api/mock/:id/users` berhasil mengembalikan hanya entitas yang bersangkutan.

### 2. UI/UX Polish & Micro-Interactions (`apps/web`)
Menyelaraskan detail visual dengan `DESIGN.md`:
- **Smooth Theme Transitions**:
  - Memastikan transisi warna `transition-colors duration-200 ease-in-out` aktif pada tombol, kartu, dan latar belakang.
- **Micro-Animations & Visual Feedback**:
  - Efek *pulse* halus pada status live-sync (`bg-success animate-pulse`).
  - Animasi *spinner* saat melakukan *publishing* API.
  - Toast / badge feedback ketika teks berhasil disalin ke clipboard ("Copied!").
- **Responsive Layout Check**:
  - Memastikan tampilan Split-Screen berubah menjadi *vertical stacked* yang rapi pada layar mobile (`flex-col md:flex-row`).

### 3. Production Deployment Configurations
- **[NEW] `apps/api/Dockerfile`**:
  - Multi-stage Docker build menggunakan image `oven/bun:1-alpine`.
  - Tahap 1: Install dependensi workspace monorepo.
  - Tahap 2: Bundle aplikasi API dengan `bun build src/index.ts --target bun --outdir dist`.
  - Tahap 3: Expose port 3000 dan jalankan `bun dist/index.js`.
- **[NEW] `apps/api/.dockerignore`**:
  - Mengabaikan `node_modules`, `.git`, `.turbo`, dan folder lokal yang tidak diperlukan.
- **[NEW] `apps/web/vercel.json` (atau static redirect config)**:
  - Konfigurasi SPA routing (`routes: [{ handle: "filesystem" }, { src: "/.*", dest: "/index.html" }]`) untuk deployment di Vercel / Cloudflare.
- **[NEW] `docs/deployment_guide.md`**:
  - Dokumentasi instruksi langkah demi langkah cara men-deploy `apps/api` (Fly.io/Docker) dan `apps/web` (Vercel/Cloudflare).

### 4. Root Scripts & Final Quality Gate
- **[MODIFY] `package.json` (Root)**:
  - Memastikan skrip `bun run build`, `bun run test`, dan `bun run check-types` dapat dijalankan sekaligus tanpa error.

---

## Verification Plan

### Automated Tests
Agent perlu menjalankan:
1. `bun test` di root folder untuk memastikan seluruh pengujian (termasuk E2E test baru) **100% lulus**.
2. `bun run check-types` untuk memastikan tidak ada kesalahan tipe data.
3. `bun run build` untuk memverifikasi build produksi frontend dan backend berjalan tanpa kegagalan.

### Manual Verification
1. Menjalankan Docker build lokal untuk memverifikasi image backend API:
   ```bash
   docker build -t mockdown-api -f apps/api/Dockerfile .
   ```
2. Memeriksa antarmuka web di browser dan memverifikasi interaksi tombol, transisi tema, dan deployment mock.
