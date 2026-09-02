# Phase 2.1: Schema Definition Implementation Details

## Overview
Bagian ini mencakup perancangan struktur kontrak data (Data Contracts) yang digunakan secara bersama (*shared*) di seluruh sistem monorepo (baik di *frontend* maupun *backend*).

## Key Implementations
- **Lokasi Package**: `packages/schema`
- **Tujuan Utama**: Memastikan *type safety* secara *end-to-end* antar package, sehingga perubahan skema data pada *parser* akan otomatis tervalidasi pada *engine* dan *API*.

### Definisi `SemanticType`
Sebuah `enum` dibuat untuk membedakan tipe semantik dari kolom pada tabel yang diparsing. Enum ini membantu `mock-engine` menentukan strategi *generator* data apa yang paling relevan.
- `UUID`: Menghasilkan string acak berbasis UUID (khususnya untuk *Primary Key* dan *Foreign Key*).
- `Email`: Menghasilkan string berformat email valid.
- `FullName`: Menghasilkan string berformat nama lengkap.
- `Date`: Menghasilkan string format ISO 8601.
- `Phone`: Menghasilkan string nomor telepon format internasional.
- `Numeric`: Menghasilkan angka numerik acak.
- `Boolean`: Menghasilkan nilai true/false.
- `String`: Fallback untuk data tipe teks generik.

### DTOs (Data Transfer Objects)
- **`SchemaColumn`**: Menyimpan metadata untuk setiap kolom yang diparsing (nama, tipe asli, `semanticType`, indikator *Primary/Foreign Key*, dsb).
- **`SchemaTable`**: Menyimpan entitas tabel dan agregasi kolomnya.
- **`MockdownSchema`**: Menyimpan keseluruhan dokumen yang berhasil di-parsing menjadi kumpulan `SchemaTable`.
- **`DeployMockPayload` & `DeployMockResponse`**: DTO standar yang akan digunakan untuk integrasi pada *endpoint API*.

## Security & Sensitivities
- Struktur skema hanya berfungsi sebagai kontrak abstraksi tipe. Tidak ada logika *parsing* data asli perusahaan yang disimpan pada *layer* ini.
