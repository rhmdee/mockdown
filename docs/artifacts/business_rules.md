# Business Rules: Mock Data Generator

## 1. Document Overview
Dokumen ini mendefinisikan aturan bisnis (*business rules*) yang mengatur logika pemrosesan dokumen spesifikasi Markdown, inferensi tipe data, batasan generasi data tiruan (*mock data*), pembuatan relasi entitas, ekspor, serta pengelolaan *ephemeral endpoint*.

---

## 2. Rule Catalog

### 2.1. Ingestion & AST Parsing Rules
* **BR-DOC-001 (Table Structure Detection):** 
  Parser AST hanya memproses tabel yang memiliki *header row* dan minimal satu baris *delimiter* GitHub Flavored Markdown (`|---|`). Teks narasi di luar tabel diabaikan secara aman.
* **BR-DOC-002 (Entity Name Inference):**
  Nama entitas diambil dari teks *Heading* (H1/H2/H3) terdekat di atas tabel atau nama kolom tabel pertama jika format kamus data. Jika tidak ada heading terkait, default nama entitas adalah `Entity_{Index}` (misal: `Entity_1`).
* **BR-DOC-003 (Document Size Threshold):**
  Batas maksimal ukuran dokumen Markdown yang diunggah atau ditempelkan ke editor adalah **5 MB** atau **50.000 baris** untuk menjaga performa rendering di browser.

---

### 2.2. Data Type Inference & Mock Engine Rules
* **BR-GEN-001 (Semantic Type Mapping):**
  Tipe data kolom disimpulkan otomatis menggunakan *fuzzy matching* terhadap nama kolom dan format contoh nilai:
  - `id`, `*_id` $\rightarrow$ CUID / UUID v4.
  - `email`, `mail` $\rightarrow$ Faker Internet Email.
  - `name`, `full_name`, `author` $\rightarrow$ Faker Person Full Name.
  - `created_at`, `updated_at`, `date` $\rightarrow$ ISO 8601 Date String.
  - `phone`, `telp` $\rightarrow$ Phone Number format E.164.
  - `price`, `amount`, `total`, `balance` $\rightarrow$ Numeric (Integer / Float).
  - `is_*`, `has_*`, `status_flag` $\rightarrow$ Boolean (`true`/`false`).
  - *Fallback Rule*: Jika tidak cocok dengan pola semantik apa pun, tipe diset ke `String` (Lorem / Alphanumeric).
* **BR-GEN-002 (Generation Limits):**
  - Default row per entitas: **10 baris**.
  - Minimum row: **1 baris**.
  - Maksimum row: **100 baris** (MVP browser execution) / **1.000 baris** (V1 Backend Stream).
* **BR-GEN-003 (Relational Integrity / Foreign Keys):**
  Jika kolom child mereferensikan parent (misal `user_id` di entitas `Order`), engine wajib mengeksekusi *topological sort* untuk memastikan entitas parent di-generate lebih dulu, dan nilai child `user_id` mengambil sampel acak dari himpunan ID parent yang valid.

---

### 2.3. Exporter & Script Generation Rules
* **BR-EXP-001 (JSON Formatting):**
  Hasil ekspor JSON harus berupa struktur *valid JSON array of objects* dengan identasi 2-spasi atau minified berdasarkan preferensi pengguna.
* **BR-EXP-002 (Prisma Seeder Scripting):**
  Script Prisma seeder (`seed.ts`) yang dihasilkan harus:
  - Menggunakan sintaks TypeScript ES Module.
  - Mengimpor `@prisma/client`.
  - Menggunakan metode batch `prisma.<entity>.createMany({ data: [...] })`.
  - Membungkus eksekusi dalam blok `async main()` dengan penanganan error `catch(e)` dan `prisma.$disconnect()`.

---

### 2.4. Instant Mock Endpoint & API Lifecycle Rules
* **BR-API-001 (Instant Endpoint TTL):**
  Setiap *ephemeral mock endpoint* publik memiliki masa aktif (*Time-to-Live* / TTL) maksimal **24 jam** sejak dibuat.
* **BR-API-002 (Request Throttling & Usage Limit):**
  Setiap endpoint instan dibatasi maksimal **1.000 requests per endpoint** atau kecepatan **60 request per menit per IP address**.
* **BR-API-003 (Status Codes):**
  - `200 OK`: Data mock berhasil dikembalikan.
  - `404 Not Found`: Endpoint ID tidak ditemukan.
  - `410 Gone`: Endpoint telah kedaluwarsa (melebihi TTL 24 jam).
  - `429 Too Many Requests`: Melebihi batas rate limit.
