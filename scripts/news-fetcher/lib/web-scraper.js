/**
 * Web Scraper - Scrape articles from news websites
 */

const cheerio = require('cheerio');
const sanitizeHtml = require('sanitize-html');
const TurndownService = require('turndown');

const turndownService = new TurndownService();

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Scrape articles from a website
 */
async function scrapeSite(site, limit = 10) {
    console.log(`🕷️  Scraping ${site.name} (${site.category})...`);

    try {
        const response = await fetch(site.articleListUrl, {
            headers: {
                'User-Agent': process.env.SCRAPER_USER_AGENT || DEFAULT_USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const articles = [];
        const selector = site.selectors.article;

        $(selector).each((index, element) => {
            if (articles.length >= limit) return;

            const $el = $(element);
            
            // Extract title
            const titleEl = site.selectors.title ? $el.find(site.selectors.title).first() : $el.find('h2, h3').first();
            const title = titleEl.text().trim() || 'No title';

            // Extract link
            const linkEl = site.selectors.link ? $el.find(site.selectors.link).first() : $el.find('a').first();
            let link = linkEl.attr('href') || '#';
            if (link && link.startsWith('/')) {
                link = site.baseUrl + link;
            }

            // Extract summary
            const summaryEl = site.selectors.summary ? $el.find(site.selectors.summary).first() : $el.find('p').first();
            let summary = summaryEl.text().trim();
            summary = summary.replace(/<[^>]*>/g, '').substring(0, 500);

            // Extract image
            let image = null;
            if (site.selectors.image) {
                const imgEl = $el.find(site.selectors.image).first();
                image = imgEl.attr('src') || imgEl.attr('data-src') || null;
                if (image && image.startsWith('/')) {
                    image = site.baseUrl + image;
                }
            }

            // Extract time
            let publishedAt = new Date().toISOString();
            if (site.selectors.time) {
                const timeEl = $el.find(site.selectors.time).first();
                const timeAttr = timeEl.attr('datetime') || timeEl.text().trim();
                if (timeAttr) {
                    const parsed = new Date(timeAttr);
                    if (!isNaN(parsed.getTime())) {
                        publishedAt = parsed.toISOString();
                    }
                }
            }

            // Extract author
            let author = 'Unknown';
            if (site.selectors.author) {
                const authorEl = $el.find(site.selectors.author).first();
                author = authorEl.text().trim() || 'Unknown';
            }

            // Fallback image if not found
            if (!image) {
                const titleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30);
                image = `https://picsum.photos/seed/${titleSlug}/800/450`;
            }

            articles.push({
                title,
                summary: summary || title,
                url: link,
                publishedAt,
                author,
                image,
                source: site.name,
                sourceId: site.id,
                category: site.category,
                content: summary,
            });
        });

        console.log(`  Found ${articles.length} articles`);
        return articles;
    } catch (error) {
        console.error(`✗ Failed to scrape ${site.name}: ${error.message}`);
        return [];
    }
}

/**
 * Fetch full content from an article URL
 */
async function fetchFullContent(url, selector) {
    if (!url || url === '#' || !selector) return null;

    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': DEFAULT_USER_AGENT },
        });

        if (!response.ok) return null;

        const html = await response.text();
        const $ = cheerio.load(html);
        
        const contentEl = $(selector);
        if (contentEl.length === 0) return null;

        // Get the HTML content
        let rawHtml = contentEl.html();
        if (!rawHtml) return null;

        // Use sanitize-html for professional cleaning
        const cleanHtml = sanitizeHtml(rawHtml, {
            allowedTags: [
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'ul', 'ol',
                'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br'
            ],
            allowedAttributes: {}, // No attributes allowed
        });

        // Convert cleaned HTML to Markdown
        let markdown = turndownService.turndown(cleanHtml);

        // Final cleanup of whitespace
        return markdown
            .replace(/\n\s*\n\s*\n/g, '\n\n') // Max double newlines
            .trim();
    } catch (error) {
        console.error(`✗ Error fetching full content from ${url}: ${error.message}`);
        return null;
    }
}

/**
 * Clean HTML content
 */
function cleanHTML(html) {
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Extract text from selector
 */
function extractText($, selector) {
    if (!selector) return null;
    return $(selector).first().text().trim() || null;
}

/**
 * Extract attribute from selector
 */
function extractAttr($, selector, attr = 'href') {
    if (!selector) return null;
    const el = $(selector).first();
    return el.attr(attr) || el.attr(`data-${attr}`) || null;
}

module.exports = {
    scrapeSite,
    fetchFullContent,
    cleanHTML,
    extractText,
    extractAttr,
    DEFAULT_USER_AGENT,
};
