/**
 * Core Data Types for NewsWire Application
 * Based on CLAUDE.md specification
 */

// ============================================================================
// Article Related Types
// ============================================================================

export interface Article {
    id: string;
    title: string;
    description: string;
    content: string;
    category: string;
    image: string;
    author: string;
    publishedAt: string;
}

export interface ArticleWithRelations extends Article {
    source: Source;
    categoryData: Category;
}

// ============================================================================
// Category Types
// ============================================================================

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

export const CATEGORIES: Category[] = [
    { id: "1", name: "Technology", slug: "technology" },
    { id: "2", name: "Business", slug: "business" },
    { id: "3", name: "Sports", slug: "sports" },
    { id: "4", name: "Entertainment", slug: "entertainment" },
    { id: "5", name: "Health", slug: "health" },
    { id: "6", name: "Science", slug: "science" },
];

// ============================================================================
// Source Types
// ============================================================================

export interface Source {
    id: string;
    name: string;
    url: string;
    description?: string;
}

export const SOURCES: Source[] = [
    {
        id: "s1",
        name: "TechCrunch",
        url: "https://techcrunch.com",
        description: "Technology news and startup insights",
    },
    {
        id: "s2",
        name: "CNN",
        url: "https://cnn.com",
        description: "International news coverage",
    },
    {
        id: "s3",
        name: "BBC News",
        url: "https://bbc.com/news",
        description: "Global news from BBC",
    },
    {
        id: "s4",
        name: "The New York Times",
        url: "https://nytimes.com",
        description: "In-depth journalism and analysis",
    },
    {
        id: "s5",
        name: "The Guardian",
        url: "https://theguardian.com",
        description: "Independent news organization",
    },
    {
        id: "s6",
        name: "Reuters",
        url: "https://reuters.com",
        description: "International news agency",
    },
];

// ============================================================================
// API Response Types
// ============================================================================

export interface StrapiArticle {
    id: number;
    documentId?: string;
    title: string;
    summary: string;
    url: string;
    publishedAt?: string;
    createdAt?: string;
    updatedAt?: string;
    source?: {
        id: number;
        name: string;
        url: string;
        description?: string;
    };
    category?: {
        id: number;
        name: string;
    };
}

export interface StrapiResponse<T> {
    data: T | T[];
    meta?: {
        pagination?: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

// ============================================================================
// Filter & Query Types
// ============================================================================

export interface ArticleFilter {
    category?: string;
    source?: string;
    search?: string;
    limit?: number;
    offset?: number;
}

export interface FeaturedArticlesResult {
    featured: Article;
    latest: Article[];
}

// ============================================================================
// UI Component Prop Types
// ============================================================================

export interface NewsCardProps {
    article: Article;
    featured?: boolean;
}

export interface CategoryNavProps {
    categories: Category[];
    activeCategory?: string;
}
