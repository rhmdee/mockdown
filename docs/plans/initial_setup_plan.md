# Initial Project Setup Plan: Mockdown

## 1. Overview
Dokumen ini berisi panduan langkah demi langkah untuk menginisiasi project **Mockdown**. Proyek ini menggunakan arsitektur **Monorepo** berbasis **Bun** dan **Turborepo**. 

Panduan ini dirancang agar mudah diikuti oleh junior programmer atau AI model. Pastikan Anda menjalankan perintah-perintah ini di terminal pada root folder proyek (`/home/rhmdee/projects/mockdown`).

---

## 2. Prerequisites
Pastikan tools berikut sudah terinstall di sistem Anda:
1. **Bun (v1.1+)**: Runtime utama untuk instalasi, eksekusi, dan testing.
   - Cek versi: `bun -v`
2. **Git**: Untuk version control.

---

## 3. Langkah 1: Inisialisasi Root Workspace
Langkah pertama adalah membuat konfigurasi untuk monorepo root.

1. **Buat file `package.json` di root folder:**
   Buat file `package.json` dengan konten berikut untuk mendefinisikan workspace dan script Turborepo.

   ```json
   {
     "name": "mockdown",
     "private": true,
     "workspaces": [
       "apps/*",
       "packages/*"
     ],
     "scripts": {
       "dev": "turbo run dev --parallel",
       "build": "turbo run build",
       "test": "turbo run test",
       "lint": "turbo run lint",
       "check-types": "turbo run check-types"
     },
     "devDependencies": {
       "turbo": "^2.0.0"
     }
   }
   ```

2. **Buat file `turbo.json` di root folder:**
   File ini mengatur pipeline untuk turborepo.

   ```json
   {
     "$schema": "https://turbo.build/schema.json",
     "pipeline": {
       "build": {
         "dependsOn": ["^build"],
         "outputs": ["dist/**"]
       },
       "test": {
         "dependsOn": ["^build"],
         "inputs": ["src/**/*.ts", "tests/**/*.ts"]
       },
       "lint": {},
       "check-types": {},
       "dev": {
         "cache": false,
         "persistent": true
       }
     }
   }
   ```

3. **Install dependencies root:**
   Jalankan perintah: `bun install`

---

## 4. Langkah 2: Setup Struktur Direktori
Buat folder-folder utama yang dibutuhkan sesuai dengan `project_structure.md`.

Jalankan perintah bash berikut:
```bash
mkdir -p apps/web apps/api
mkdir -p packages/parser-core/src packages/parser-core/tests
mkdir -p packages/mock-engine/src/generators packages/mock-engine/tests
mkdir -p packages/prisma-generator/src
mkdir -p packages/schema/src
mkdir -p packages/tsconfig
mkdir -p packages/eslint-config
```

---

## 5. Langkah 3: Inisialisasi Shared Packages
Setup file dasar untuk setiap package.

### 5.1. TSConfig & ESLint
1. **`packages/tsconfig/package.json`**:
   ```json
   {
     "name": "@mockdown/tsconfig",
     "version": "1.0.0",
     "private": true
   }
   ```
2. **`packages/tsconfig/base.json`**:
   ```json
   {
     "compilerOptions": {
       "target": "ESNext",
       "module": "ESNext",
       "moduleResolution": "bundler",
       "strict": true,
       "skipLibCheck": true,
       "esModuleInterop": true,
       "forceConsistentCasingInFileNames": true
     }
   }
   ```

3. **`packages/eslint-config/package.json`**:
   ```json
   {
     "name": "@mockdown/eslint-config",
     "version": "1.0.0",
     "private": true
   }
   ```

### 5.2. Core Logic Packages
Untuk `parser-core`, `mock-engine`, `prisma-generator`, dan `schema`, buat file `package.json` dasar dengan penamaan scope `@mockdown/<nama-package>`.

Contoh untuk `packages/schema/package.json`:
```json
{
  "name": "@mockdown/schema",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "scripts": {
    "check-types": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@mockdown/tsconfig": "workspace:*"
  }
}
```
Ulangi pola di atas untuk package lain dengan menyesuaikan field `"name"`.

---

## 6. Langkah 4: Inisialisasi Backend API (`apps/api`)
Backend dibangun menggunakan ElysiaJS di atas Bun.

1. **Masuk ke folder api**: `cd apps/api`
2. **Inisialisasi project bun**: `bun init -y`
3. **Ubah `package.json`** agar package bernama `api` dan tambahkan dependensi Elysia.
4. **Install dependensi**:
   ```bash
   bun add elysia
   bun add -d @types/bun typescript @mockdown/tsconfig
   ```
5. **Setup `tsconfig.json`** untuk mengekstend `@mockdown/tsconfig/base.json`.

---

## 7. Langkah 5: Inisialisasi Frontend SPA (`apps/web`)
Frontend menggunakan Svelte 5 dan Vite. Karena Svelte 5 masih baru, kita akan menginisiasi Vite template standar lalu menyesuaikan.

1. **Dari root folder**, jalankan inisialisasi vite:
   ```bash
   bun create vite apps/web --template svelte-ts
   ```
   *(Jika folder web sudah terbuat dan kosong, Anda mungkin perlu menjalankannya di folder temporary lalu memindahkan isinya ke `apps/web`)*
   
2. **Ubah konfigurasi package.json** di `apps/web` untuk menggunakan nama aplikasi `web` (jika belum).
3. **Install Tailwind CSS**:
   Ikuti panduan resmi instalasi Tailwind untuk Vite.
   ```bash
   cd apps/web
   bun add -D tailwindcss postcss autoprefixer
   bunx tailwindcss init -p
   ```
4. **Install dependensi internal** (seperti `@mockdown/schema`, dll) dengan cara menambahkan dependensi dengan versi `workspace:*` di `package.json` lalu jalankan `bun install` di root.

---

## 8. Langkah 6: Verifikasi Workspace
Setelah semuanya disetup, kembalilah ke root folder (`/home/rhmdee/projects/mockdown`).

1. **Jalankan installasi seluruh dependensi:**
   ```bash
   bun install
   ```
2. **Uji coba script Turborepo:**
   ```bash
   bun run check-types
   bun run lint
   ```
   
Jika perintah di atas berjalan tanpa error (atau hanya menampilkan warning karena tidak ada kode yang dicek), maka struktur dasar monorepo sudah berhasil di-setup dan siap untuk implementasi fitur lebih lanjut.
