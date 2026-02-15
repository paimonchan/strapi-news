# Strapi-to-NextJS Integration Guide

## Architecture Overview

```
Strapi Backend (Headless CMS)
    ↓ REST API
    ↓ (http://localhost:1337/api)
NextJS Frontend (Client)
    ↓ TypeScript Type Safety
    ↓ Data Transformation
    ↓
React Components
```

## Environment Setup

### Backend (Strapi)

**Start the Strapi server:**
```bash
cd D:\Projects\Strapi\strapi-news
npm run develop
# Server runs on http://localhost:1337
```

**Import mock data:**
```bash
npm run import-data
# Creates 30 articles across 6 categories
```

### Frontend (Next.js)

**Start the Next.js server:**
```bash
cd D:\Projects\Nextjs\lazy-nextjs-news
npm run dev
# Server runs on http://localhost:3000
```

## API Integration Points

### 1. Fetching Articles for Home Page

**Strapi Endpoint:**
```
GET http://localhost:1337/api/news?sort=-publishedAt&populate=*
```

**Response Structure:**
```json
{
    "data": [
        {
            "id": 1,
            "attributes": {
                "title": "Article Title",
                "summary": "Article summary",
                "url": "https://source.com/article",
                "publishedAt": "2026-02-15T14:30:00Z",
                "category": {
                    "data": {
                        "id": 1,
                        "attributes": {
                            "name": "Technology"
                        }
                    }
                },
                "source": {
                    "data": {
                        "id": 1,
                        "attributes": {
                            "name": "TechCrunch",
                            "url": "https://techcrunch.com"
                        }
                    }
                }
            }
        }
    ]
}
```

**Next.js Transformation:**
```typescript
// pages/index.tsx or app/page.tsx
async function getArticles() {
    const response = await fetch('http://localhost:1337/api/news?sort=-publishedAt&populate=*');
    const { data } = await response.json();

    return data.map(item => ({
        id: item.id,
        title: item.attributes.title,
        description: item.attributes.summary,
        content: item.attributes.summary,
        category: item.attributes.category.data.attributes.name,
        image: '/placeholder.png',
        author: 'NewsWire',
        publishedAt: item.attributes.publishedAt,
    }));
}
```

### 2. Fetching Articles by Category

**Strapi Endpoint:**
```
GET http://localhost:1337/api/news?filters[category][id][$eq]=1&populate=*
```

**Next.js Usage:**
```typescript
// app/category/[slug]/page.tsx
async function getCategoryArticles(slug: string) {
    // Map slug to category ID
    const categoryMap: Record<string, string> = {
        'technology': '1',
        'business': '2',
        'sports': '3',
        'entertainment': '4',
        'health': '5',
        'science': '6',
    };

    const categoryId = categoryMap[slug];
    const response = await fetch(
        `http://localhost:1337/api/news?filters[category][id][$eq]=${categoryId}&populate=*`
    );
    const { data } = await response.json();
    return transformArticles(data);
}
```

### 3. Fetching Single Article

**Strapi Endpoint:**
```
GET http://localhost:1337/api/news/1?populate=*
```

**Next.js Usage:**
```typescript
// app/article/[id]/page.tsx
async function getArticle(id: string) {
    const response = await fetch(
        `http://localhost:1337/api/news/${id}?populate=*`
    );
    const { data } = await response.json();
    return transformArticle(data);
}
```

## Data Transformation Helper

Create a utility file to handle API responses:

**`src/lib/strapi.ts`**
```typescript
interface StrapiArticle {
    id: number;
    attributes: {
        title: string;
        summary: string;
        url: string;
        publishedAt: string;
        category: {
            data: {
                id: number;
                attributes: {
                    name: string;
                };
            };
        };
        source: {
            data: {
                id: number;
                attributes: {
                    name: string;
                    url: string;
                };
            };
        };
    };
}

export function transformArticle(strapiArticle: StrapiArticle) {
    const attrs = strapiArticle.attributes;
    return {
        id: strapiArticle.id.toString(),
        title: attrs.title,
        description: attrs.summary,
        content: attrs.summary, // Use summary for content if full content unavailable
        category: attrs.category.data.attributes.name,
        image: '/images/placeholder.png',
        author: attrs.source.data.attributes.name,
        publishedAt: attrs.publishedAt,
    };
}

export async function fetchArticles(filters?: Record<string, any>) {
    const params = new URLSearchParams();
    params.append('populate', '*');
    params.append('sort', '-publishedAt');

    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            params.append(`filters[${key}]`, value);
        });
    }

    const response = await fetch(
        `http://localhost:1337/api/news?${params.toString()}`
    );

    if (!response.ok) throw new Error('Failed to fetch articles');

    const { data } = await response.json();
    return data.map(transformArticle);
}
```

## API Query Patterns

### Get Latest 5 Articles
```typescript
const articles = await fetchArticles();
const latest = articles.slice(0, 5);
```

### Get Articles for Specific Category
```typescript
const techArticles = await fetchArticles({ 'category[id][$eq]': '1' });
```

### Get Articles with Pagination
```typescript
const response = await fetch(
    'http://localhost:1337/api/news?pagination[page]=1&pagination[pageSize]=10&populate=*'
);
```

### Search Articles
```typescript
const response = await fetch(
    'http://localhost:1337/api/news?filters[title][$contains]=AI&populate=*'
);
```

## Type Safety

### Extend TypeScript Types

**`types/strapi.ts`**
```typescript
// Strapi-specific response types
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

// Map between Strapi API and Frontend Article type
export interface ApiArticle extends Article {
    source: Source;
    categoryData: Category;
}
```

## Common Scenarios

### Scenario 1: Display Featured + Latest on Home Page

```typescript
// app/page.tsx
async function HomePage() {
    const articles = await fetchArticles();
    const featured = articles[0];
    const latest = articles.slice(1, 9);

    return (
        <div>
            <FeaturedArticle article={featured} />
            <LatestArticles articles={latest} />
        </div>
    );
}
```

### Scenario 2: Category Page with Filtering

```typescript
// app/category/[slug]/page.tsx
async function CategoryPage({ params }: { params: { slug: string } }) {
    const slug = params.slug;
    const categoryId = getCategoryId(slug);
    const articles = await fetchArticles({
        'category[id][$eq]': categoryId.toString(),
    });

    return (
        <div>
            <h1>{capitalize(slug)}</h1>
            <ArticleGrid articles={articles} />
        </div>
    );
}
```

### Scenario 3: Article Detail Page

```typescript
// app/article/[id]/page.tsx
async function ArticleDetailPage({ params }: { params: { id: string } }) {
    const article = await fetchArticle(params.id);

    if (!article) {
        notFound();
    }

    return (
        <article>
            <h1>{article.title}</h1>
            <ArticleContent article={article} />
        </article>
    );
}
```

## Error Handling

```typescript
async function fetchWithErrorHandling(url: string) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}
```

## Performance Optimization

### 1. Caching

```typescript
// Next.js 13+ App Router
import { revalidateTag } from 'next/cache';

async function fetchArticles() {
    const response = await fetch(
        'http://localhost:1337/api/news',
        { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    return response.json();
}
```

### 2. Selective Population

Only fetch related data when needed:

```typescript
// Get only articles with minimal data
const response = await fetch('http://localhost:1337/api/news');

// Get articles with relationships
const response = await fetch('http://localhost:1337/api/news?populate=*');

// Get articles with specific relations
const response = await fetch(
    'http://localhost:1337/api/news?populate[category]=true&populate[source]=true'
);
```

### 3. Pagination

```typescript
async function getPaginatedArticles(page = 1, pageSize = 10) {
    const response = await fetch(
        `http://localhost:1337/api/news?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*`
    );
    const { data, meta } = await response.json();
    return {
        articles: data.map(transformArticle),
        pagination: meta.pagination,
    };
}
```

## Static Generation with Strapi Data

### Generate Static Params

```typescript
// app/category/[slug]/page.tsx
export async function generateStaticParams() {
    return [
        { slug: 'technology' },
        { slug: 'business' },
        { slug: 'sports' },
        { slug: 'entertainment' },
        { slug: 'health' },
        { slug: 'science' },
    ];
}
```

### Generate Dynamic Article Pages

```typescript
// app/article/[id]/page.tsx
export async function generateStaticParams() {
    const articles = await fetchArticles();
    return articles.map((article) => ({
        id: article.id,
    }));
}
```

## Development Workflow

### 1. Create Content in Strapi
- Go to http://localhost:1337/admin
- Create/modify articles, categories, sources
- Publish content

### 2. Test API in Browser
- Visit http://localhost:1337/api/news
- Verify data structure

### 3. Update Next.js Frontend
- Fetch from API
- Transform data using utilities
- Render in components

### 4. Build & Deploy
```bash
# Frontend
npm run build
npm run start

# Backend (Strapi)
npm run build
npm run start
```

## Troubleshooting

### Issue: CORS Errors

**Solution:** Configure Strapi CORS in `config/middlewares.ts`:
```typescript
export default [
    'strapi::errors',
    {
        name: 'strapi::cors',
        config: {
            origin: ['http://localhost:3000'],
            credentials: true,
        },
    },
];
```

### Issue: Data Not Appearing

**Solution:**
1. Check if content is published (not in draft)
2. Verify API endpoint with `?populate=*`
3. Check Strapi API permissions

### Issue: Slow Queries

**Solution:**
1. Use pagination
2. Limit population of relations
3. Add database indexes

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database backups
- [ ] CORS settings updated
- [ ] API authentication (if needed)
- [ ] Static generation optimized
- [ ] Image CDN configured
- [ ] SEO metadata configured
- [ ] Error handling implemented
- [ ] Caching strategy in place
- [ ] Performance tested

## Resources

- [Strapi REST API Documentation](https://docs.strapi.io/developer-docs/latest/api/rest-api.html)
- [Next.js Data Fetching](https://nextjs.org/docs/basic-features/data-fetching)
- [Strapi Filtering & Pagination](https://docs.strapi.io/developer-docs/latest/api/rest-api.html#filters)
