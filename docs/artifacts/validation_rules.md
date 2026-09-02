# Validation Rules: Mock Data Generator

## 1. Overview
Dokumen ini mendefinisikan seluruh aturan validasi sistem di setiap layer aplikasi, meliputi validasi input antarmuka (*Client UI*), parser AST Markdown, skema relasional, dan penanganan permintaan API instan (*Mock API Route*).

---

## 2. Validation Matrix

| Layer | Target Objek | Aturan Validasi | Error Code | Severity | Pesan Error / Respon |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Client UI** | Text Input Payload | Ukuran payload teks Markdown $\le$ **5 MB**. | `ERR_PAYLOAD_TOO_LARGE` | High | *"Ukuran dokumen melebihi batas 5MB. Silakan kurangi isi dokumen."* |
| **Client UI** | Row Configuration | Nilai `rowCount` harus bilangan bulat $1 \le N \le 100$. | `ERR_INVALID_ROW_LIMIT` | Medium | Fallback otomatis ke default `10`. |
| **AST Parser** | Table Syntax | Minimal memiliki 1 baris header dan baris pemisah `\|---|`. | `ERR_INVALID_TABLE_SYNTAX` | High | *"Tabel Markdown tidak valid atau tidak memiliki baris pemisah header."* |
| **AST Parser** | Column Consistency | Jumlah sel pada setiap baris data harus sama dengan jumlah kolom header. | `ERR_COLUMN_MISMATCH` | Low | Auto-pad cell kosong dengan nilai `null`. |
| **Schema Infer** | Entity/Field Identifier | Nama entitas & kolom harus memenuhi pola `^[a-zA-Z_][a-zA-Z0-9_]*$`. | `ERR_ILLEGAL_IDENTIFIER` | Medium | Sanitasi otomatis (mengganti spasi & tanda baca menjadi `_`). |
| **Relational** | Circular Foreign Keys | Tidak boleh ada dependensi relasional melingkar tanpa nullable (contoh: A require B, B require A). | `ERR_CIRCULAR_DEPENDENCY` | High | *"Terdeteksi dependensi sirkular antar entitas. Foreign key diubah menjadi nullable."* |
| **Mock API** | HTTP Method | Route endpoint instan hanya menerima method `GET` (fetch data) dan `POST` (append simulated item). | `ERR_METHOD_NOT_ALLOWED` | Medium | HTTP `405 Method Not Allowed`. |
| **Mock API** | Content-Type Header | Request `POST` wajib menyertakan `Content-Type: application/json`. | `ERR_INVALID_CONTENT_TYPE` | Low | HTTP `415 Unsupported Media Type`. |
| **Mock API** | Rate Limit | Maksimal 60 request per IP per menit. | `ERR_RATE_LIMIT_EXCEEDED` | Medium | HTTP `429 Too Many Requests`. |
| **Mock API** | Endpoint Expiry | Usia endpoint $\le 24$ jam atau total pemanggilan $\le 1.000$ hits. | `ERR_ENDPOINT_EXPIRED` | Medium | HTTP `410 Gone`. |

---

## 3. Schema Validator Implementation (Zod Example)

Untuk memastikan konsistensi tipe data di seluruh paket monorepo (`@mockdown/schema`), validasi data runtime menggunakan Zod:

```typescript
import { z } from 'zod';

export const EntityFieldSchema = z.object({
  name: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
    message: "Field name must be a valid alphanumeric identifier"
  }),
  fieldType: z.enum([
    'STRING',
    'NUMBER',
    'BOOLEAN',
    'DATE',
    'UUID',
    'EMAIL',
    'RELATION',
    'CUSTOM_ENUM'
  ]),
  generatorRule: z.string().optional(),
  isNullable: z.boolean().default(false),
  isForeignKey: z.boolean().default(false),
  referencedEntityId: z.string().optional()
});

export const ParsedEntitySchema = z.object({
  name: z.string().min(1),
  rowCount: z.number().int().min(1).max(100).default(10),
  fields: z.array(EntityFieldSchema).min(1, {
    message: "Entity must have at least one column"
  })
});

export const MockDeploymentPayloadSchema = z.object({
  entities: z.array(ParsedEntitySchema).min(1),
  ttlHours: z.number().max(24).default(24)
});
```
