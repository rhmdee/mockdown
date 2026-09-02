# Mockdown Deployment Guide

Panduan ini menjelaskan langkah-langkah untuk melakukan build dan deployment aplikasi **Mockdown** (Frontend SPA & Backend API) ke lingkungan produksi.

---

## 1. Arsitektur Deployment

- **Frontend (`apps/web`)**: Single Page Application (SPA) berbasis Svelte 5 + Vite, menghasilkan aset HTML/CSS/JS statis yang di-deploy ke **Vercel**, **Cloudflare Pages**, atau **Netlify**.
- **Backend API (`apps/api`)**: Microservice berbasis ElysiaJS + Bun, dikemas dalam Docker container multi-stage dan di-deploy ke **Fly.io**, **Railway**, atau **Render**.

---

## 2. Deploy Backend API (`apps/api`)

### Opsi A: Deploy via Docker (Railway / Render / VPS)
1. Build container image dari root folder monorepo:
   ```bash
   docker build -t mockdown-api -f apps/api/Dockerfile .
   ```
2. Jalankan container:
   ```bash
   docker run -p 3000:3000 -e PORT=3000 mockdown-api
   ```

### Opsi B: Deploy ke Fly.io
1. Pastikan `flyctl` terpasang dan login (`fly auth login`).
2. Di root folder, jalankan:
   ```bash
   fly launch --dockerfile apps/api/Dockerfile
   ```
3. Set environment variables jika diperlukan:
   ```bash
   fly secrets set PORT=3000
   ```

---

## 3. Deploy Frontend Web App (`apps/web`)

### Opsi A: Deploy ke Vercel
1. Hubungkan repository GitHub ke dashboard Vercel.
2. Atur konfigurasi project:
   - **Root Directory**: `apps/web` (atau pilih root dengan build command monorepo)
   - **Build Command**: `bun run build`
   - **Output Directory**: `dist`
   - **Environment Variable**: `VITE_API_URL=https://your-mockdown-api.fly.dev`
3. Konfigurasi rewrite SPA otomatis ditangani oleh `apps/web/vercel.json`.

### Opsi B: Deploy ke Cloudflare Pages
1. Buat project baru di Cloudflare Pages yang terhubung ke repository.
2. Konfigurasi build:
   - **Build command**: `bun run --filter web build`
   - **Build output directory**: `apps/web/dist`
   - **Environment variables**: `VITE_API_URL=https://your-mockdown-api.fly.dev`

---

## 4. Quality Gate & Production Build Verification

Sebelum melakukan rilis, jalankan seluruh pipeline verifikasi di root folder:
```bash
# 1. Jalankan pemeriksaan tipe data
bun run check-types

# 2. Jalankan unit test dan end-to-end integration test
bun run test

# 3. Jalankan build produksi
bun run build
```
Semua task harus selesai dengan status **SUCCESS**.
