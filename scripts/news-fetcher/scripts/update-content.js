require('dotenv').config();

/**
 * Script untuk Update Content (Ringkasan Berbobot) via API
 * 
 * Penggunaan: 
 * node update-content.js <documentId> "Isi ringkasan baru..."
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://127.0.0.1:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN;

async function updateContent(documentId, newContent) {
    if (!documentId || !newContent) {
        console.error('Usage: node update-content.js <documentId> "Isi ringkasan..."');
        process.exit(1);
    }

    try {
        const url = `${STRAPI_URL}/api/news-articles/${documentId}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify({
                data: {
                    content: newContent
                }
            })
        });

        const result = await response.json();
        if (response.ok) {
            console.log(`✓ Berhasil update artikel: ${documentId}`);
        } else {
            console.error(`✗ Gagal update: ${JSON.stringify(result.error)}`);
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

const [,, docId, content] = process.argv;
updateContent(docId, content);
