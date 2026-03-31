# News Fetcher Operational Flow

Panduan langkah-langkah untuk siklus operasional harian: menarik, meringkas, dan memasukkan berita ke Strapi.

## Data Flow

```
RSS/Scrape --> raw_content (teks mentah dari sumber)
AI Summary --> content (ringkasan berbobot untuk ditampilkan ke user)
```

- `raw_content`: Field untuk menyimpan teks asli/mentah hasil fetch atau scrape. Tidak ditampilkan ke end-user.
- `content`: Field untuk menyimpan ringkasan yang sudah diproses AI. Ini yang ditampilkan ke end-user.

## 1. Persiapan: Bersihkan Data Hari Ini

Pastikan tidak ada duplikasi data sebelum penarikan baru.

```bash
npm run delete-today
```

## 2. Penarikan Data (Fetch & Scrape)

Menarik data mentah (Full-Text) ke Strapi. Data disimpan di field `raw_content`.

### A. Dari RSS Feed (dengan Full-Text Scraping)

```bash
# Contoh: Tarik 5 berita dari BBC dan Al Jazeera
npm run fetch-news -- --sources=bbc-world,al-jazeera --limit=5
```

### B. Dari Website (Web Scraping)

```bash
# Contoh: Scrape TechCrunch
npm run scrape-news -- --sites=techcrunch --limit=3
```

## 3. Inspeksi Data Mentah

Setelah berita masuk ke Strapi, ambil data `raw_content` untuk dibaca oleh AI.

```bash
node scripts/news-fetcher/scripts/get-today-content.js
```

Copy hasil output script ini, berikan kepada AI untuk dibuatkan ringkasan.

## 4. Summarization & Update

AI membuat ringkasan dari `raw_content`, lalu update ke field `content`.

### Per artikel:

```bash
node scripts/news-fetcher/scripts/update-content.js <DOCUMENT_ID> "<Ringkasan>"
```

### Batch (semua artikel sekaligus):

```bash
node scripts/news-fetcher/scripts/batch-update.js
```

> **Note:** `batch-update.js` berisi array ringkasan yang sudah digenerate AI. Edit file ini dengan ringkasan baru sebelum dijalankan.

## 5. Troubleshooting

### Data kosong/pendek
1. Cek `MAINTENANCE_GUIDE.md`.
2. Periksa apakah situs target mengubah desain HTML-nya (perlu update `contentSelector`).
3. Jalankan `npm run fetch-news -- --sources=SOURCE_NAME --limit=1` untuk testing satu artikel.

### Fetch gagal (Error Network)
1. Pastikan server Strapi berjalan (`npm run develop`).
2. Cek koneksi internet.
3. Cek apakah situs target memblokir IP (coba buka lewat browser).

### Invalid key slug
1. Pastikan skema kategori di Strapi tidak mewajibkan field yang tidak ada di script (seperti `slug`).
