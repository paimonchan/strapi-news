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
# Lokal (Bash)
node scripts/news-fetcher/scripts/get-today-content.js > today-content.json

# Lokal (PowerShell)
node scripts/news-fetcher/scripts/get-today-content.js | Out-File today-content.json -Encoding utf8

# Production (Bash)
NODE_ENV=production node scripts/news-fetcher/scripts/get-today-content.js > today-content-prod.json

# Production (PowerShell)
$env:NODE_ENV = "production"; node scripts/news-fetcher/scripts/get-today-content.js | Out-File today-content-prod.json -Encoding utf8
```

> **Warning (Windows):** Jika menggunakan `>` di PowerShell, file mungkin tersimpan dalam format UTF-16. Gunakan `| Out-File -Encoding utf8` agar bisa dibaca dengan benar oleh Node.js.

Copy hasil output script ini, berikan kepada AI untuk dibuatkan ringkasan.

## 4. Summarization & Update (AI Role)

AI creates summaries from `raw_content` and updates the `content` field.

> **✨ Enhancement:** The fetcher now automatically attempts to extract the **real article image** from metadata (OpenGraph) during the full-text scraping phase, replacing the initial Picsum placeholder.

Berikan file JSON ke AI dengan prompt:
*"Summarize each article in 2-5 detailed paragraphs based on the provided rawContent. Focus on key facts, context, and implications. Format as a JSON array for batch-update.js."*

AI membuat ringkasan dari `raw_content`, lalu update ke field `content`.

### Per artikel:
```bash
# Bash
node scripts/news-fetcher/scripts/update-content.js <DOCUMENT_ID> "<Ringkasan>"

# PowerShell
$summary = "Isi ringkasan..."; node scripts/news-fetcher/scripts/update-content.js <DOCUMENT_ID> $summary
```

### Batch (semua artikel sekaligus):
Edit `updates` array di `scripts/news-fetcher/scripts/batch-update.js`:

```javascript
const updates = [
    { documentId: "abc123id", content: "Ringkasan 2-5 paragraf..." },
    // ...
];
```

Lalu jalankan:
```bash
# Lokal
npm run batch-update

# Production
$env:NODE_ENV = "production"; npm run batch-update
```

> **Pro-Tip:** Selalu kosongkan kembali array `updates` di `batch-update.js` setelah selesai digunakan agar file tetap bersih.

## 5. Fast-Track Production Flow (Agent Instruction)

Untuk sinkronisasi cepat di Produksi, jalankan perintah gabungan ini dari **root directory**:

```powershell
# 1. Clean, Fetch (10/source), & Extract Raw Content
$env:NODE_ENV = "production"; npm run delete-today; npm run fetch-news -- --limit=10; node scripts/news-fetcher/scripts/get-today-content.js | Out-File today-content-prod.json -Encoding utf8
```

### Langkah Update (AI Role):
1.  **Analyze**: Baca `today-content-prod.json`, buat ringkasan 2-5 paragraf untuk artikel terbaru/penting.
2.  **Execute**: Jangan edit `batch-update.js` (untuk menghindari konflik git). Buatlah file temporer `manual-update-prod.js` yang berisi array `updates` dan logika `fetch(PUT)`.
3.  **Run & Clean**: Jalankan `node manual-update-prod.js` lalu hapus file tersebut beserta `today-content-prod.json`.

### Tips Akses:
- **Token**: Gunakan `STRAPI_API_TOKEN_PRODUCTION` dari `.env`.
- **Encoding**: Di PowerShell, selalu gunakan `| Out-File -Encoding utf8` untuk output JSON agar tidak menjadi UTF-16.
- **Root Context**: Jalankan semua perintah dari root folder project agar path `scripts/news-fetcher/scripts/...` valid.

### Technical Dependencies (For Agents):
- **Real Image Extraction**: Only triggers if `contentSelector` is defined for the source in `config/sources.js`.
- **Library Features**: Use `strapi.updateEntry(endpoint, documentId, data)` from `lib/strapi-client.js` for surgical updates to existing articles.

## 6. Fast-Track Local Flow (Agent Instruction)

To quickly sync in Local, run this combined command from the **root directory**:

```powershell
# 1. Clean, Fetch (10/source), & Extract Raw Content
npm run delete-today; npm run fetch-news -- --limit=10; node scripts/news-fetcher/scripts/get-today-content.js | Out-File today-content-local.json -Encoding utf8
```

### Update Steps (AI Role):
1.  **Analyze**: Read `today-content-local.json`, create 2-5 paragraph summaries for latest/important articles.
2.  **Execute**: Create a temporary file `manual-update-local.js` with the `updates` array and `fetch(PUT)` logic.
3.  **Run & Clean**: Run `node manual-update-local.js` then delete it along with `today-content-local.json`.

## 7. Troubleshooting

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
