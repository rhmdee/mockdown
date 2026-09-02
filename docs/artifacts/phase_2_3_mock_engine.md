# Phase 2.3: Mock Engine Implementation Details

## Overview
Modul `mock-engine` menangani pembuatan entitas data (dummy data) yang realistis berdasarkan struktur tabel dan semantik tipe kolom yang diekstrak oleh parser.

## Key Implementations
- **Lokasi Package**: `packages/mock-engine`
- **Library Inti**: Menggunakan `@faker-js/faker` untuk menghasilkan data acak (nama, email, uuid, dsb) berkualitas tinggi tanpa perlu terhubung ke sumber eksternal.

### Implementasi Generator (`generators/index.ts`)
Setiap tipe kolom pada `SchemaColumn` (`semanticType`) akan dipetakan ke dalam metode fungsi `faker` yang tepat.
- Fungsi terpusat pada blok fungsi *switch-case* `generateValueForColumn`.
- Menyediakan isolasi logika jika suatu saat metode pembuatan UUID/String perlu dimodifikasi tanpa mengganggu alur *engine* utama.

### Relational Dependency Resolver (`relational-resolver.ts`)
- Merupakan jantung arsitektur pembuatan data yang konsisten.
- Menggunakan konsep **Topological Sort** (Kahn's Algorithm) untuk menentukan urutan tabel yang harus dimuat datanya terlebih dahulu.
- **Masalah yang Dipecahkan**: Jika tabel `Order` membutuhkan *Foreign Key* `user_id` dari tabel `User`, maka tabel `User` harus di-*generate* pertama, agar ID yang dihasilkan dapat dipakai secara acak saat melakukan *generate* tabel `Order`.
- Dilengkapi pendeteksi *Circular Dependency* (seperti `Tabel A` butuh `Tabel B`, tapi `Tabel B` butuh `Tabel A`). Jika terjadi, *resolver* akan menolak dengan memunculkan error *Circular Dependency detected* atau menerapkan urutan fallback.

### Data Generator Pipeline (`index.ts`)
Modul akan meliterasi array *ordered tables* dari *Topological Sort*, kemudian membuat iterasi `N` baris sesuai dengan batas yang disepakati (misalnya default 10 baris per tabel). 
Output akhirnya adalah sebuah `Record<string, any[]>` atau format JSON statis standar.

## Unit Testing
- Tercover melalui spesifikasi unit *test Bun*. Mencakup pengujian hasil resolver untuk mengurutkan `User` (Parent) sebelum `Post` (Child), serta pengujian bahwa setiap `author_id` di `Post` merupakan `id` aktual dari list entitas `User`.
