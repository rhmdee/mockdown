# Phase 2.2: Parser Core Implementation Details

## Overview
Bagian ini mendokumentasikan mesin (*engine*) abstraksi yang bertanggung jawab menerima input teks mentah Markdown dan mengonversinya ke dalam *Abstract Syntax Tree* (AST) terstruktur untuk mengekstrak spesifikasi tabel.

## Key Implementations
- **Lokasi Package**: `packages/parser-core`
- **Library Inti**: Menggunakan ekosistem `unified.js`, khususnya `remark-parse` (untuk mem-parsing Markdown ke AST) dan `remark-gfm` (untuk mendukung sintaks tabel *GitHub Flavored Markdown*).

### Alur Eksekusi Parser (`table-parser.ts`)
1. **Inisiasi AST**: Teks mentah diparsing menjadi format *tree* `mdast`.
2. **Ekstraksi Tabel**: Parser memindai iterasi *node* dan mencari elemen dengan tipe `table` dan `heading`.
3. **Pencocokan Entitas**: Setiap tabel akan diikat dengan teks H1/H2 (`heading`) yang mendahuluinya sebagai nama `Entity` (contoh: `# User Entity`). Jika tidak ada *heading*, fallback ke penamaan generik seperti `Entity_1`.
4. **Pembacaan Kolom**: Ekstraksi dilakukan baris per baris. Header kolom dianalisis untuk memastikan urutan field (umumnya Kolom 1 = Nama Field, Kolom 2 = Tipe Data).
5. **Konversi ke Skema**: Dikonstruksi kembali menjadi representasi tipe data internal `MockdownSchema`.

### Inferensi Semantik (`schema-inferrer.ts`)
Setiap kali field baru terdeteksi, atribut namanya diproses (dibersihkan dari karakter spesial, dikonversi ke *lowercase*) lalu dievaluasi:
- Mencocokkan *substrings* seperti `id`, `name`, `email`, `phone`, `date` dsb, untuk dikaitkan dengan `SemanticType` yang ada pada `packages/schema`.
- Proses ini merupakan *fuzzy matcher* sederhana namun esensial agar output data lebih relevan tanpa mengharuskan penulisan yang spesifik dari pengguna.

## Unit Testing
- Tercover penuh melalui *Bun Test Runner*. Skenario yang diuji termasuk *empty strings*, serta format tabel PRD yang standar, mengonfirmasi ekstraksi nama tabel, field name, dan inferensi semantik sukses dilakukan.
