# Phase 2.4: Prisma Generator Implementation Details

## Overview
Modul `prisma-generator` adalah utilitas *exporter* yang bertanggung jawab untuk mengambil representasi objek memori dari Mock Engine dan mengonversinya menjadi teks *source code* berbasis TypeScript.

## Key Implementations
- **Lokasi Package**: `packages/prisma-generator`
- **Output Utama**: Sebuah script executable `seed.ts` (Prisma Database Seeder).

### Prisma Script Builder (`index.ts`)
1. **Penyusunan Boilerplate**: Modul mencetak sintaks *import* standar (`import { PrismaClient } from '@prisma/client'`) dan inisiasi objek `const prisma = new PrismaClient()`.
2. **Batch Insertion Method**: Proses *seeding* diimplementasikan menggunakan `prisma.<Entity>.createMany()`. Penggunaan *batch insert* `createMany` ini menjamin eksekusi *database* berjalan dengan optimal walau data tiruan mencapai ratusan baris.
3. **Konversi Tipe Data**: Transformasi data *JavaScript array/object* ke *string literals* untuk blok konfigurasi `data: [...]` dilakukan melalui teknik *pretty-printing* JSON konvensional (`JSON.stringify` dengan padding), kemudian digabung (join) dengan indentasi selaras standar format *seeder*.
4. **Lifecycle Hooks**: Skrip secara otomatis ditambahkan mekanisme pelepasan koneksi (*disconnect*) `prisma.$disconnect()` pada blok `finally`, serta error handling yang aman di blok `catch`.

## Unit Testing
- Test dilakukan dengan mengevaluasi keluaran *string*. Menguji eksistensi kata kunci wajib dan keabsahan format sintaks blok `createMany()` terhadap representasi string di lingkungan yang ditargetkan.
