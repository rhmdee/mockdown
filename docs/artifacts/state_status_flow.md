# State & Status Flow: Mock Data Generator

## 1. Overview
Dokumen ini mendokumentasikan mesin keadaan (*finite state machine*) untuk dua modul utama pada sistem Mock Data Generator:
1. **Siklus Pemrosesan Editor & AST Parser (Client-Side State)**
2. **Siklus Hidup Endpoint Mock Instan (Server/Edge State)**

---

## 2. Editor & AST Parser State Machine

```mermaid
stateDiagram-v2
    [*] --> IDLE: Aplikasi Dimuat

    IDLE --> TYPING: User Mengetik / Menempelkan Markdown
    TYPING --> DEBOUNCING: Input Berlangsung
    DEBOUNCING --> PARSING: Debounce 300ms Terlewati
    
    state PARSING {
        [*] --> AST_TOKENIZING: Tokenisasi Markdown
        AST_TOKENIZING --> TABLE_DISCOVERY: Memeriksa Keberadaan Tabel
        TABLE_DISCOVERY --> SCHEMA_EXTRACT: Normalisasi Kolom & Tipe Data
    }

    PARSING --> PARSE_ERROR: Format Tabel Tidak Valid / Rusak
    PARSE_ERROR --> TYPING: User Mengubah Input

    PARSING --> GENERATING: Schema Entitas Valid
    
    state GENERATING {
        [*] --> RESOLVE_RELATIONS: Topological Sort (Foreign Keys)
        RESOLVE_RELATIONS --> EXECUTE_FAKER: Generasi Data Dummy
        EXECUTE_FAKER --> FORMAT_OUTPUT: Format ke JSON & Prisma AST
    }

    GENERATING --> GENERATION_ERROR: Circular Dependency / Unknown Generator
    GENERATION_ERROR --> TYPING: User Memperbaiki Relasi

    GENERATING --> READY: Data Siap di-Render
    READY --> TYPING: User Mengubah Input Markdown
    READY --> EXPORTING: User Menekan Tombol Export
    
    EXPORTING --> READY: Proses Copy/Download Selesai
```

### Tabel Transisi State Editor

| State Awal | Event / Trigger | State Tujuan | Aksi / Efek Samping |
| :--- | :--- | :--- | :--- |
| `IDLE` | User menginput teks | `TYPING` | Menampilkan indikator input aktif |
| `TYPING` | Jeda ketik 300ms | `PARSING` | Mengirim payload ke Web Worker AST |
| `PARSING` | Syntax table invalid | `PARSE_ERROR` | Tampilkan inline lint warning di editor |
| `PARSING` | Syntax valid | `GENERATING` | Ekstrak tipe kolom dan jalankan Faker engine |
| `GENERATING` | Data siap | `READY` | Render tabel interaktif dan JSON tree preview |
| `READY` | Klik "Export JSON" | `EXPORTING` | Salin teks ke navigator clipboard |

---

## 3. Instant Mock Endpoint Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PROVISIONING: User Memilih "Deploy Mock API"
    PROVISIONING --> ACTIVE: Snapshot Data Tersimpan di Edge Cache / Redis
    
    ACTIVE --> ACTIVE: Menerima Request HTTP GET/POST Valid
    ACTIVE --> RATE_LIMITED: Request > 60 req/menit
    RATE_LIMITED --> ACTIVE: Window Rate Limit Reset (1 menit)
    
    ACTIVE --> EXPIRED: TTL 24 Jam Berakhir
    ACTIVE --> HIT_LIMIT_REACHED: Request Mencapai 1.000 hits
    ACTIVE --> REVOKED: Dihapus Manual oleh Pembuat
    
    HIT_LIMIT_REACHED --> [*]
    EXPIRED --> [*]
    REVOKED --> [*]
```

### Tabel Transisi State Mock Endpoint

| State Awal | Trigger | State Akhir | HTTP Response Code |
| :--- | :--- | :--- | :--- |
| `PROVISIONING` | Payload valid disimpan ke KV | `ACTIVE` | `201 Created` |
| `ACTIVE` | Request masuk (normal) | `ACTIVE` | `200 OK` (dengan Header `X-Mock-TTL`) |
| `ACTIVE` | Melebihi kuota 60 req/menit | `RATE_LIMITED` | `429 Too Many Requests` |
| `ACTIVE` | Waktu > 24 jam sejak deploy | `EXPIRED` | `410 Gone` |
| `ACTIVE` | Total request = 1.000 | `HIT_LIMIT_REACHED` | `410 Gone` |
| `ACTIVE` | User menghapus endpoint | `REVOKED` | `404 Not Found` |
