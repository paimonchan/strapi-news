require('dotenv').config();

async function fetchRecentArticles() {
    const STRAPI_URL = process.env.STRAPI_URL_PRODUCTION || 'http://127.0.0.1:1337';
    const API_TOKEN = process.env.STRAPI_API_TOKEN_PRODUCTION || process.env.STRAPI_API_TOKEN;

    const res = await fetch(`${STRAPI_URL}/api/news-articles?pagination[pageSize]=10&sort=createdAt:desc`, {
        headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    });

    const result = await res.json();
    if (result.data) {
        return result.data.map(art => ({
            id: art.id,
            documentId: art.documentId,
            title: art.title,
            rawContent: art.raw_content
        }));
    }
    return [];
}

fetchRecentArticles().then(data => console.log(JSON.stringify(data, null, 2)));
