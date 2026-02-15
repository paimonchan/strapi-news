# NewsWire Quick Reference Card

## Quick Commands

```bash
# Start Backend
npm run develop          # http://localhost:1337

# Import Data
npm run import-data      # Creates 30 articles

# Admin Panel
# http://localhost:1337/admin

# API Docs
# http://localhost:1337/documentation
```

## Data Types

### Article
```typescript
{
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  image: string;
  author: string;
  publishedAt: string;
}
```

### Categories
| ID | Name |
|----|------|
| 1 | Technology |
| 2 | Business |
| 3 | Sports |
| 4 | Entertainment |
| 5 | Health |
| 6 | Science |

### Sources (6 total)
TechCrunch, CNN, BBC News, NY Times, The Guardian, Reuters

## API Quick Links

```
GET  /api/news                             # All articles
GET  /api/news?filters[category]=1         # By category
GET  /api/news/:id                         # Single article
POST /api/news                             # Create
```

## Most Used Utility Functions

```typescript
// Get articles
getArticlesByCategory(articles, "Technology")
getArticleById(articles, "1")
getLatestArticles(articles, 5)
getFeaturedArticle(articles)

// Search & Filter
searchArticles(articles, "AI")
filterArticles(articles, { category: "Tech", search: "AI" })

// Sort
sortArticlesByDate(articles)
sortArticlesByTitle(articles)

// Pagination
paginateArticles(articles, 1, 10)

// Group
groupArticlesByCategory(articles)
getArticleCountByCategory(articles)
```

## Project Files Map

| File | Purpose |
|------|---------|
| `types/index.ts` | TypeScript interfaces |
| `src/lib/data-utils.ts` | 40+ utility functions |
| `scripts/import-data.js` | Data import (30 articles) |
| `CLAUDE.md` | Full documentation |
| `DATA_STRUCTURE.md` | Data model details |
| `INTEGRATION_GUIDE.md` | Frontend integration |

## Ports

| Service | Port | URL |
|---------|------|-----|
| Strapi Backend | 1337 | http://localhost:1337 |
| Next.js Frontend | 3000 | http://localhost:3000 |

## Database

- **Type**: SQLite (development)
- **File**: `database/sqlite.db`
- **Tables**: news_items, categories, sources

## Common Queries

### Get Latest 5 Articles
```
GET /api/news?sort=-publishedAt&pagination[pageSize]=5&populate=*
```

### Get Tech Articles
```
GET /api/news?filters[category][id][$eq]=1&populate=*
```

### Search for "AI"
```
GET /api/news?filters[title][$contains]=AI&populate=*
```

### Paginate Results
```
GET /api/news?pagination[page]=1&pagination[pageSize]=10&populate=*
```

## Import Script Output

```
🚀 Starting data import for NewsWire...

📰 Creating news sources...
✓ Created sources: 6 entries
✓ Created categories: 6 entries
✓ Created news: 30 articles

✅ Data import completed successfully!
📊 Summary: 30 articles imported
```

## File Locations

```
Backend: D:\Projects\Strapi\strapi-news
Frontend: D:\Projects\Nextjs\lazy-nextjs-news

Types:     types/index.ts
Utils:     src/lib/data-utils.ts
Data:      scripts/import-data.js
Docs:      CLAUDE.md, DATA_STRUCTURE.md
```

## Data Distribution

✓ 30 Articles
✓ 6 Categories (5 articles each)
✓ 6 News Sources
✓ 100% Type Safe

## API Response Example

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "Article Title",
        "summary": "Summary text",
        "url": "https://...",
        "publishedAt": "2026-02-15T14:30:00Z",
        "category": {
          "data": {
            "id": 1,
            "attributes": { "name": "Technology" }
          }
        }
      }
    }
  ]
}
```

## Type Imports

```typescript
import type {
  Article,
  Category,
  Source,
  ArticleWithRelations,
  StrapiArticle,
  ArticleFilter,
} from '@/types';
```

## Utility Function Imports

```typescript
import {
  getArticlesByCategory,
  getLatestArticles,
  searchArticles,
  filterArticles,
  paginateArticles,
  groupArticlesByCategory,
} from '@/lib/data-utils';
```

## Setup Checklist

- [ ] Run `npm install`
- [ ] Start with `npm run develop`
- [ ] Run `npm run import-data`
- [ ] Check http://localhost:1337/api/news
- [ ] Access admin at http://localhost:1337/admin
- [ ] Connect frontend to API
- [ ] Test filtering by category
- [ ] Test pagination

## Common Issues

| Issue | Solution |
|-------|----------|
| Port in use | Kill process or use different port |
| No data | Run `npm run import-data` |
| CORS error | Check config/middlewares.ts |
| API 404 | Ensure content is published |
| Type errors | Import from `types/index.ts` |

## Performance Tips

1. Use pagination: `?pagination[pageSize]=10`
2. Populate selectively: `?populate=category,source`
3. Sort efficiently: `?sort=-publishedAt`
4. Filter early: Use API filters, not client-side
5. Cache responses: Use Next.js cache directives

## Documentation

📄 **CLAUDE.md** - Full project documentation
📄 **DATA_STRUCTURE.md** - Data model and schemas
📄 **INTEGRATION_GUIDE.md** - Frontend integration patterns
📄 **PROJECT_SUMMARY.md** - Complete project overview
📄 **QUICK_REFERENCE.md** - This cheat sheet

## Key Statistics

- **Articles**: 30
- **Categories**: 6
- **Sources**: 6
- **Utility Functions**: 40+
- **TypeScript Interfaces**: 10+
- **API Endpoints**: 9

## Next Steps

1. ✓ Strapi backend set up
2. ✓ Data structure defined
3. ✓ 30 articles imported
4. → Connect frontend API
5. → Test all features
6. → Deploy to production
