#!/usr/bin/env node
/**
 * Scrape News - Main Script
 * Scrapes news articles from websites
 * 
 * Usage:
 *   node scripts/fetchers/scrape-news.js [options]
 * 
 * Options:
 *   --sites=site1,site2   Scrape specific sites
 *   --limit=10            Max articles per site
 *   --dry-run             Preview without inserting
 *   --help                Show help
 */

const sourcesConfig = require('../config/sources');
const { scrapeSite, fetchFullContent } = require('../lib/web-scraper');
const strapi = require('../lib/strapi-client');
const logger = require('../lib/logger');

// Parse arguments
const args = process.argv.slice(2);
const options = {
    sites: null,
    limit: 10,
    dryRun: false,
    help: false,
};

args.forEach((arg) => {
    if (arg.startsWith('--sites=')) {
        options.sites = arg.split('=')[1].split(',');
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
Scrape News - Scrape news articles from websites

Usage:
  node scripts/fetchers/scrape-news.js [options]

Options:
  --sites=site1,site2   Scrape specific sites only
  --limit=10            Max articles per site (default: 10)
  --dry-run             Preview without inserting to database
  --help                Show this help message

Examples:
  node scripts/fetchers/scrape-news.js                     # All sites
  node scripts/fetchers/scrape-news.js --sites=bbc,cnn     # Specific sites
  node scripts/fetchers/scrape-news.js --limit=5           # 5 articles per site
  node scripts/fetchers/scrape-news.js --dry-run           # Preview only

Available Sites:
  ${sourcesConfig.websites.map((s) => s.id).join(', ')}

Note: Please review each site's terms of service and robots.txt
      before using web scraping in production.
`);
    process.exit(0);
}

/**
 * Main function
 */
async function main() {
    logger.section('News Scraper - Starting');

    logger.info('Configuration:');
    logger.info(`  Sites: ${options.sites ? options.sites.join(', ') : 'all'}`);
    logger.info(`  Limit: ${options.limit} articles per site`);
    logger.info(`  Dry Run: ${options.dryRun}`);

    // Authenticate
    if (!options.dryRun) {
        await strapi.authenticate();
    }

    // Filter sites
    const sites = options.sites
        ? sourcesConfig.websites.filter((s) => options.sites.includes(s.id))
        : sourcesConfig.websites;

    let totalArticles = 0;
    let totalInserted = 0;
    let totalSkipped = 0;

    for (const site of sites) {
        const articles = await scrapeSite(site, options.limit);

        if (options.dryRun) {
            logger.info(`[DRY RUN] Would insert ${articles.length} articles from ${site.name}`);
            totalArticles += articles.length;
            continue;
        }

        // Get or create category and source
        const categoryId = await strapi.getOrCreateCategory(site.category);
        const sourceId = await strapi.getOrCreateSource(site);

        if (!categoryId || !sourceId) {
            logger.warn(`Skipping ${site.name}: Failed to create/get category or source`);
            continue;
        }

        // Add delay between requests (be respectful!)
        const delay = parseInt(process.env.SCRAPER_DELAY) || 2000;
        if (delay > 0 && sites.indexOf(site) < sites.length - 1) {
            logger.debug(`Waiting ${delay}ms before next request...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Insert articles
        for (const article of articles) {
            totalArticles++;
            
            // Check for duplicates before expensive full-text fetch
            const exists = await strapi.articleExists(article.url);
            if (exists) {
                totalSkipped++;
                continue;
            }

            // TRY FULL-TEXT SCRAPING for websites too
            // Find content selector from RSS config matching this site
            const siteConfig = sourcesConfig.rss.find(s => s.id === site.id);
            const contentSelector = siteConfig ? siteConfig.contentSelector : null;
            
            if (contentSelector) {
                console.log(`  🔍 Fetching full content for: ${article.title.substring(0, 40)}...`);
                const fullContent = await fetchFullContent(article.url, contentSelector);
                if (fullContent && fullContent.length > article.content.length) {
                    article.content = fullContent;
                    console.log(`  ✨ [Full-Text Success] Size: ${fullContent.length} chars`);
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            const articleId = await strapi.createArticle(article, categoryId, sourceId, true);
            if (articleId) {
                totalInserted++;
            }
        }
    }

    // Summary
    logger.section('Summary');
    logger.info(`Total articles processed: ${totalArticles}`);
    logger.info(`Articles inserted: ${totalInserted}`);
    logger.info(`Articles skipped (duplicates): ${totalSkipped}`);

    if (options.dryRun) {
        logger.warn('[DRY RUN] No data was inserted into the database');
    }

    logger.info('\n⚠️  Note: Please review each site\'s terms of service before');
    logger.info('   using web scraping in production. Consider using official');
    logger.info('   APIs where available.');
}

// Run
main().catch((error) => {
    logger.error(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
});
