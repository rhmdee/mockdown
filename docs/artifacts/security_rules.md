# Security Rules & Compliance: Mock Data Generator

## 1. Overview
Dokumen ini mendefinisikan postur keamanan (*security posture*), kontrol proteksi data, isolasi proses eksekusi, serta kepatuhan privasi untuk Mock Data Generator.

---

## 2. Security Controls Matrix

| Domain Keamanan | Potensi Ancaman | Kebijakan & Kontrol Pencegahan | Tingkat Risiko |
| :--- | :--- | :--- | :--- |
| **Input Sanitization** | Cross-Site Scripting (XSS) & HTML Injection | - Markdown di-parse murni menjadi objek AST sintaksis; tidak pernah di-*render* langsung via `dangerouslySetInnerHTML`.<br>- Karakter HTML khusus (`<`, `>`, `&`, `"`) di-*escape* secara otomatis pada komponen Preview. | High |
| **Regex Safety** | Regular Expression Denial of Service (ReDoS) | - Pola parser AST divalidasi dengan panjang karakter terbatas.<br>- Parser dilarang menggunakan *nested quantifiers* berbahaya (misal `(a+)+$`). | High |
| **Compute Sandboxing** | UI Thread Freezing & Crash | - Parsing AST dan komputasi Faker.js diisolasi penuh di dalam **Web Worker**.<br>- Web Worker dibatasi alokasi memorinya dan otomatis di-*terminate* jika eksekusi melebihi batas waktu 5 detik. | Medium |
| **Data Privacy (PII)** | Kebocoran Data Pribadi Sensitif | - Engine generator hanya menggunakan kamus data sintetik acak (`@faker-js/faker`).<br>- Dilarang menyimpan teks mentah Markdown pengguna ke server/database pada mode MVP (Client-Only Ephemeral Mode). | High |
| **API Throttling & DoS** | Abuse & Denial of Service pada Mock Endpoint | - Implementasi algoritma *Token Bucket / Sliding Window Rate Limiting*:<br>&nbsp;&nbsp;• Maksimal **60 req/menit** per IP.<br>&nbsp;&nbsp;• Maksimal **1.000 total hits** per endpoint.<br>- Kuota payload POST dibatasi maksimal **1 MB**. | Critical |
| **Endpoint Sandboxing** | Data Persistence Hijack | - Endpoint instan memiliki masa aktif tegas (*TTL*) maksimal **24 jam**.<br>- Setelah 24 jam, data pada cache KV otomatis di-*purge* secara permanen. | Medium |
| **CORS Policy** | Unauthorized Cross-Origin Exploitation | - Domain utama aplikasi membatasi CORS hanya untuk origin internal.<br>- Route khusus `/api/mock/*` mengizinkan `Access-Control-Allow-Origin: *` dengan pembatasan method (`GET, POST, OPTIONS`) agar frontend lokal developer dapat mengakses data mock. | Low |

---

## 3. Hardened Security Headers

Aplikasi web menyertakan header keamanan HTTP ketat pada setiap respons server:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.mockdown.dev;
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

## 4. Ephemeral Storage Compliance
Pada tahap MVP:
1. Tidak ada data pribadi (PII), kredensial, atau teks Markdown PRD yang disimpan ke disk penyimpanan persisten (database).
2. Snapshot payload mock pada endpoint instan hanya disimpan di memori volatile / KV store ber-TTL yang terenkripsi saat *at-rest* dan *in-transit* (TLS 1.3).
