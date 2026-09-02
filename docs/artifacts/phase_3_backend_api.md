# Phase 3: Backend API Implementation Details

## Overview
Modul `apps/api` adalah layanan backend REST API berbasis **ElysiaJS** yang berjalan di atas runtime **Bun**. Backend ini bertanggung jawab menerima payload skema dan data mock dari klien web, menyimpannya dalam cache sementara, dan menyediakannya melalui ephemeral endpoint yang dapat diakses secara publik.

## Key Implementations
- **Lokasi Proyek**: `apps/api`
- **Framework**: ElysiaJS + Bun
- **Plugins/Dependencies**:
  - `lru-cache`: Manajemen in-memory cache dengan time-to-live (TTL).
  - `@elysiajs/cors`: Penanganan Cross-Origin Resource Sharing agar frontend web dapat berinteraksi langsung.
  - `@mockdown/schema`: Kontrak data DTO (`DeployMockPayload`, `DeployMockResponse`).

### 1. In-Memory Cache Store (`src/services/cache-store.ts`)
- Menggunakan `LRUCache` dengan kapasitas maksimum 5000 entitas dan TTL otomatis selama 24 jam (`1000 * 60 * 60 * 24` ms).
- Menyediakan fungsi `saveMockData(id, payload)` dan `getMockData(id)`.
- Mengembalikan metadata masa aktif `expiresAt` dalam format ISO-8601 string.

### 2. In-Memory Rate Limiter (`src/services/rate-limiter.ts`)
- Middleware / plugin Elysia berbasis pelacakan alamat IP klien.
- Membatasi kuota request (default: 100 requests per sliding window 60 detik).
- Melempar status HTTP `429 Too Many Requests` beserta header `Retry-After` saat kuota terlampaui.

### 3. Deploy Route (`src/routes/deploy.ts`)
- **Endpoint**: `POST /api/v1/deploy`
- Memvalidasi struktur `DeployMockPayload` (skema tabel dan record data).
- Menghasilkan UUID acak (`crypto.randomUUID()`) sebagai `endpointId`.
- Menyimpan data di `cache-store`.
- Mengembalikan response `DeployMockResponse` berisi URL endpoint yang dapat langsung dikonsumsi (`/api/mock/:id`).

### 4. Mock Data Serving Route (`src/routes/mock.ts`)
- **Endpoint 1**: `GET /api/mock/:id`
  - Mengembalikan seluruh objek `mockData` dari entitas yang bersangkutan.
  - Mengembalikan HTTP `404 Not Found` jika ID tidak ditemukan atau sudah kedaluwarsa.
- **Endpoint 2**: `GET /api/mock/:id/:tableName`
  - Mengembalikan array data spesifik untuk satu tabel yang diminta (case-insensitive lookup).
  - Mengembalikan HTTP `404 Not Found` jika nama tabel tidak terdaftar pada endpoint ID tersebut.

### 5. Integration Tests (`tests/api.test.ts`)
- Menjalankan 4 skenario integrasi menggunakan `bun test` dengan memanggil `app.handle(new Request(...))`:
  1. Health check service (`GET /`).
  2. Alur deployment mock (`POST /api/v1/deploy`) dan pembacaan seluruh tabel (`GET /api/mock/:id`) serta pembacaan per-tabel (`GET /api/mock/:id/:tableName`).
  3. Validasi error 404 pada ID acak/tidak ditemukan.
  4. Validasi error 404 pada nama tabel yang tidak valid.

## Test Results
- Seluruh 4 pengujian integration test `apps/api` berhasil dilewati dengan status **PASS**.
- Verifikasi `turbo run check-types` dan `turbo run test` monorepo 100% lulus.
