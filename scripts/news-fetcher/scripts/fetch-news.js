#!/usr/bin/env node
/**
 * Fetch News - Main Script
 * Fetches news from RSS feeds and News APIs
 * 
 * Usage:
 *   node scripts/fetchers/fetch-news.js [options]
 * 
 * Options:
 *   --sources=source1,source2   Fetch from specific sources
 *   --category=Technology       Filter by category
 *   --limit=10                  Max articles per source
 *   --dry-run                   Preview without inserting
 *   --help                      Show help
 */

const path = require('path');
const sourcesConfig = require('../config/sources');
const { fetchFromSource, fetchNewsAPI } = require('../lib/rss-fetcher');
const { fetchFullContent } = require('../lib/web-scraper');
const strapi = require('../lib/strapi-client');
const logger = require('../lib/logger');

// Parse arguments
const args = process.argv.slice(2);
const options = {
    sources: null,
    category: null,
    limit: 10,
    dryRun: false,
    help: false,
};

args.forEach((arg) => {
    if (arg.startsWith('--sources=')) {
        options.sources = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--category=')) {
        options.category = arg.split('=')[1];
    } else if (arg.startsWith('--limit=')) {
        options.limit = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--dry-run') {
        options.dryRun = true;
    } else if (arg === '--help') {
        options.help = true;
    }
});

if (options.help) {
    console.log(`
Fetch News - Grab news from RSS Feeds and News APIs

Usage:
  node scripts/fetchers/fetch-news.js [options]

Options:
  --sources=source1,source2   Fetch from specific sources only
  --category=Technology       Fetch only articles in this category
  --limit=10                  Max articles per source (default: 10)
  --dry-run                   Preview without inserting to database
  --help                      Show this help message

Examples:
  node scripts/fetchers/fetch-news.js                     # All sources
  node scripts/fetchers/fetch-news.js --sources=techcrunch,bbc-tech
  node scripts/fetchers/fetch-news.js --category=Technology --limit=5
  node scripts/fetchers/fetch-news.js --dry-run           # Preview only

Available RSS Sources:
  ${sourcesConfig.rss.map((s) => s.id).join(', ')}

Available API Sources:
  ${sourcesConfig.apis.map((s) => s.id).join(', ')}
`);
    process.exit(0);
}

/**
 * Process RSS sources
 */
async function processRSSSources() {
    const rssSources = options.sources
        ? sourcesConfig.rss.filter((s) => options.sources.includes(s.id))
        : sourcesConfig.rss;

    let totalArticles = 0;
    let totalInserted = 0;
    let totalSkipped = 0;

    for (const source of rssSources) {
        if (options.category && source.category !== options.category) {
            continue;
        }

        const articles = await fetchFromSource(source, options.limit);

        if (options.dryRun) {
            logger.info(`[DRY RUN] Would insert ${articles.length} articles from ${source.name}`);
            totalArticles += articles.length;
            continue;
        }

        // Get or create category and source
        const categoryId = await strapi.getOrCreateCategory(source.category);
        const sourceId = await strapi.getOrCreateSource(source);

        if (!categoryId || !sourceId) {
            logger.warn(`Skipping ${source.name}: Failed to create/get category or source`);
            continue;
        }

        // Insert articles
        for (const article of articles) {
            totalArticles++;
            
            // Check for duplicates before expensive full-text fetch
            const exists = await strapi.articleExists(article.url);
            if (exists) {
                // logger.debug(`Skipping (duplicate): ${article.title.substring(0, 50)}...`);
                totalSkipped++;
                continue;
            }

            // TRY FULL-TEXT SCRAPING
            if (source.contentSelector) {
                console.log(`  🔍 Fetching full content for: ${article.title.substring(0, 40)}...`);
                const fullContent = await fetchFullContent(article.url, source.contentSelector);
                if (fullContent && fullContent.length > article.content.length) {
                    article.rawContent = fullContent;
                    console.log(`  ✨ [Full-Text Success] Size: ${fullContent.length} chars`);
                } else {
                    article.rawContent = article.content;
                }
            } else {
                article.rawContent = article.content;
            }

            const articleId = await strapi.createArticle(article, categoryId, sourceId, true); // true to skip duplicate check (we just did it)
            if (articleId) {
                totalInserted++;
            }
        }
    }

    return { totalArticles, totalInserted, totalSkipped };
}

/**
 * Process API sources
 */
async function processAPISources() {
    let totalArticles = 0;
    let totalInserted = 0;

    for (const api of sourcesConfig.apis) {
        if (!api.apiKey) {
            logger.warn(`Skipping ${api.name}: API key not configured`);
            continue;
        }

        for (const category of api.categories) {
            if (options.category && category.toLowerCase() !== options.category.toLowerCase()) {
                continue;
            }

            logger.info(`Fetching from ${api.name} - ${category}...`);
            const articles = await fetchNewsAPI(api.apiKey, category, options.limit);

            if (options.dryRun) {
                logger.info(`[DRY RUN] Would insert ${articles.length} articles`);
                totalArticles += articles.length;
                continue;
            }

            const categoryId = await strapi.getOrCreateCategory(category);
            const sourceId = await strapi.getOrCreateSource({ name: api.name, website: api.baseUrl });

            if (!categoryId || !sourceId) continue;

            for (const article of articles) {
                totalArticles++;
                const articleId = await strapi.createArticle(article, categoryId, sourceId);
                if (articleId) {
                    totalInserted++;
                }
            }
        }
    }

    return { totalArticles, totalInserted, totalSkipped: 0 };
}

/**
 * Main function
 */
async function main() {
    logger.section('News Fetcher - Starting');

    logger.info('Configuration:');
    logger.info(`  Sources: ${options.sources ? options.sources.join(', ') : 'all'}`);
    logger.info(`  Category: ${options.category || 'all'}`);
    logger.info(`  Limit: ${options.limit} articles per source`);
    logger.info(`  Dry Run: ${options.dryRun}`);

    // Authenticate with Strapi
    if (!options.dryRun) {
        await strapi.authenticate();
    }

    // Process RSS sources
    const rssStats = await processRSSSources();

    // Process API sources
    const apiStats = await processAPISources();

    // Summary
    const totalArticles = rssStats.totalArticles + apiStats.totalArticles;
    const totalInserted = rssStats.totalInserted + apiStats.totalInserted;
    const totalSkipped = rssStats.totalSkipped + apiStats.totalSkipped;

    logger.section('Summary');
    logger.info(`Total articles processed: ${totalArticles}`);
    logger.info(`Articles inserted: ${totalInserted}`);
    logger.info(`Articles skipped (duplicates): ${totalSkipped}`);

    if (options.dryRun) {
        logger.warn('[DRY RUN] No data was inserted into the database');
    }
}

// Run
main().catch((error) => {
    logger.error(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
});
