# Implementation Plan: Phase 3 Backend API

Mengacu pada `docs/plans/execution_plan.md`, fase ini berfokus pada pembangunan Backend API (`apps/api`) menggunakan **ElysiaJS di atas runtime Bun**. Tujuan utama dari API ini adalah untuk memproses *deployment* mock data dari frontend dan menyediakan *ephemeral endpoint* yang bisa dikonsumsi oleh aplikasi klien selama kurun waktu tertentu.

## User Review Required

> [!WARNING]  
> Mengingat implementasi ini akan dieksekusi oleh model AI yang lebih murah (junior agent), pastikan seluruh instruksi di bawah ini sudah disetujui. Saya telah merancang agar struktur file cukup sederhana dan terpisah jelas antara *routes*, *services*, dan *types*.

## Open Questions

> [!IMPORTANT]  
> 1. **Rate Limiting**: Untuk MVP, apakah kita bisa menggunakan rate limiter sederhana berbasis memory `Map` per IP address, alih-alih menginstal Redis server penuh? (Ini mempermudah setup awal lokal).
> 2. **Library LRU Cache**: Apakah diperbolehkan menggunakan package npm populer seperti `lru-cache` untuk manajemen memori mock data, atau haruskah menggunakan Map TTL buatan sendiri? (Rencana saat ini menggunakan `lru-cache` agar otomatis menghapus data yang kedaluwarsa).

## Proposed Changes

### `apps/api` (Backend Service)

Berikut adalah struktur dan spesifikasi file yang harus diimplementasikan oleh Agent berikutnya:

#### [MODIFY] [package.json](file:///home/rhmdee/projects/mockdown/apps/api/package.json)
- Tambahkan dependensi `lru-cache` untuk menyimpan *mock payload* di memori.
- Tambahkan plugin `@elysiajs/cors` agar frontend dapat berkomunikasi secara *cross-origin*.
- Tambahkan dependensi development `bun-types` dan `@types/bun` (jika belum sesuai).

#### [NEW] [src/services/cache-store.ts](file:///home/rhmdee/projects/mockdown/apps/api/src/services/cache-store.ts)
- **Fungsi Utama**: Menyimpan dan mengambil payload mock data.
- **Implementasi**: Inisialisasi instance `LRUCache` dengan parameter `max` (misal 5000 items) dan `ttl` (1000 * 60 * 60 * 24 atau setara 24 jam).
- **Ekspor**: Menyediakan fungsi `saveMockData(id, data)` dan `getMockData(id)`.

#### [NEW] [src/services/rate-limiter.ts](file:///home/rhmdee/projects/mockdown/apps/api/src/services/rate-limiter.ts)
- **Fungsi Utama**: Membatasi *request* berlebih untuk mencegah abuse (DDoS ringan/Spam).
- **Implementasi**: Plugin Elysia yang membaca request IP address, menghitung iterasi request dalam satu menit (`Map<string, number>`), dan melempar status HTTP `429 Too Many Requests` jika melampaui batas (misal: 60 request/menit).

#### [NEW] [src/routes/deploy.ts](file:///home/rhmdee/projects/mockdown/apps/api/src/routes/deploy.ts)
- **Endpoint**: `POST /api/v1/deploy`
- **Fungsi Utama**: Menerima payload berupa skema dan data JSON (`DeployMockPayload`).
- **Implementasi**:
  1. *Type validation* terhadap `body` request (bisa diekstrak atau dicocokkan dengan `@mockdown/schema`).
  2. *Generate* ID unik acak (menggunakan `crypto.randomUUID()` atau utilitas Bun).
  3. Simpan data di `cache-store.ts` menggunakan ID tersebut.
  4. Kembalikan JSON berstruktur `DeployMockResponse` (memuat `endpointId`, `url` endpoint yang bisa diklik, dan `expiresAt`).

#### [NEW] [src/routes/mock.ts](file:///home/rhmdee/projects/mockdown/apps/api/src/routes/mock.ts)
- **Endpoint**: `GET /api/mock/:id` (dan juga di-support untuk rute bersarang misal `GET /api/mock/:id/users`).
- **Fungsi Utama**: Menyajikan data JSON yang sudah disimpan secara instan.
- **Implementasi**:
  1. Mengecek ID pada `cache-store`. Jika tidak ada, lempar HTTP `404 Not Found`.
  2. Jika klien me-request `/api/mock/:id`, kembalikan seluruh *mockData* objek (*all tables*).
  3. *(Optional/Bonus MVP)*: Jika me-request `/api/mock/:id/:tableName`, kembalikan data spesifik dari *table* tersebut.

#### [MODIFY] [src/index.ts](file:///home/rhmdee/projects/mockdown/apps/api/src/index.ts)
- Gabungkan (*mount*) semua route dan plugin:
  - Gunakan `cors()`.
  - Pasang `rateLimiter` (opsional untuk rute mock agar tidak terlalu membebani overhead, tapi wajib di `/api/v1/deploy`).
  - Daftarkan route dari `deploy.ts` dan `mock.ts`.

#### [NEW] [tests/api.test.ts](file:///home/rhmdee/projects/mockdown/apps/api/tests/api.test.ts)
- Skrip integrasi (menggunakan `bun test`) untuk memanggil metode `.handle()` pada aplikasi Elysia secara terprogram.
- **Skenario Tes**:
  1. Berhasil melempar POST data ke `/api/v1/deploy` dan menerima *ID Endpoint*.
  2. Berhasil menarik data via `GET /api/mock/:id` dengan ID dari langkah pertama.
  3. Menerima error 404 ketika mengakses ID acak yang tidak ada.

## Verification Plan

### Automated Tests
Agent perlu menjalankan perintah di bawah ini setelah modifikasi di `apps/api`:
```bash
bun test --filter api
```
Seluruh integration test harus mencetak status `pass`.

### Manual Verification
1. Klien dapat menjalankan `bun run dev` di root folder.
2. Mengirim CURL POST ke `http://localhost:3000/api/v1/deploy` dengan valid JSON.
3. Mengakses URL endpoint balasan di browser web biasa dan melihat kembalian raw JSON-nya.
