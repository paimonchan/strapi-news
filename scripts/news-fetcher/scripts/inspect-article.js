require('dotenv').config();

async function checkContent() {
    const STRAPI_URL = process.env.STRAPI_URL || 'http://127.0.0.1:1337';
    const API_TOKEN = process.env.STRAPI_API_TOKEN;
    const docId = 'nfy9hyrzxkppff9e41gbk2ym';

    const res = await fetch(`${STRAPI_URL}/api/news-articles/${docId}`, {
        headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    });

    const result = await res.json();
    if (result.data) {
        console.log('CONTENT START:');
        console.log(result.data.content);
        console.log('CONTENT END');
    } else {
        console.log('Article not found or error:', result);
    }
}

checkContent();
