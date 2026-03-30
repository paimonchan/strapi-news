/**
 * RSS Feed Fetcher - Fetch and parse RSS feeds
 */

const { parseStringPromise } = require('xml2js');
const sanitizeHtml = require('sanitize-html');
const TurndownService = require('turndown');

const turndownService = new TurndownService();

/**
 * Fetch RSS feed from URL
 */
async function fetchRSSFeed(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const xml = await response.text();
        const result = await parseStringPromise(xml);
        return result;
    } catch (error) {
        console.error(`✗ Failed to fetch RSS feed from ${url}: ${error.message}`);
        return null;
    }
}

/**
 * Parse RSS feed items into articles
 */
function parseRSSItems(rssData, source) {
    const articles = [];
    let items = [];

    // Handle different RSS formats
    if (rssData.rss?.channel?.[0]?.item) {
        items = rssData.rss.channel[0].item;
    } else if (rssData.feed?.entry) {
        items = rssData.feed.entry;
    }

    items.forEach((item) => {
        // Extract image from multiple possible locations
        let image = null;
        
        // Try media:content (most common)
        if (item.media?.content?.[0]) {
            const media = item.media.content[0];
            image = media.$?.url || media._ || media.url;
        }
        
        // Try enclosure
        if (!image && item.enclosure?.[0]) {
            image = item.enclosure[0].$?.url;
        }
        
        // Try media:thumbnail
        if (!image && item.media?.thumbnail?.[0]) {
            image = item.media.thumbnail[0].$?.url;
        }
        
        // Try media:group > media:content
        if (!image && item.media?.group?.[0]?.media?.content?.[0]) {
            image = item.media.group[0].media.content[0].$?.url;
        }
        
        // Try content:encoded (may contain img tag)
        if (!image && item['content:encoded']?.[0]) {
            const imgMatch = item['content:encoded'][0].match(/<img[^>]+src="([^"]+)"/);
            if (imgMatch) {
                image = imgMatch[1];
            }
        }
        
        // Try description (may contain img tag)
        if (!image && item.description?.[0]) {
            const desc = item.description[0];
            const imgMatch = desc.match(/<img[^>]+src="([^"]+)"/);
            if (imgMatch) {
                image = imgMatch[1];
            }
        }
        
        // Try to extract from featured image meta
        if (!image && item['featured_image']?.[0]) {
            image = item['featured_image'][0];
        }

        // 1. Summary: Revert to short format
        const summary = (item.description?.[0] || item.summary?.[0] || '').replace(/<[^>]*>/g, '').substring(0, 300);
        
        // 2. Summarized Content: Take 2 paragraphs or first 800 chars as 'content'
        const rawContent = item['content:encoded']?.[0] || item.description?.[0] || '';
        const plainTextContent = rawContent.replace(/<[^>]*>/g, ' ');
        const summarizedContent = plainTextContent.split('. ').slice(0, 3).join('. ') + '.';

        const article = {
            title: item.title?.[0] || 'No title',
            summary: summary,
            url: item.link?.[0]?.$?.href || item.link?.[0] || '#',
            publishedAt: item.pubDate?.[0] || item.published?.[0] || new Date().toISOString(),
            author: item.author?.[0]?.$?.name || item['dc:creator']?.[0] || 'Unknown',
            image: image,
            source: source.name,
            sourceId: source.id,
            category: source.category,
            content: summarizedContent, // This is the new summarized content
            rawContent: item['content:encoded']?.[0] || item.content?.[0] || item.description?.[0] || '',
        };

        // Process rawContent: Sanitze and convert to Markdown
        const cleanContent = sanitizeHtml(article.rawContent, {
            allowedTags: [ 'p', 'b', 'i', 'strong', 'em', 'ul', 'ol', 'li', 'blockquote', 'br', 'h1', 'h2', 'h3' ],
            allowedAttributes: {}
        });
        
        article.rawContent = turndownService.turndown(cleanContent);
        articles.push(article);
    });

    return articles;
}

/**
 * Fetch and parse RSS feed from a source
 */
async function fetchFromSource(source, limit = 10) {
    console.log(`📰 Fetching from ${source.name} (${source.category})...`);

    const rssData = await fetchRSSFeed(source.rssUrl);
    if (!rssData) return [];

    let articles = parseRSSItems(rssData, source);
    articles = articles.slice(0, limit);

    console.log(`  Found ${articles.length} articles`);
    
    // Log image extraction stats
    const withImages = articles.filter(a => a.image).length;
    console.log(`  Articles with images: ${withImages}/${articles.length}`);
    
    // Add placeholder images for articles without images
    articles = articles.map(article => {
        if (!article.image) {
            // Generate placeholder based on category and title
            const categorySlug = article.category.toLowerCase().replace(/\s+/g, '-');
            const titleSlug = article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30);
            article.image = `https://picsum.photos/seed/${titleSlug}/800/450`;
        }
        return article;
    });
    
    console.log(`  After placeholder: ${articles.length}/${articles.length} articles have images`);
    
    return articles;
}

/**
 * NewsAPI.org fetcher
 */
async function fetchNewsAPI(apiKey, category, limit) {
    if (!apiKey) {
        console.log('⚠️  NewsAPI key not configured');
        return [];
    }

    const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${apiKey}&pageSize=${limit}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'ok') {
            throw new Error(data.message || 'API error');
        }

        return data.articles.map((article) => {
            let image = article.urlToImage;
            
            if (!image) {
                const titleSlug = article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30);
                image = `https://picsum.photos/seed/${titleSlug}/800/450`;
            }

            return {
                title: article.title,
                summary: article.description || '',
                url: article.url,
                publishedAt: article.publishedAt,
                author: article.author || 'Unknown',
                image: image,
                source: 'NewsAPI',
                sourceId: 'newsapi',
                category: category.charAt(0).toUpperCase() + category.slice(1),
                content: article.content || '',
            };
        });
    } catch (error) {
        console.error(`✗ NewsAPI error: ${error.message}`);
        return [];
    }
}

module.exports = {
    fetchRSSFeed,
    parseRSSItems,
    fetchFromSource,
    fetchNewsAPI,
};
