require('dotenv').config();

async function fetchTodayArticles() {
    const STRAPI_URL = process.env.STRAPI_URL || 'http://127.0.0.1:1337';
    const API_TOKEN = process.env.STRAPI_API_TOKEN;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Fetch articles created today
    const res = await fetch(`${STRAPI_URL}/api/news-articles?filters[createdAt][$gte]=${today}T00:00:00.000Z&pagination[pageSize]=100`, {
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

fetchTodayArticles().then(data => console.log(JSON.stringify(data, null, 2)));
