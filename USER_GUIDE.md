# Buku Panduan Pengguna Mockdown (User Guide)

Selamat datang di panduan pengguna Mockdown. Dokumen ini akan memandu Anda melalui alur kerja pembuatan tabel, penggunaan Table Builder, pengelolaan tipe data, dan bagaimana mengubah spesifikasi Markdown menjadi Mock API secara instan.

## 1. Pendahuluan

Mockdown adalah perangkat yang memungkinkan Anda mendesain skema database dan API menggunakan format Markdown, serta menyediakan antarmuka visual yang cepat untuk merancang tabel (Table Builder) tanpa mengorbankan kecepatan mengetik.

## 2. Mengenal Antarmuka Utama

- **Editor Utama**: Di sini Anda dapat menulis atau memodifikasi tabel menggunakan Markdown.
- **Preview Panel**: Menampilkan hasil visual dari Markdown Anda dan menyediakan akses cepat untuk *Generate Mock*.
- **Toolbar**: Berisi tombol-tombol aksi, termasuk tombol **Table Builder** yang digunakan untuk membuka fitur perancangan tabel visual.

## 3. Fitur Table Builder

Table Builder adalah fitur antarmuka visual bergaya *Sheet* (panel yang muncul di sebelah kiri layar) yang dirancang untuk mempercepat pembuatan struktur tabel.

### 3.1. Membuka Table Builder
1. Pada halaman Editor, temukan tombol **Table Builder** pada bagian toolbar atas.
2. Klik tombol tersebut untuk memunculkan panel *Sheet* di sebelah kiri.

### 3.2. Menggunakan Preset Cepat (Quick Presets)
Mockdown dilengkapi dengan beberapa Preset Tabel untuk mempercepat perancangan.
- Saat panel terbuka, Anda akan melihat **3 Preset Acak (Random)** (misalnya: *Users*, *Products*, *Orders*) dan **1 Preset Custom**.
- Klik salah satu preset untuk langsung memuat kolom-kolom standar untuk tabel tersebut.
- Preset yang sedang aktif akan di-highlight (diberikan batas dan cahaya khusus).
- Memilih preset **Custom** akan memberikan Anda kanvas kosong untuk membuat tabel dari awal.

### 3.3. Menentukan Tipe Data Database
Saat Anda menambahkan atau mengubah kolom pada Table Builder, Anda dapat memilih tipe data. Tipe data yang didukung disesuaikan dengan standar SQL/RDBMS seperti:
- `UUID` (Primary key default)
- `VARCHAR`, `TEXT`
- `INTEGER`, `BIGINT`, `DECIMAL`
- `BOOLEAN`
- `TIMESTAMP`, `DATE`
- `JSON`, `ENUM`

### 3.4. Menyisipkan ke Editor
Setelah Anda puas dengan desain tabel di Table Builder:
1. Masukkan nama tabel (misalnya `users`).
2. Klik tombol **Insert Table**.
3. Tabel tersebut akan secara otomatis diubah menjadi format Markdown dan disisipkan pada Editor Anda.

## 4. Alur Kerja: Dari Markdown ke Mock API

Alur kerja utama dalam Mockdown terdiri dari tiga tahap sederhana:

**Tahap 1: Merancang Tabel (Markdown / Table Builder)**
- Gunakan Table Builder untuk menyisipkan tabel ke Editor dengan cepat, ATAU ketik format tabel Markdown secara manual.
- Anda dapat mengkombinasikan berbagai tabel dan mengatur relasi sederhana jika diperlukan.

**Tahap 2: Preview dan Validasi**
- Panel pratinjau di sebelah kanan akan memperbarui tampilan berdasarkan Markdown Anda.
- Pastikan semua kolom dan tipe data telah sesuai.

**Tahap 3: Generate Mock API**
- Di bagian atas panel *Preview* sebelah kanan, klik tombol **Generate Mock**.
- Sistem (Mock Engine dan Prisma Generator) akan secara otomatis memproses skema Anda.
- Mockdown akan mengisi database simulasi dengan data dummy yang realistis (menggunakan Faker.js).
- Anda sekarang siap menggunakan *Mock API* yang ter-generate!

## 5. Tips Tambahan

- **Eksplorasi Preset:** Selalu periksa preset jika Anda ingin membuat tabel standar. Ini akan menghemat banyak waktu.
- **Tipe Data:** Menggunakan tipe data spesifik seperti `TIMESTAMP` dan `UUID` akan memberikan format data dummy yang lebih akurat dan terstruktur pada hasil API.
- **Modifikasi Langsung:** Anda selalu bebas mengedit hasil *Insert Table* langsung di Editor teks untuk penyesuaian khusus.
