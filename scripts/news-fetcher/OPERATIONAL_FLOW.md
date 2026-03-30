# News Fetcher Operational Flow

Panduan langkah-langkah untuk siklus operasional harian: menarik, membersihkan, dan memasukkan berita ke Strapi.

## 1. Persiapan: Bersihkan Data Hari Ini
Penting untuk memastikan tidak ada duplikasi data sebelum melakukan penarikan baru.
```bash
# Menghapus artikel yang dibuat hari ini (UTC)
npm run delete-today
```

## 2. Operasional: Menarik Berita (Fetch & Scrape)

### A. Menarik Berita dari RSS (dengan Full-Text Scraping)
Gunakan perintah ini untuk mengambil berita dari RSS feed dan secara otomatis mengunjungi URL artikel untuk mengambil teks lengkapnya.
```bash
# Contoh: Tarik 5 berita dari BBC dan Al Jazeera
npm run fetch-news -- --sources=bbc-world,al-jazeera --limit=5
```

### B. Menarik Berita dari Website (Web Scraping)
Gunakan jika situs berita tidak menyediakan RSS feed atau untuk menambah coverage.
```bash
# Contoh: Scrape TechCrunch
npm run scrape-news -- --sites=techcrunch --limit=3
```

## 3. Pengecekan & Ringkasan Berbobot (Summarization)

Setelah berita masuk ke Strapi:

1. **Cek Summary Log**: 
   Pastikan muncul pesan `✨ [Full-Text Success]`.
   
2. **Buat Ringkasan (Summarization)**:
   - Gunakan `node scripts/news-fetcher/scripts/get-today-content.js` untuk melihat teks lengkap berita terbaru.
   - Buat ringkasan berbobot (2-3 paragraf) berdasarkan teks tersebut.
   - Jalankan `node scripts/news-fetcher/scripts/update-content.js <documentId> "<Ringkasan Baru>"` untuk memperbarui kolom `content`.

3. **Cek Strapi Admin**:
   - Pastikan field `content` (ringkasan berbobot) dan `raw_content` (isi lengkap Markdown) sudah terisi dengan benar.


---

## 4. Troubleshooting Workflow
Jika terjadi masalah saat penarikan data:

*   **Jika data kosong/pendek**:
    1. Cek `MAINTENANCE_GUIDE.md`.
    2. Periksa apakah situs target mengubah desain HTML-nya (perlu update `contentSelector`).
    3. Jalankan `npm run fetch-news -- --sources=SOURCE_NAME --limit=1` untuk testing satu artikel saja.

*   **Jika `fetch` gagal (Error Network)**:
    1. Pastikan server Strapi berjalan (`npm run develop`).
    2. Cek koneksi internet.
    3. Cek apakah situs target memblokir IP kamu (coba buka lewat browser).

*   **Jika `Invalid key slug`**:
    1. Pastikan skema kategori di Strapi (di admin panel atau `schema.json`) tidak mewajibkan field yang tidak ada di script (seperti `slug`).
