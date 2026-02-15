# NewsWire Backend - Strapi v5 Headless CMS

## Project Overview

NewsWire Backend is a headless CMS built with **Strapi v5**, designed to manage and serve news articles, categories, and sources. It provides RESTful APIs for a news application with comprehensive data structure, relationships, and queries. Built with TypeScript for type safety and modern development experience.

## Tech Stack

- **Framework**: Strapi v5.36.0 (Headless CMS)
- **Language**: TypeScript
- **Database**: SQLite (development) or PostgreSQL (production)
- **API**: REST API with JSON responses
- **Build Tool**: TypeScript compiler with auto-compilation on changes
- **Documentation**: Auto-generated Strapi API documentation at `/documentation`

## Project Structure

```
D:\Projects\Strapi\strapi-news/
├── config/                          # Strapi TypeScript configuration
│   ├── admin.ts                     # Admin panel settings
│   ├── api.ts                       # API settings
│   ├── database.ts                  # Database configuration (SQLite default)
│   ├── server.ts                    # Server settings
│   ├── middlewares.ts               # Middleware configuration
│   └── plugins.ts                   # Plugin settings (Users & Permissions, etc)
├── src/
│   ├── api/                         # API collections (auto-compiled to dist/)
│   │   ├── news/                    # News articles collection
│   │   │   ├── content-types/
│   │   │   │   └── news/
│   │   │   │       └── schema.json  # Article schema definition
│   │   │   ├── controllers/
│   │   │   │   └── news.ts          # Core API handlers (auto-generated)
│   │   │   ├── services/
│   │   │   │   └── news.ts          # Business logic (auto-generated)
│   │   │   └── routes/
│   │   │       └── news.ts          # Route definitions (auto-generated)
│   │   ├── category/                # Categories collection
│   │   │   ├── content-types/
│   │   │   │   └── category/
│   │   │   │       └── schema.json
│   │   │   ├── controllers/
│   │   │   │   └── category.ts
│   │   │   ├── services/
│   │   │   │   └── category.ts
│   │   │   └── routes/
│   │   │       └── category.ts
│   │   └── source/                  # Sources collection
│   │       ├── content-types/
│   │       │   └── source/
│   │       │       └── schema.json
│   │       ├── controllers/
│   │       │   └── source.ts
│   │       ├── services/
│   │       │   └── source.ts
│   │       └── routes/
│   │           └── source.ts
│   ├── extensions/                  # Plugin extensions
│   ├── index.ts                     # Strapi bootstrap
│   └── admin/                       # Admin panel customization
├── dist/                            # Compiled TypeScript output
│   └── src/                         # Auto-generated on start
├── .tmp/
│   └── data.db                      # SQLite database file
├── public/
│   └── uploads/                     # Uploaded files storage
├── scripts/
│   ├── import-data.js               # Data import script (30 articles)
│   └── check-api.js                 # API health check
├── types/
│   ├── index.ts                     # Custom TypeScript interfaces
│   └── generated/                   # Auto-generated Strapi types
├── src/lib/
│   └── data-utils.ts                # 40+ data utility functions
├── .env                             # Environment variables
├── .env.example                     # Example env file
├── package.json
├── tsconfig.json
├── CLAUDE.md                        # Project documentation
├── DATA_STRUCTURE.md                # Data model reference
├── INTEGRATION_GUIDE.md             # Frontend integration
├── TROUBLESHOOTING.md               # Common issues & fixes
└── README.md
```

## Data Model

### Article Collection (`news`)

#### Schema Definition
```json
{
  "kind": "collectionType",
  "collectionName": "news_items",
  "attributes": {
    "title": "string (required, 3-250 chars)",
    "summary": "text (required)",
    "url": "string (required, unique, URL format)",
    "publishedAt": "datetime",
    "source": "relation (manyToOne → sources)",
    "category": "relation (manyToOne → categories)"
  }
}
```

#### TypeScript Interface
```typescript
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
```

#### Sample Article Object
```json
{
  "id": "1",
  "title": "Breakthrough AI Technology Unveiled",
  "description": "Revolutionary AI system shows unprecedented capabilities",
  "content": "Full article content here...",
  "category": "Technology",
  "image": "/images/article-1.jpg",
  "author": "Jane Doe",
  "publishedAt": "2026-02-15T14:30:00Z"
}
```

### Category Collection (`categories`)

#### Schema
```json
{
  "kind": "collectionType",
  "collectionName": "categories",
  "attributes": {
    "name": "string (required, unique, 2-100 chars)",
    "news_articles": "relation (oneToMany → news)"
  }
}
```

#### Available Categories
- Technology
- Business
- Sports
- Entertainment
- Health
- Science

### Source Collection (`sources`)

#### Schema
```json
{
  "kind": "collectionType",
  "collectionName": "sources",
  "attributes": {
    "name": "string (required, unique, 2-100 chars)",
    "url": "string (required, unique, URL format)",
    "description": "text",
    "news_articles": "relation (oneToMany → news)"
  }
}
```

#### Available Sources
- TechCrunch
- CNN
- BBC News
- The New York Times
- The Guardian
- Reuters

## API Endpoints

### News Articles

```
GET    /api/news-articles                           # Get all published articles
GET    /api/news-articles?filters[category][id]=1   # Filter by category ID
GET    /api/news-articles?populate=*                # Include related data
GET    /api/news-articles/:id                       # Get single article
POST   /api/news-articles                           # Create article (requires token)
PUT    /api/news-articles/:id                       # Update article (requires token)
DELETE /api/news-articles/:id                       # Delete article (requires token)
```

### Categories

```
GET    /api/categories                    # Get all published categories
GET    /api/categories/:id               # Get single category
POST   /api/categories                    # Create (requires token)
PUT    /api/categories/:id               # Update (requires token)
DELETE /api/categories/:id               # Delete (requires token)
```

### Sources

```
GET    /api/sources                       # Get all published sources
GET    /api/sources/:id                  # Get single source
POST   /api/sources                       # Create (requires token)
PUT    /api/sources/:id                  # Update (requires token)
DELETE /api/sources/:id                  # Delete (requires token)
```

### Permissions (v5)

Strapi v5 has **draft & publish enabled by default** and requires explicit public permissions.

**To enable public API access:**
1. Admin panel: **Settings → Users & Permissions → Roles → Public**
2. Check `find` and `findOne` for News, Category, Source
3. Save

After enabling, all GET endpoints return `{"data": []}` when empty (instead of 404).

## Helper Functions (src/lib/data-utils.ts)

### Article Retrieval
- `getArticlesByCategory(articles, category)` - Filter articles by category
- `getArticleById(articles, id)` - Get single article by ID
- `getFeaturedArticle(articles)` - Get featured (newest) article
- `getLatestArticles(articles, count)` - Get N latest articles

### Sorting & Filtering
- `sortArticlesByDate(articles)` - Sort by publication date
- `sortArticlesByTitle(articles)` - Sort alphabetically
- `searchArticles(articles, query)` - Search by title/description
- `getArticlesByAuthor(articles, author)` - Filter by author
- `getArticlesByDateRange(articles, start, end)` - Filter by date range

### Pagination
- `paginateArticles(articles, page, pageSize)` - Paginate results
- `getPaginationInfo(total, pageSize, page)` - Get pagination metadata

### Aggregation
- `groupArticlesByCategory(articles)` - Group by category
- `groupArticlesByAuthor(articles)` - Group by author
- `getArticleCountByCategory(articles)` - Count by category
- `getUniqueCategoriesFromArticles(articles)` - Extract unique categories
- `getUniqueAuthorsFromArticles(articles)` - Extract unique authors

### Complex Queries
- `filterArticles(articles, filters)` - Multi-filter search
- `getFeaturedArticlesData(articles, latestCount)` - Featured + latest
- `getTrendingArticles(articles, limit)` - Get trending articles

## Key Features

### Draft & Publish
- All content types support draft/publish workflow
- Articles can be saved as drafts before publishing
- Published content is automatically available via API

### Relationships
- Articles link to Categories and Sources
- One-to-many relationships for aggregation
- Automatic relationship management

### Data Validation
- Title: required, 3-250 characters
- URL: required, unique, valid URL format
- Categories/Sources: required, unique names
- Published dates tracked automatically

### API Features
- RESTful endpoints for CRUD operations
- JSON response format
- Pagination support
- Filtering and sorting capabilities
- Draft/Publish content management

## Database

### SQLite (Development)
- Stored in `database/sqlite.db`
- Automatic schema creation
- Suitable for development and testing

### PostgreSQL (Production)
- Configure in `config/database.ts`
- Better performance for large datasets
- Advanced querying capabilities

## Data Import

### Using the Import Script

```bash
npm run import-data
```

Or execute directly:
```bash
node scripts/import-data.js
```

This script creates:
- 6 news sources
- 6 news categories
- 25+ news articles across all categories

### Script Features
- Creates sources, categories, then articles
- Maintains relationships between entities
- Logs progress with success indicators
- Error handling and reporting

## Development

### Commands

```bash
npm run develop          # Start dev server with TypeScript hot reload (localhost:1337)
npm run build            # Compile TypeScript to dist/ folder
npm run start            # Start production server (requires build first)
npm run import-data      # Import 30 mock articles across 6 categories
npm run check-api        # Health check for all API endpoints
npm run console          # Interactive Strapi console
npm run strapi upgrade   # Upgrade Strapi to latest version
```

### Key Development Features

- **Hot Reload**: TypeScript files automatically recompile on change
- **Auto-migration**: Database schema updates automatically
- **Admin Panel**: http://localhost:1337/admin (create admin user on first run)
- **API Documentation**: http://localhost:1337/documentation (Swagger/OpenAPI)
- **Type Safety**: Full TypeScript support with auto-generated types

### Environment Variables

The `.env` file is automatically generated with secure defaults:

```env
HOST=0.0.0.0
PORT=1337

# Database (SQLite by default, configured in config/database.ts)
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# Secrets (auto-generated on first run)
APP_KEYS=...
ADMIN_JWT_SECRET=...
JWT_SECRET=...
API_TOKEN_SALT=...
ENCRYPTION_KEY=...
TRANSFER_TOKEN_SALT=...
```

To change database to PostgreSQL, update `config/database.ts` and set env vars:
```env
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=user
DATABASE_PASSWORD=password
```

### Adding New Content Types

1. Use Strapi admin panel (http://localhost:1337/admin) → Content-type builder
2. Create new collection type with required fields
3. Schema stored in `src/api/[name]/content-types/[name]/schema.json`
4. Strapi auto-generates controllers, services, and routes
5. TypeScript files in `src/api/[name]/` are compiled to `dist/` on save
6. API endpoint becomes: `/api/[pluralName]`

### Extending with Custom Logic

1. Edit files in `src/api/[name]/`
   - **services/**: Business logic and data transformations
   - **controllers/**: Request handlers (HTTP layer)
   - **routes/**: Custom route definitions
2. Use Strapi factories:
   ```typescript
   import { factories } from '@strapi/strapi';

   export default factories.createCoreService('api::my-type.my-type');
   ```
3. Files auto-compile on save

### Public API Access (Strapi v5)

By default, content requires authentication. To allow public access:

1. Admin panel → **Settings → Users & Permissions plugin → Roles → Public**
2. Expand each content type (News, Category, Source)
3. Check: `find` (list) and `findOne` (single item)
4. Click **Save**

After enabling, GET endpoints return `{"data": []}` when empty instead of 404.

## Admin Panel

Access at: **http://localhost:1337/admin**

### First Time Setup
1. Start server: `npm run develop`
2. Open http://localhost:1337/admin
3. Create admin account (email + password)
4. Login to dashboard

### Admin Features
- **Content Manager**: Visual CRUD for all content types
- **Content-type Builder**: Create/modify content types
- **Users & Permissions**: Manage roles and API access
- **Media Library**: Upload and manage images/files
- **Draft/Publish**: Save as draft before publishing
- **Settings**: Configure plugins, database, security
- **API Tokens**: Generate tokens for programmatic access

### Important v5 Notes
- All content types have draft/publish enabled by default
- Public role is auto-created but with no permissions
- Enable public permissions for API access (see "Public API Access" section)
- Admin users have full access automatically

## API Documentation

Auto-generated interactive API documentation:
- Swagger/OpenAPI: `http://localhost:1337/documentation`
- GraphQL (if enabled): `http://localhost:1337/graphql`

## Best Practices

### When Making Changes
- Test API endpoints after schema modifications
- Validate relationship integrity
- Use draft mode before publishing
- Monitor database migrations

### Data Management
- Keep URLs unique for articles
- Use consistent category naming
- Maintain source information current
- Archive old articles instead of deleting

### Performance
- Index frequently queried fields
- Optimize media file sizes
- Use pagination for large datasets
- Cache API responses when possible

### Security
- Never commit API tokens
- Use environment variables for secrets
- Enable authentication for write operations
- Regularly review user permissions

## Deployment

### Vercel
```bash
npm run build
npm run start
```

### Self-Hosted
1. Install Node.js and PostgreSQL
2. Clone repository
3. Configure database connection
4. Run migrations
5. Start server

### Environment Setup
```env
# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=newswire
DATABASE_USERNAME=user
DATABASE_PASSWORD=password

# API
ADMIN_JWT_SECRET=secret
JWT_SECRET=secret
API_TOKEN_SALT=salt
```

## Troubleshooting

### Common Issues

**API returns 404 for all endpoints**
- Ensure TypeScript files (`.ts`) exist in `src/api/[name]/controllers|services|routes/`
- Restart server: `npm run develop`
- Check `dist/` folder was generated with compiled files
- See `TROUBLESHOOTING.md` for detailed fixes

**Endpoints return 404 when empty (no published content)**
- This is Strapi v5 default behavior
- Enable public permissions: Settings → Users & Permissions → Roles → Public
- Check `find` and `findOne` for News, Category, Source
- See "Public API Access" section above

**Import script fails**
- Ensure server is running: `npm run develop`
- Check if `.tmp/data.db` exists and is writable
- Run health check: `node scripts/check-api.js`
- Verify `/api/news-articles`, `/api/categories`, `/api/sources` are accessible

**TypeScript compilation errors**
- Clear dist: `rm -rf dist .cache`
- Reinstall: `npm install`
- Restart: `npm run develop`

See `TROUBLESHOOTING.md` for more solutions.

## File Format & TypeScript Note

**Important:** All API files (controllers, services, routes) must be TypeScript (`.ts`), not JavaScript (`.js`).

```typescript
// ✅ Correct (src/api/news/controllers/news.ts)
import { factories } from '@strapi/strapi';
export default factories.createCoreController('api::news.news');

// ❌ Wrong (would not be compiled)
module.exports = require('@strapi/strapi').factories.createCoreController('api::news.news');
```

TypeScript files in `src/` auto-compile to `dist/` on save. JavaScript files are ignored by the compiler.

## Future Enhancements

Consider adding:
- Advanced search with Elasticsearch
- Image optimization and CDN integration
- Caching layer (Redis)
- GraphQL API alongside REST
- Real-time updates with WebSockets
- Analytics integration
- User comments system
- End-user authentication
- Multi-language support (i18n)
- Article recommendations engine
- Social media integration
- Email notifications

## Resources

- [Strapi Documentation](https://docs.strapi.io)
- [Strapi Community](https://discord.strapi.io)
- [REST API Documentation](http://localhost:1337/documentation)
- [TypeScript Support](https://docs.strapi.io/developer-docs/getting-started/typescript)
