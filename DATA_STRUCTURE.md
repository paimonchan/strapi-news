# PMC News Data Structure Reference

## Overview

This document outlines the complete data structure for the PMC News application, showing how data flows from the Strapi backend to the Next.js frontend.

## Data Model Architecture

```
STRAPI BACKEND (API Server)
    │
    ├── Collection: sources
    │   └── Fields: id, name, url, description
    │
    ├── Collection: categories
    │   └── Fields: id, name
    │
    └── Collection: news (articles)
        ├── Fields: id, title, summary, url, publishedAt
        ├── Relation: source (manyToOne)
        └── Relation: category (manyToOne)
             │
             ▼
    REST API Endpoints
             │
             ▼
NEXT.JS FRONTEND (Client)
    │
    └── TypeScript Types
        └── Article, Category, Source
```

## Core TypeScript Types

### Article Type
```typescript
interface Article {
    id: string;                 // Unique identifier
    title: string;              // Article headline (3-250 chars)
    description: string;        // Short summary
    content: string;            // Full article content
    category: string;           // Category name (Tech, Business, etc)
    image: string;              // Image URL or path
    author: string;             // Author name
    publishedAt: string;        // ISO 8601 datetime
}
```

### Category Type
```typescript
interface Category {
    id: string;                 // Unique identifier
    name: string;               // Category name (unique, 2-100 chars)
    slug: string;               // URL-friendly version
    description?: string;       // Optional category description
}
```

### Source Type
```typescript
interface Source {
    id: string;                 // Unique identifier
    name: string;               // Source name (unique, 2-100 chars)
    url: string;                // Website URL (unique, valid format)
    description?: string;       // Optional description
}
```

## Available Categories

| ID | Name | Slug | Purpose |
|--|--|--|--|
| 1 | Technology | technology | Tech news, startups, AI, gadgets |
| 2 | Business | business | Markets, companies, economics |
| 3 | Sports | sports | Games, athletes, competitions |
| 4 | Entertainment | entertainment | Movies, music, celebrities |
| 5 | Health | health | Medicine, fitness, wellness |
| 6 | Science | science | Research, space, discoveries |

## Available News Sources

| ID | Name | URL |
|--|--|--|
| s1 | TechCrunch | https://techcrunch.com |
| s2 | CNN | https://cnn.com |
| s3 | BBC News | https://bbc.com/news |
| s4 | The New York Times | https://nytimes.com |
| s5 | The Guardian | https://theguardian.com |
| s6 | Reuters | https://reuters.com |

## Data Flow Examples

### Example 1: Creating an Article

**POST /api/news**
```json
{
    "data": {
        "title": "New AI Model Breaks Records",
        "summary": "Latest AI achieves unprecedented performance",
        "url": "https://techcrunch.com/article-123",
        "publishedAt": "2026-02-15T14:30:00Z",
        "source": 1,  // Source ID
        "category": 1  // Category ID
    }
}
```

**Response:**
```json
{
    "data": {
        "id": 25,
        "attributes": {
            "title": "New AI Model Breaks Records",
            "summary": "Latest AI achieves unprecedented performance",
            "url": "https://techcrunch.com/article-123",
            "publishedAt": "2026-02-15T14:30:00Z",
            "source": {
                "data": {
                    "id": 1,
                    "attributes": {
                        "name": "TechCrunch",
                        "url": "https://techcrunch.com"
                    }
                }
            },
            "category": {
                "data": {
                    "id": 1,
                    "attributes": {
                        "name": "Technology"
                    }
                }
            }
        }
    }
}
```

### Example 2: Retrieving Articles by Category

**GET /api/news?filters[category]=1**

Response contains articles where category ID is 1 (Technology)

### Example 3: Search Articles

**GET /api/news?filters[title][$contains]=AI**

Returns articles with "AI" in the title

## Data Import Statistics

When running `npm run import-data`, the following data is created:

### Sources Created: 6
```
✓ TechCrunch
✓ CNN
✓ BBC News
✓ The New York Times
✓ The Guardian
✓ Reuters
```

### Categories Created: 6
```
✓ Technology (5 articles)
✓ Business (5 articles)
✓ Sports (5 articles)
✓ Entertainment (5 articles)
✓ Health (5 articles)
✓ Science (5 articles)
```

### Total Articles: 30
- Evenly distributed across 6 categories
- 5 articles per category
- Unique titles and URLs
- Realistic publication dates within February 2026

## Database Schema

### news_items Table
```sql
CREATE TABLE news_items (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    documentId VARCHAR(255) UNIQUE,
    title VARCHAR(250) NOT NULL,
    summary TEXT NOT NULL,
    url VARCHAR(255) UNIQUE NOT NULL,
    publishedAt DATETIME,
    source_id INTEGER,
    category_id INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    publishedAt_live DATETIME,
    FOREIGN KEY (source_id) REFERENCES sources(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### categories Table
```sql
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    documentId VARCHAR(255) UNIQUE,
    name VARCHAR(100) UNIQUE NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    publishedAt_live DATETIME
);
```

### sources Table
```sql
CREATE TABLE sources (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    documentId VARCHAR(255) UNIQUE,
    name VARCHAR(100) UNIQUE NOT NULL,
    url VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    publishedAt_live DATETIME
);
```

## API Query Examples

### Get All Articles
```bash
curl http://localhost:1337/api/news
```

### Get Articles by Category
```bash
curl http://localhost:1337/api/news?filters[category][id][$eq]=1
```

### Get Single Article
```bash
curl http://localhost:1337/api/news/1
```

### Populate Relations
```bash
curl http://localhost:1337/api/news?populate=*
```

### Pagination
```bash
curl http://localhost:1337/api/news?pagination[page]=1&pagination[pageSize]=10
```

### Sort by Date
```bash
curl http://localhost:1337/api/news?sort=publishedAt:desc
```

## Utility Functions for Data Manipulation

### Retrieval Functions
```typescript
getArticlesByCategory(articles, "Technology")    // Filter by category
getArticleById(articles, "1")                    // Get single article
getFeaturedArticle(articles)                     // Get newest article
getLatestArticles(articles, 8)                   // Get 8 latest
```

### Sorting Functions
```typescript
sortArticlesByDate(articles)                     // Sort by date (newest first)
sortArticlesByTitle(articles)                    // Sort alphabetically
```

### Search & Filter Functions
```typescript
searchArticles(articles, "AI")                   // Full-text search
getArticlesByAuthor(articles, "Jane Doe")        // Filter by author
getArticlesByDateRange(articles, start, end)     // Filter by date range
filterArticles(articles, {                       // Complex filtering
    category: "Technology",
    author: "John Smith",
    search: "breakthrough"
})
```

### Aggregation Functions
```typescript
groupArticlesByCategory(articles)                // Group by category
getArticleCountByCategory(articles)              // Count per category
getUniqueCategoriesFromArticles(articles)        // Extract unique categories
```

### Pagination Functions
```typescript
paginateArticles(articles, 1, 10)                // Get page 1, 10 items
getPaginationInfo(total, 10, 1)                  // Pagination metadata
```

## Data Validation Rules

### Article Fields
| Field | Type | Required | Constraints |
|--|--|--|--|
| title | String | Yes | 3-250 characters |
| summary | Text | Yes | No length limit |
| url | String | Yes | Valid URL, must be unique |
| publishedAt | DateTime | No | ISO 8601 format |
| source | Relation | Yes | Foreign key to sources |
| category | Relation | Yes | Foreign key to categories |

### Category Fields
| Field | Type | Required | Constraints |
|--|--|--|--|
| name | String | Yes | 2-100 characters, unique |

### Source Fields
| Field | Type | Required | Constraints |
|--|--|--|--|
| name | String | Yes | 2-100 characters, unique |
| url | String | Yes | Valid URL, must be unique |
| description | Text | No | No length limit |

## Draft & Publish Workflow

All collections support draft/publish:

### Draft Article
```json
{
    "title": "Draft Article",
    "summary": "This article is not yet published",
    "url": "https://example.com/draft",
    "source": 1,
    "category": 1
    // Article won't appear in published queries until explicitly published
}
```

### Publish Article
Admin can publish draft via Strapi UI or API with proper authentication.

## Performance Considerations

### Indexing
- Create indexes on frequently queried fields:
  - `articles.category_id`
  - `articles.source_id`
  - `articles.publishedAt`
  - `categories.name`
  - `sources.name`

### Pagination
- Use pagination for large result sets
- Default: 25 items per page
- Max: 1000 items per page (configurable)

### Relationships
- Use `populate` parameter to fetch related data
- Avoid N+1 queries by populating in single request

## File Structure Summary

```
types/index.ts                       # All TypeScript interfaces and types
src/lib/data-utils.ts               # 40+ utility functions for data manipulation
scripts/import-data.js               # Script to create initial data (30 articles)
src/api/
├── news/schema.json                # Article content type definition
├── category/schema.json            # Category content type definition
└── source/schema.json              # Source content type definition
```

## Integration with Next.js Frontend

The Strapi API is consumed by the Next.js frontend:

1. **Frontend fetches from**: `http://localhost:1337/api/`
2. **Transforms data** using types in `types/index.ts`
3. **Uses utility functions** from `src/lib/data-utils.ts`
4. **Displays in components** with proper TypeScript types

### Example Frontend Integration
```typescript
// Next.js API route or Server Component
const response = await fetch('http://localhost:1337/api/news?populate=*');
const articles = response.data.map(article => ({
    id: article.id,
    title: article.attributes.title,
    category: article.attributes.category.data.attributes.name,
    source: article.attributes.source.data.attributes.name,
    // ... map other fields
}));
```
