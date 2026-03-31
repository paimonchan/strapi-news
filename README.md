# PMC News - Strapi v5

Headless CMS untuk mengelola dan menyajikan berita. Dibangun dengan Strapi v5 + TypeScript.

## Quick Start (Tanpa Docker)

```bash
npm install
npm run develop
```

Akses admin panel di `http://localhost:1337/admin`.

## Docker

### Arsitektur

```
Caddy (reverse proxy, HTTPS)
  ├── Strapi  (port 1337)
  ├── NextJS  (port 3000)
  └── PostgreSQL (port 5432)
```

### Prerequisites

- Docker & Docker Compose
- File `.env` di root project (copy dari `.env.example`)

### Setup Pertama Kali

```bash
# Copy dan isi environment variables
cp .env.example .env

# Build dan jalankan semua service
docker-compose build
docker-compose up -d

# Cek status
docker-compose ps

# Lihat logs
docker-compose logs -f
```

### Menjalankan Semua Service

```bash
# Start semua (Caddy + Strapi + NextJS + PostgreSQL)
docker-compose up -d

# Stop semua
docker-compose down

# Restart semua
docker-compose restart
```

### Menjalankan Service Tertentu

```bash
# Strapi saja (+ PostgreSQL karena dependency)
docker-compose up -d strapi

# NextJS saja
docker-compose up -d nextjs

# PostgreSQL saja
docker-compose up -d postgres

# Caddy saja
docker-compose up -d caddy
```

### Rebuild Service

```bash
# Rebuild satu service (setelah ubah code/Dockerfile)
docker-compose build strapi
docker-compose up -d strapi

# Rebuild tanpa cache (jika ada masalah)
docker-compose build --no-cache strapi

# Rebuild dan langsung jalankan
docker-compose up -d --build strapi
```

### Logs

```bash
# Semua logs
docker-compose logs -f

# Log service tertentu
docker-compose logs -f strapi
docker-compose logs -f nextjs
docker-compose logs -f caddy
docker-compose logs -f postgres

# Log 50 baris terakhir
docker-compose logs strapi | tail -50
```

### Restart / Stop Service Tertentu

```bash
# Restart satu service
docker-compose restart strapi

# Stop satu service (tanpa hapus container)
docker-compose stop strapi

# Stop dan hapus container
docker-compose rm -sf strapi
```

### Masuk ke Container

```bash
# Shell ke dalam container Strapi
docker-compose exec strapi sh

# Jalankan command di dalam container
docker-compose exec strapi ls -la /app/dist/build
docker-compose exec postgres psql -U strapi -d ${DATABASE_NAME}
```

### Local vs Production

#### Lokal

Di lokal, `docker-compose.override.yml` otomatis di-load untuk expose port langsung:

- Strapi: `http://localhost:1337`
- NextJS: `http://localhost:3000`

File override ini tidak di-commit ke git.

#### Production

Di production (tanpa override), semua service hanya bisa diakses via Caddy (HTTPS):

- Strapi: `https://<STRAPI_DOMAIN>`
- NextJS: `https://<NEXTJS_DOMAIN>`

Domain dikonfigurasi di `.env`:
```env
STRAPI_DOMAIN=adm.example.com
NEXTJS_DOMAIN=news.example.com
```

### Troubleshooting Docker

#### Container tidak bisa start
```bash
# Cek logs untuk error
docker-compose logs strapi

# Rebuild dari awal
docker-compose build --no-cache strapi
docker-compose rm -sf strapi
docker-compose up -d strapi
```

#### NextJS error "Strapi Backend Unavailable"
```bash
# Biasanya DNS internal Docker belum ready, restart bareng
docker-compose restart strapi nextjs
```

#### Database connection error
```bash
# Pastikan PostgreSQL sudah healthy
docker-compose ps postgres

# Restart PostgreSQL lalu Strapi
docker-compose restart postgres
docker-compose restart strapi
```

#### Port sudah dipakai
```bash
# Cek port yang dipakai
# Linux/Mac:
lsof -i :1337
# Windows:
netstat -ano | findstr :1337

# Stop service yang pakai port tersebut, atau ubah port di docker-compose.override.yml
```

#### Error `ContainerConfig` (docker-compose v1)
```bash
# Hapus container lama dulu
docker-compose rm -sf strapi
docker-compose up -d strapi
```

## News Fetcher

Lihat dokumentasi lengkap di:
- `scripts/news-fetcher/OPERATIONAL_FLOW.md` — Panduan operasional harian
- `scripts/news-fetcher/MAINTENANCE_GUIDE.md` — Panduan maintenance
- `scripts/news-fetcher/README.md` — Dokumentasi teknis
