# Mock Data Generator

### Konsep Inti Produk

- **Masalah Utama:** Adanya _bottleneck_ operasional antara penyusunan dokumen _requirement_ (PRD, TSD, BRD) dan kesiapan data untuk tahap desain serta _development_.
- **Solusi MVP:** Pembuat data tiruan otomatis yang mengekstrak variabel dan struktur relasional dari dokumen spesifikasi, menghasilkan data yang akurat dengan konteks produk.

### Analisis Kompetitor

- **Alternatif Saat Ini:** Pengembang sering mengandalkan _copy-paste prompt_ ke LLM (ChatGPT/Claude), menggunakan generator manual seperti Mockaroo, atau solusi _enterprise_ berat seperti Tonic.ai.
- **Nilai Jual Unik:** Otomatisasi alur kerja yang spesifik untuk _developer_ dan desainer, memberikan data yang terstruktur dan siap pakai tanpa perlu menyusun form manual.

### Spesifikasi Teknis MVP

- **Format Input:** Markdown. Dipilih karena ringan, terstruktur secara hierarkis (_heading_, tabel, _list_), mudah diproses (_parsing_) oleh mesin, dan didukung penuh oleh _tools_ seperti Notion, Jira, atau Obsidian.
- **Mesin Pemrosesan:** Menggunakan _parser_ AST (Abstract Syntax Tree) berbasis TypeScript untuk menerjemahkan struktur tabel Markdown menjadi objek entitas.
- **Format Output:** Menghasilkan JSON statis, ekstensi _script seeder_ untuk Prisma ORM, atau _endpoint_ REST/GraphQL instan yang dilayani oleh backend _service_ (ElysiaJS di atas Bun runtime).

### Strategi UI/UX & Eksekusi

- **Tata Letak:** Menggunakan antarmuka _split-screen_ fungsional; sisi kiri untuk menempelkan _raw_ Markdown (CodeMirror 6), dan sisi kanan untuk pratinjau data secara _real-time_.
- **Arah Visual:** Mengadopsi prinsip desain _Soft Rounded System (No Sharp Corners)_, bergaya _clean_, minimalis, fungsional dan profesional dengan tema gelap _high-contrast_.
- **Arsitektur Teknis:** Monorepo berbasis **Bun Workspaces + Turborepo**, memisahkan `apps/web` (Svelte 5 + Vite SPA) dan `apps/api` (ElysiaJS on Bun).
- **Alokasi Tenaga:** Lingkup fitur MVP ini sangat ramping, sehingga pengembangan sisi _interface_, _logic_, dan integrasi dapat diselesaikan secara paralel dan efisien oleh tim beranggotakan 3 orang.
