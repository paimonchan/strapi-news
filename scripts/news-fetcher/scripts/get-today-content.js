const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env.fetcher') });

async function fetchTodayArticles() {
    const STRAPI_URL = process.env.STRAPI_URL || 'http://127.0.0.1:1337';
    const API_TOKEN = process.env.STRAPI_API_TOKEN;

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    let allArticles = [];
    let page = 1;
    const pageSize = 100;

    while (true) {
        const res = await fetch(
            `${STRAPI_URL}/api/news-articles?filters[createdAt][$gte]=${today}T00:00:00.000Z&pagination[pageSize]=${pageSize}&pagination[page]=${page}`,
            { headers: { 'Authorization': `Bearer ${API_TOKEN}` } }
        );

        const result = await res.json();
        if (!result.data || result.data.length === 0) break;

        const articles = result.data.map(art => ({
            id: art.id,
            documentId: art.documentId,
            title: art.title,
            rawContent: art.raw_content
        }));

        allArticles = allArticles.concat(articles);

        if (result.data.length < pageSize) break;
        page++;
    }

    return allArticles;
}

fetchTodayArticles().then(data => console.log(JSON.stringify(data, null, 2)));
