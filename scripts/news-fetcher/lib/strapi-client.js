/**
 * Strapi Client - Handle all Strapi API interactions
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') }); // Load project root .env
require('dotenv').config({ path: path.join(__dirname, '../.env.fetcher') }); // Load fetcher-specific config

const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production';

// Pilih variabel berdasarkan environment
const STRAPI_BASE = isProd 
    ? process.env.STRAPI_URL_PRODUCTION 
    : (process.env.STRAPI_URL || 'http://localhost:1337');

const API_TOKEN = isProd 
    ? process.env.STRAPI_API_TOKEN_PRODUCTION 
    : process.env.STRAPI_API_TOKEN;

const STRAPI_URL = `${STRAPI_BASE}/api`;

let adminToken = null;

/**
 * Authenticate with Strapi admin API
 */
async function authenticate() {
    if (API_TOKEN) {
        console.log('🔑 Using API token');
        adminToken = API_TOKEN;
        return adminToken;
    }

    try {
        console.log(`🔑 Authenticating as ${ADMIN_EMAIL}...`);
        const response = await fetch(`${STRAPI_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error?.message || 'Authentication failed');
        }

        adminToken = result.data.token;
        console.log('✓ Authentication successful\n');
        return adminToken;
    } catch (error) {
        console.error('✗ Authentication failed:', error.message);
        throw error;
    }
}

/**
 * Get token (use cached if available)
 */
async function getToken() {
    if (!adminToken) {
        await authenticate();
    }
    return adminToken;
}

/**
 * Create entry in Strapi
 */
async function createEntry(endpoint, data) {
    const token = await getToken();
    
    try {
        const response = await fetch(`${STRAPI_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ data }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error?.message || `Failed to create ${endpoint}`);
        }

        return result.data;
    } catch (error) {
        console.error(`✗ Error creating ${endpoint}:`, error.message);
        throw error;
    }
}

/**
 * Find entry by filter
 */
async function findEntry(endpoint, filters = {}) {
    const token = await getToken();
    
    try {
        const queryString = new URLSearchParams(filters).toString();
        const url = `${STRAPI_URL}/${endpoint}${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error(`✗ Error finding ${endpoint}:`, error.message);
        throw error;
    }
}

/**
 * Get or create category
 */
async function getOrCreateCategory(categoryName) {
    try {
        // Try to find existing
        const existing = await findEntry(
            'categories',
            `filters[name][$eq]=${encodeURIComponent(categoryName)}`
        );

        if (existing && existing.length > 0) {
            return existing[0].id;
        }

        // Create new
        const created = await createEntry('categories', {
            name: categoryName,
        });

        console.log(`✓ Created category: ${categoryName}`);
        return created.id;
    } catch (error) {
        console.error(`✗ Failed to get/create category: ${error.message}`);
        return null;
    }
}

/**
 * Get or create source
 */
async function getOrCreateSource(sourceData) {
    try {
        // Try to find existing
        const existing = await findEntry(
            'sources',
            `filters[name][$eq]=${encodeURIComponent(sourceData.name)}`
        );

        if (existing && existing.length > 0) {
            return existing[0].id;
        }

        // Create new
        const created = await createEntry('sources', {
            name: sourceData.name,
            url: sourceData.website || sourceData.baseUrl,
            description: sourceData.description || `${sourceData.name} news`,
        });

        console.log(`✓ Created source: ${sourceData.name}`);
        return created.id;
    } catch (error) {
        console.error(`✗ Failed to get/create source: ${error.message}`);
        return null;
    }
}

/**
 * Check if article exists by URL
 */
async function articleExists(url) {
    try {
        const existing = await findEntry(
            'news-articles',
            `filters[url][$eq]=${encodeURIComponent(url)}`
        );
        return existing && existing.length > 0;
    } catch (error) {
        console.error(`✗ Error checking article existence: ${error.message}`);
        return false;
    }
}

/**
 * Create article with duplicate check
 */
async function createArticle(articleData, categoryId, sourceId, skipDuplicateCheck = false) {
    try {
        // Check for duplicates
        if (!skipDuplicateCheck && await articleExists(articleData.url)) {
            console.log(`⊘ Skipped (duplicate): ${articleData.title.substring(0, 50)}...`);
            return null;
        }

        const created = await createEntry('news-articles', {
            title: articleData.title.substring(0, 250),
            summary: articleData.summary,
            raw_content: articleData.rawContent, // Simpan full text di raw_content, nanti diringkas ke content
            url: articleData.url,
            image: articleData.image,
            author: articleData.author,
            publishedAt: articleData.publishedAt,
            category: categoryId,
            source: sourceId,
        });

        console.log(`✓ Created article: ${articleData.title.substring(0, 50)}...`);
        return created.id;
    } catch (error) {
        console.error(`✗ Failed to create article: ${error.message}`);
        return null;
    }
}

/**
 * Update entry in Strapi
 */
async function updateEntry(endpoint, id, data) {
    const token = await getToken();
    
    try {
        const response = await fetch(`${STRAPI_URL}/${endpoint}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ data }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error?.message || `Failed to update ${endpoint}/${id}`);
        }

        return result.data;
    } catch (error) {
        console.error(`✗ Error updating ${endpoint}/${id}:`, error.message);
        throw error;
    }
}

module.exports = {
    authenticate,
    getToken,
    createEntry,
    findEntry,
    updateEntry,
    getOrCreateCategory,
    getOrCreateSource,
    articleExists,
    createArticle,
    STRAPI_BASE,
    STRAPI_URL,
};
