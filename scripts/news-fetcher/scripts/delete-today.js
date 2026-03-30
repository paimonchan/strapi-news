#!/usr/bin/env node
/**
 * Delete articles created today
 * Using Strapi API with API token from .env
 * Optimized for Strapi v5 (using documentId and fetch)
 */

require('dotenv').config();

const strapi = require('../lib/strapi-client');

async function run() {
    const STRAPI_BASE = strapi.STRAPI_BASE;
    const API_TOKEN = await strapi.getToken();

    if (!API_TOKEN) {
        console.log('✗ Error: STRAPI_API_TOKEN not set');
        process.exit(1);
    }

    console.log('🗑️  Delete Articles Created Today\n');
    console.log(`API URL: ${STRAPI_BASE}`);
    console.log(`Token: ${API_TOKEN.substring(0, 20)}...\n`);

    try {
        const getUrl = `${STRAPI_BASE}/api/news-articles?pagination[pageSize]=1000`;
        console.log(`Fetching articles from: ${getUrl}`);

        const response = await fetch(getUrl, {
            headers: { 'Authorization': `Bearer ${API_TOKEN}` },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorBody.substring(0, 200)}`);
        }

        const result = await response.json();
        const articles = result.data || [];
        
        // Filter today's articles
        const now = new Date();
        const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
        const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
        
        const todayArticles = articles.filter(a => {
            const d = new Date(a.createdAt);
            return d >= todayStart && d <= todayEnd;
        });
        
        const total = todayArticles.length;
        console.log(`Found ${total} articles created today (${todayStart.toISOString().split('T')[0]})\n`);
        
        if (total === 0) {
            console.log('✓ No articles to delete');
            return;
        }
        
        // Show articles to delete
        console.log('Articles to delete:');
        todayArticles.forEach((a, i) => {
            console.log(`  ${i+1}. [${a.documentId}] - ${a.title?.substring(0, 40)}...`);
        });
        console.log('');
        
        // Delete articles one by one
        console.log('Deleting...\n');
        
        let deleted = 0;
        for (let i = 0; i < todayArticles.length; i++) {
            const article = todayArticles[i];
            const title = article.title?.substring(0, 50) || 'Untitled';
            const documentId = article.documentId;
            
            try {
                const delRes = await fetch(`${STRAPI_BASE}/api/news-articles/${documentId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${API_TOKEN}` },
                });

                if (delRes.status === 200 || delRes.status === 204) {
                    console.log(`✓ [${i + 1}/${total}] Deleted: ${title}`);
                    deleted++;
                } else {
                    const body = await delRes.text();
                    console.log(`✗ [${i + 1}/${total}] Failed: ${title} (HTTP ${delRes.status})`);
                    if (body) console.log(`   Response: ${body.substring(0, 100)}`);
                }
            } catch (err) {
                console.log(`✗ [${i + 1}/${total}] Error: ${title} - ${err.message}`);
            }
        }
        
        console.log(`\n============================================================`);
        console.log(`✓ Finished: ${deleted}/${total} articles deleted`);
        console.log(`============================================================`);
        
        // Verify
        try {
            const vRes = await fetch(`${STRAPI_BASE}/api/news-articles?pagination[pageSize]=1`, {
                headers: { 'Authorization': `Bearer ${API_TOKEN}` },
            });
            const vResult = await vRes.json();
            console.log(`\nVerification: ${vResult.meta?.pagination?.total || 0} total articles remaining`);
        } catch (e) {}
        
    } catch (error) {
        console.log(`✗ Fatal error: ${error.message}`);
        console.log('\nMake sure Strapi is running: npm run develop');
        process.exit(1);
    }
}

run();
