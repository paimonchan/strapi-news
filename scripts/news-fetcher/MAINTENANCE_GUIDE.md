# News Fetcher Maintenance Guide

Panduan ini digunakan untuk memantau, memperbaiki, dan memastikan sistem scraping berjalan lancar.

## 1. Monitoring: Memastikan Scraping Berjalan
Saat menjalankan `npm run fetch-news`, perhatikan baris output:
*   **Normal**: `✨ [Full-Text Success] Size: 5000+ chars`
*   **Perlu Perhatian**: `✨ [Full-Text Success] Size: 50-100 chars` (Situs mungkin memblokir atau konten utama gagal diambil).
*   **Gagal**: `[Full-Text Success]` tidak muncul (Script gagal menemukan konten utama).

---

## 2. Cara Cek & Perbaiki Selector (Jika Scraping Gagal)
Jika kamu mendapati konten artikel di Strapi tiba-tiba pendek atau berisi error, kemungkinan besar **HTML situs sumber telah berubah**.

### Langkah-langkah pengecekan:
1. **Buka situs berita** (misal: bbc.com) melalui browser (Chrome/Edge).
2. **Buka DevTools** (F12).
3. **Inspeksi elemen** artikel utama:
   * Klik kanan pada judul atau paragraf artikel → **Inspect**.
   * Cari container utama yang membungkus seluruh isi berita (biasanya tag `<article>`, `<main>`, atau `div` dengan class yang spesifik).
4. **Update `config/sources.js`**:
   * Cari ID sumber yang bermasalah.
   * Update bagian `contentSelector` dengan selector CSS baru yang kamu temukan di DevTools.

### Contoh Test Selector:
Kamu bisa membuat file `test-selector.js` sederhana untuk memastikan selector baru bekerja:
```javascript
const cheerio = require('cheerio');
const html = `...isi HTML dari situs...`; // copy paste HTML halaman
const $ = cheerio.load(html);
console.log($('div.your-new-selector').text().substring(0, 500));
```

---

## 3. Checklist Maintenance Rutin
| Tugas | Frekuensi | Action |
| :--- | :--- | :--- |
| **Check Strapi Admin** | Seminggu sekali | Cek apakah isi artikel masih lengkap. |
| **Log Review** | Setiap kali fetch | Lihat apakah banyak muncul error `Failed to fetch`. |
| **Selector Audit** | Sebulan sekali | Cek apakah selector di `sources.js` masih akurat. |

---

## 4. Tips Jika Terblokir (HTTP 403/401)
Jika situs memblokir bot kamu:
1. **Cek User-Agent**: Update `DEFAULT_USER_AGENT` di `lib/web-scraper.js` ke versi terbaru (Chrome terbaru).
2. **Tambah Delay**: Tingkatkan `delay` di `scrape-news.js` menjadi `5000` (5 detik) agar terlihat lebih manusiawi.
3. **Gunakan Proxy**: Jika situs sangat ketat, pertimbangkan menggunakan *proxy service* (seperti BrightData atau ScraperAPI).

---

## 6. Tips Sanitasi Konten (Advanced)
Jika konten artikel di Strapi terlihat berantakan dengan tag HTML:
1. Kita menggunakan `sanitize-html` untuk membuang tag berbahaya dan atribut sampah.
2. Kita menggunakan `turndown` untuk konversi HTML ke Markdown.
3. **Jika ingin mengubah format**: Edit file `lib/web-scraper.js` atau `lib/rss-fetcher.js` dan sesuaikan konfigurasi `sanitizeHtml` atau `turndownService`.

