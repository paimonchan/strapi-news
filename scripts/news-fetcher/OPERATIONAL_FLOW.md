# News Fetcher Operational Flow

Panduan langkah-langkah untuk siklus operasional harian: menarik, meringkas, dan memasukkan berita ke Strapi.

## Data Flow

```
RSS/Scrape --> raw_content (teks mentah dari sumber)
AI Summary --> content (ringkasan berbobot untuk ditampilkan ke user)
```

- `raw_content`: Field untuk menyimpan teks asli/mentah hasil fetch atau scrape. Tidak ditampilkan ke end-user.
- `content`: Field untuk menyimpan ringkasan yang sudah diproses AI. Ini yang ditampilkan ke end-user.

## Sumber & Kategori

17 RSS sources across 11 categories:

| Category | Sources |
|----------|---------|
| Technology | TechCrunch, BBC News, CNN |
| Business | CNBC |
| Sports | ESPN |
| Entertainment | Variety |
| Health | NPR Health |
| Science | Science Daily |
| World | BBC World, CNN World |
| Politics | Al Jazeera |
| Education | NPR Education, The Hechinger Report |
| Environment | Carbon Brief, Climate Home News |
| Finance | CoinDesk, Financial Times |

Default: **10 artikel per source** (~170 artikel per fetch).

## Environment

Semua script mendukung `NODE_ENV` untuk switch antara lokal dan production.

```bash
# Lokal (default)
node scripts/news-fetcher/scripts/fetch-news.js

# Production
NODE_ENV=production node scripts/news-fetcher/scripts/fetch-news.js
```

Token dan URL tersimpan di `.env` root project:
- `STRAPI_API_TOKEN` — untuk lokal
- `STRAPI_API_TOKEN_PRODUCTION` — untuk production
- `STRAPI_URL_PRODUCTION` — URL production (https://adm.paimonchan.com)

Script otomatis memilih token dan URL berdasarkan `NODE_ENV`.

## 1. Persiapan: Bersihkan Data Hari Ini

Pastikan tidak ada duplikasi data sebelum penarikan baru.

```bash
# Lokal
npm run delete-today

# Production
NODE_ENV=production npm run delete-today
```

## 2. Penarikan Data (Fetch & Scrape)

Menarik data mentah (Full-Text) ke Strapi. Data disimpan di field `raw_content`.

### A. Dari RSS Feed — Semua Sumber (Rekomendasi)

```bash
# Lokal: tarik 10 berita per source (default)
npm run fetch-news -- --limit=10

# Production
NODE_ENV=production npm run fetch-news -- --limit=10
```

### B. Dari RSS Feed — Sumber Tertentu

```bash
# Contoh: Tarik 5 berita dari BBC World dan Al Jazeera
npm run fetch-news -- --sources=bbc-world,al-jazeera --limit=5
```

### C. Dari Website (Web Scraping)

```bash
# Contoh: Scrape TechCrunch
npm run scrape-news -- --sites=techcrunch --limit=3
```

## 3. Inspeksi Data Mentah

Setelah berita masuk ke Strapi, ambil data `raw_content` untuk dibaca oleh AI.

```bash
# Lokal
node scripts/news-fetcher/scripts/get-today-content.js

# Production
NODE_ENV=production node scripts/news-fetcher/scripts/get-today-content.js
```

Script mendukung pagination (otomatis ambil semua halaman jika >100 artikel).

Copy hasil output script ini, berikan kepada AI untuk dibuatkan ringkasan.

## 4. Summarization & Update

AI membuat ringkasan dari `raw_content`, lalu update ke field `content`.

### Per artikel:

```bash
node scripts/news-fetcher/scripts/update-content.js <DOCUMENT_ID> "<Ringkasan>"
```

### Batch (semua artikel sekaligus):

```bash
# Lokal
node scripts/news-fetcher/scripts/batch-update.js

# Production
NODE_ENV=production node scripts/news-fetcher/scripts/batch-update.js
```

> **Note:** `batch-update.js` berisi mapping title→summary. Script mengambil artikel hari ini dari Strapi, mencocokkan berdasarkan judul, lalu update field `content`. Pendekatan ini menghindari masalah perbedaan `documentId` antara lokal dan production.

## 5. Quick Command (Full Cycle)

### Lokal
```bash
cd scripts/news-fetcher
npm run delete-today
npm run fetch-news -- --limit=10
node scripts/get-today-content.js > today-content.json
# Berikan today-content.json ke AI, update batch-update.js dengan ringkasan
node scripts/batch-update.js
```

### Production
```bash
cd scripts/news-fetcher
NODE_ENV=production npm run delete-today
NODE_ENV=production npm run fetch-news -- --limit=10
NODE_ENV=production node scripts/get-today-content.js > today-content.json
# Berikan today-content.json ke AI, update batch-update.js dengan ringkasan
NODE_ENV=production node scripts/batch-update.js
```

## 6. Troubleshooting

### Data kosong/pendek
1. Cek `MAINTENANCE_GUIDE.md`.
2. Periksa apakah situs target mengubah desain HTML-nya (perlu update `contentSelector`).
3. Jalankan `npm run fetch-news -- --sources=SOURCE_NAME --limit=1` untuk testing satu artikel.

### Fetch gagal (Error Network)
1. Pastikan server Strapi berjalan (`npm run develop` untuk lokal).
2. Cek koneksi internet.
3. Cek apakah situs target memblokir IP (coba buka lewat browser).

### RSS Feed 404 / Parse Error
1. Situs mungkin mengubah URL RSS-nya. Cek URL baru via browser.
2. Test RSS URL: `node -e "fetch('URL').then(r=>r.text()).then(t=>console.log(t.includes('<rss')))"`.
3. Update `rssUrl` di `config/sources.js`.

### Invalid key slug
1. Pastikan skema kategori di Strapi tidak mewajibkan field yang tidak ada di script (seperti `slug`).
