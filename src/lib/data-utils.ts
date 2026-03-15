/**
 * Data Utility Functions for NewsWire Application
 * Similar to src/lib/data.ts in Next.js version
 * Provides helpers for filtering, sorting, and retrieving articles
 */

interface Article {
    id: string;
    title: string;
    description: string;
    content: string;
    category: string;
    image: string;
    author: string;
    publishedAt: string;
}

// ============================================================================
// Article Retrieval Functions
// ============================================================================

/**
 * Get articles filtered by category
 * @param articles - Array of all articles
 * @param category - Category slug or name to filter by
 * @returns Array of articles in specified category
 */
export function getArticlesByCategory(
    articles: Article[],
    category: string
): Article[] {
    return articles.filter(
        (article) =>
            article.category.toLowerCase() === category.toLowerCase()
    );
}

/**
 * Get a single article by ID
 * @param articles - Array of all articles
 * @param id - Article ID
 * @returns Article object or undefined if not found
 */
export function getArticleById(
    articles: Article[],
    id: string
): Article | undefined {
    return articles.find((article) => article.id === id);
}

/**
 * Get the featured article (first/newest article)
 * @param articles - Array of all articles sorted by date
 * @returns First article in the array (most recent)
 */
export function getFeaturedArticle(articles: Article[]): Article {
    return articles[0];
}

/**
 * Get the latest N articles
 * @param articles - Array of all articles
 * @param count - Number of articles to retrieve (default: 5)
 * @returns Array of latest articles up to count
 */
export function getLatestArticles(articles: Article[], count: number = 5): Article[] {
    return articles.slice(0, count);
}

// ============================================================================
// Article Sorting & Filtering Functions
// ============================================================================

/**
 * Sort articles by published date (newest first)
 * @param articles - Array of articles to sort
 * @returns Sorted array
 */
export function sortArticlesByDate(articles: Article[]): Article[] {
    return [...articles].sort(
        (a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

/**
 * Sort articles by title alphabetically
 * @param articles - Array of articles to sort
 * @returns Sorted array
 */
export function sortArticlesByTitle(articles: Article[]): Article[] {
    return [...articles].sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Filter articles by search query (searches title and description)
 * @param articles - Array of articles to search
 * @param query - Search query string
 * @returns Filtered articles matching query
 */
export function searchArticles(articles: Article[], query: string): Article[] {
    const lowerQuery = query.toLowerCase();
    return articles.filter(
        (article) =>
            article.title.toLowerCase().includes(lowerQuery) ||
            article.description.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Filter articles by author
 * @param articles - Array of articles
 * @param author - Author name
 * @returns Articles by specified author
 */
export function getArticlesByAuthor(
    articles: Article[],
    author: string
): Article[] {
    return articles.filter(
        (article) => article.author.toLowerCase() === author.toLowerCase()
    );
}

/**
 * Filter articles by date range
 * @param articles - Array of articles
 * @param startDate - Start date (inclusive)
 * @param endDate - End date (inclusive)
 * @returns Articles published within date range
 */
export function getArticlesByDateRange(
    articles: Article[],
    startDate: Date,
    endDate: Date
): Article[] {
    return articles.filter((article) => {
        const publishDate = new Date(article.publishedAt);
        return publishDate >= startDate && publishDate <= endDate;
    });
}

// ============================================================================
// Pagination Functions
// ============================================================================

/**
 * Paginate articles
 * @param articles - Array of articles
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of articles per page
 * @returns Paginated articles
 */
export function paginateArticles(
    articles: Article[],
    page: number = 1,
    pageSize: number = 10
): Article[] {
    const startIndex = (page - 1) * pageSize;
    return articles.slice(startIndex, startIndex + pageSize);
}

/**
 * Get pagination info
 * @param total - Total number of items
 * @param pageSize - Items per page
 * @param currentPage - Current page number
 * @returns Pagination metadata
 */
export function getPaginationInfo(
    total: number,
    pageSize: number = 10,
    currentPage: number = 1
) {
    const pageCount = Math.ceil(total / pageSize);
    return {
        page: currentPage,
        pageSize,
        pageCount,
        total,
        hasNextPage: currentPage < pageCount,
        hasPreviousPage: currentPage > 1,
    };
}

// ============================================================================
// Aggregation & Statistics Functions
// ============================================================================

/**
 * Get articles grouped by category
 * @param articles - Array of articles
 * @returns Object with categories as keys and article arrays as values
 */
export function groupArticlesByCategory(
    articles: Article[]
): Record<string, Article[]> {
    return articles.reduce(
        (grouped, article) => {
            const category = article.category;
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(article);
            return grouped;
        },
        {} as Record<string, Article[]>
    );
}

/**
 * Get articles grouped by author
 * @param articles - Array of articles
 * @returns Object with authors as keys and article arrays as values
 */
export function groupArticlesByAuthor(
    articles: Article[]
): Record<string, Article[]> {
    return articles.reduce(
        (grouped, article) => {
            const author = article.author;
            if (!grouped[author]) {
                grouped[author] = [];
            }
            grouped[author].push(article);
            return grouped;
        },
        {} as Record<string, Article[]>
    );
}

/**
 * Get article count by category
 * @param articles - Array of articles
 * @returns Object with category names and article counts
 */
export function getArticleCountByCategory(
    articles: Article[]
): Record<string, number> {
    const grouped = groupArticlesByCategory(articles);
    return Object.entries(grouped).reduce(
        (counts, [category, categoryArticles]) => {
            counts[category] = categoryArticles.length;
            return counts;
        },
        {} as Record<string, number>
    );
}

/**
 * Get unique categories from articles
 * @param articles - Array of articles
 * @returns Array of unique category names
 */
export function getUniqueCategoriesFromArticles(articles: Article[]): string[] {
    return [...new Set(articles.map((article) => article.category))];
}

/**
 * Get unique authors from articles
 * @param articles - Array of articles
 * @returns Array of unique author names
 */
export function getUniqueAuthorsFromArticles(articles: Article[]): string[] {
    return [...new Set(articles.map((article) => article.author))];
}

// ============================================================================
// Complex Query Functions
// ============================================================================

/**
 * Complex article search with multiple filters
 * @param articles - Array of articles
 * @param filters - Filter options (category, author, search query, etc.)
 * @returns Filtered articles
 */
export function filterArticles(
    articles: Article[],
    filters: {
        category?: string;
        author?: string;
        search?: string;
        startDate?: Date;
        endDate?: Date;
    }
): Article[] {
    let filtered = [...articles];

    if (filters.category) {
        filtered = getArticlesByCategory(filtered, filters.category);
    }

    if (filters.author) {
        filtered = getArticlesByAuthor(filtered, filters.author);
    }

    if (filters.search) {
        filtered = searchArticles(filtered, filters.search);
    }

    if (filters.startDate && filters.endDate) {
        filtered = getArticlesByDateRange(
            filtered,
            filters.startDate,
            filters.endDate
        );
    }

    return filtered;
}

/**
 * Get featured articles data (featured + latest)
 * @param articles - Array of articles
 * @param latestCount - Number of latest articles to return
 * @returns Object with featured article and latest articles array
 */
export function getFeaturedArticlesData(
    articles: Article[],
    latestCount: number = 8
) {
    const sorted = sortArticlesByDate(articles);
    return {
        featured: getFeaturedArticle(sorted),
        latest: getLatestArticles(sorted.slice(1), latestCount),
    };
}

/**
 * Get trending articles (based on latest publication)
 * @param articles - Array of articles
 * @param limit - Number of trending articles (default: 5)
 * @returns Array of trending articles
 */
export function getTrendingArticles(articles: Article[], limit: number = 5): Article[] {
    return sortArticlesByDate(articles).slice(0, limit);
}
