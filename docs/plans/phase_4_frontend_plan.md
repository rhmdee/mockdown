# Implementation Plan: Phase 4 Frontend Web App

Dokumen ini adalah spesifikasi teknis (blueprint) untuk mengeksekusi **Phase 4** dari Mockdown Project. Frontend dibangun menggunakan **Svelte 5 (Runes)**, **Vite**, dan **Tailwind CSS**. Mengacu pada `DESIGN.md`, aplikasi ini harus menggunakan gaya desain "Full Viewport Frame Shell" dengan transisi tema yang halus dan penggunaan *Design Tokens* yang ketat.

---

## User Review Required

> [!WARNING]
> Rencana ini sangat krusial karena menentukan arsitektur UI/UX utama. Harap periksa apakah pembagian *State Management* dengan Svelte 5 Runes dan struktur *Web Worker* sudah sesuai ekspektasi. Rencana ini didesain agar mudah dieksekusi langkah demi langkah oleh model AI implementer (Junior Agent).

## Open Questions

> [!IMPORTANT]
> 1. **CodeMirror Theme**: Apakah kita perlu menggunakan tema khusus untuk CodeMirror (misalnya One Dark) atau cukup disesuaikan manual agar *match* dengan warna `background` dan `foreground` dari `DESIGN.md`?
> 2. **Web Worker Bundling**: Karena kita memanggil modul dari workspace monorepo (`@mockdown/parser-core`) di dalam Web Worker Svelte/Vite, apakah konfigurasi standar `?worker` Vite sudah cukup, atau perlu setup *plugin* khusus? (Rencana awal akan menggunakan sintaks standar Vite Worker).

---

## Proposed Changes

Berikut adalah urutan implementasi yang **wajib** diikuti oleh Agent:

### 1. Setup Dependensi (`apps/web/package.json`)
Agent harus melakukan instalasi package berikut di `apps/web`:
- **CodeMirror**: `@codemirror/state`, `@codemirror/view`, `@codemirror/language`, `@codemirror/commands`, `@codemirror/theme-one-dark`.
- **Icons**: `lucide-svelte` untuk ikon UI yang konsisten.
- **Data Viewer**: `svelte-json-tree` atau sejenisnya (opsional, bisa dibangun manual jika sederhana).

### 2. Styling & Design Tokens (`apps/web/src/app.css` & `tailwind.config.js`)
- Rujuk **`DESIGN.md` Bagian 2 (Theme Tokens Matrix)**.
- Implementasikan CSS Variables di `:root` (Light mode) dan `.dark` (Dark mode) pada `app.css`.
  - Contoh: `--background: #ffffff;`, `--foreground: #171717;`, dsb.
- Konfigurasi `tailwind.config.js` untuk memetakan nama kelas standar (seperti `bg-background`, `text-primary`) ke CSS Variables tersebut.
- Implementasikan skala ukuran font **Geist** dan radius sesuai spesifikasi (`--radius-2xl`, `--radius-lg`, dsb).

### 3. State Management (Svelte 5 Runes)
Buat file *store* reaktif modern menggunakan `.svelte.ts`:
- **[NEW] `src/lib/stores/editorStore.svelte.ts`**:
  Menyimpan state teks Markdown saat ini. Menyediakan fungsi `updateMarkdown(text)`.
- **[NEW] `src/lib/stores/mockDataStore.svelte.ts`**:
  Menyimpan hasil parsing berupa skema AST, hasil generate *mock data JSON*, dan teks *Prisma Seed*. Status *loading* dari Web Worker juga disimpan di sini.

### 4. Setup Web Worker
Untuk mencegah UI *freeze* saat parsing dan generating data yang berat:
- **[NEW] `src/lib/workers/parser.worker.ts`**:
  Menerima pesan (message) teks markdown. Memanggil `parseTable` dari `@mockdown/parser-core`, lalu `generateMockData` dari `@mockdown/mock-engine`, dan `generatePrismaSeed` dari `@mockdown/prisma-generator`. Mengirim kembali objek hasilnya ke main thread.

### 5. Layout Shell Architecture
Menerapkan "Viewport-Locked Shell" sesuai **`DESIGN.md` Bagian 6**:
- **[MODIFY] `src/routes/+layout.svelte`**:
  - Container terluar: `w-screen h-screen p-2 gap-1.5 bg-accent overflow-hidden flex`.
  - Terdapat mekanisme Toggle Dark/Light Mode.
- **[NEW] `src/lib/components/Header.svelte`** (Opsional/Sederhana):
  - Memuat Logo Mockdown dan tombol aksi global (seperti *Deploy*).

### 6. Split-Screen Editor (`src/routes/+page.svelte`)
- Modifikasi halaman utama menjadi dua kolom sejajar (Left & Right Panel) menggunakan Flexbox.
- **Left Panel (Editor)**:
  - Mengimpor dan me-mount instance **CodeMirror 6**.
  - Mengikat *listener* agar setiap *keystroke* di-*debounce* (misal 300ms) lalu dikirim ke Web Worker.
- **Right Panel (Preview Tabs)**:
  - Container dengan background `bg-background`, sudut `rounded-2xl`, border `border-border`.
  - Terdapat struktur Tab (Navigasi: "JSON Preview", "Prisma Seed", "Deploy API").

### 7. Right Panel Components
- **[NEW] `src/lib/components/JsonViewer.svelte`**:
  - Menampilkan hasil raw JSON secara *pretty print*.
  - Menggunakan font `Geist Mono` (`font-mono`).
- **[NEW] `src/lib/components/PrismaViewer.svelte`**:
  - Menampilkan teks sintaks `seed.ts` (hasil dari `generatePrismaSeed`).
- **[NEW] `src/lib/components/DeployCard.svelte`**:
  - Tombol aksi utama "Deploy Mock API".
  - Saat ditekan, mengirim *payload* POST ke backend `apps/api` (localhost:3000/api/v1/deploy).
  - Menampilkan sukses box berupa URL Endpoint (misal `http://localhost:3000/api/mock/{id}`).

---

## Verification Plan

### Automated Tests
(Untuk saat ini fokus pada kompilasi dan linting)
1. Jalankan `bun run check-types` untuk memastikan tidak ada kesalahan pemanggilan Runes dan Worker.
2. Jalankan `bun run build` pada workspace `web` untuk memverifikasi kompatibilitas bundler Vite terhadap package eksternal dari monorepo.

### Manual Verification
1. Jalankan `bun run dev`.
2. Buka `http://localhost:5173`.
3. Verifikasi secara visual bahwa tema terang/gelap berfungsi dan warna-warni mematuhi `DESIGN.md`.
4. Ketik teks tabel markdown di sebelah kiri, dan verifikasi apakah *Right Panel* (JSON) terupdate secara responsif dan asinkronus (tanpa UI macet).
5. Klik "Deploy", dan pastikan mendapat balasan JSON berupa URL endpoint dari Backend API.
