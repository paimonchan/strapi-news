# NewsWire Backend - Strapi Headless CMS

## Project Overview

NewsWire Backend is a headless CMS built with Strapi, designed to manage and serve news articles, categories, and sources. It provides RESTful APIs for a news application with comprehensive data structure, relationships, and queries.

## Tech Stack

- **Framework**: Strapi v4+ (Headless CMS)
- **Database**: SQLite (default) or PostgreSQL (production)
- **Language**: JavaScript/TypeScript
- **API**: REST API with JSON responses
- **Documentation**: Auto-generated Strapi API documentation

## Project Structure

```
D:\Projects\Strapi\strapi-news/
├── config/                          # Strapi configuration files
│   ├── admin.ts                     # Admin panel settings
│   ├── api.ts                       # API settings
│   ├── database.ts                  # Database configuration
│   ├── server.ts                    # Server settings
│   ├── middlewares.ts               # Middleware configuration
│   └── plugins.ts                   # Plugin settings
├── src/
│   ├── api/                         # API routes and logic
│   │   ├── news/                    # News article collection
│   │   │   ├── content-types/
│   │   │   │   └── news/
│   │   │   │       ├── schema.json  # Article schema definition
│   │   │   │       └── index.js
│   │   │   ├── controllers/         # Request handlers
│   │   │   ├── services/            # Business logic
│   │   │   └── routes/              # API routes
│   │   ├── category/                # News categories collection
│   │   │   ├── content-types/
│   │   │   │   └── category/
│   │   │   │       └── schema.json
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   └── routes/
│   │   └── source/                  # News sources collection
│   │       ├── content-types/
│   │       │   └── source/
│   │       │       └── schema.json
│   │       ├── controllers/
│   │       ├── services/
│   │       └── routes/
│   ├── extensions/                  # Plugin extensions
│   ├── index.ts                     # Strapi bootstrap
│   └── admin/                       # Admin panel customization
├── database/
│   ├── migrations/                  # Database migrations
│   └── sqlite.db                    # SQLite database file
├── public/
│   └── uploads/                     # Uploaded files storage
├── scripts/
│   └── import-data.js               # Data import script
├── types/
│   └── index.ts                     # TypeScript type definitions
├── src/lib/
│   └── data-utils.ts                # Data utility functions
├── package.json
├── tsconfig.json
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
GET    /api/news                     # Get all articles
GET    /api/news?filters[category]  # Filter by category
GET    /api/news/:id                # Get single article
POST   /api/news                     # Create article (authenticated)
PUT    /api/news/:id                # Update article (authenticated)
DELETE /api/news/:id                # Delete article (authenticated)
```

### Categories

```
GET    /api/categories               # Get all categories
GET    /api/categories/:id          # Get single category
POST   /api/categories               # Create category (authenticated)
PUT    /api/categories/:id          # Update category (authenticated)
DELETE /api/categories/:id          # Delete category (authenticated)
```

### Sources

```
GET    /api/sources                  # Get all sources
GET    /api/sources/:id             # Get single source
POST   /api/sources                  # Create source (authenticated)
PUT    /api/sources/:id             # Update source (authenticated)
DELETE /api/sources/:id             # Delete source (authenticated)
```

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
npm run develop          # Start development server with watch mode
npm run build            # Build admin panel and optimize
npm run start            # Start production server
npm run strapi deploy    # Deploy to hosting service
npm run import-data      # Import mock data
```

### Environment Variables

Create `.env.local` file:

```env
HOST=localhost
PORT=1337
ADMIN_JWT_SECRET=your_secret_here
JWT_SECRET=your_secret_here
API_TOKEN_SALT=your_salt_here
```

### Adding New Content Types

1. Use Strapi admin panel (http://localhost:1337/admin)
2. Create content type with required fields
3. Schema automatically stored in `src/api/[name]/content-types/[name]/schema.json`
4. API routes generated automatically

### Extending with Custom Logic

1. Create service in `src/api/[name]/services/`
2. Add business logic for data processing
3. Use in controllers to handle requests
4. Example: custom filtering, calculations, validations

## Admin Panel

Access at: `http://localhost:1337/admin`

Default login:
- Email: Check console output after first run
- Password: Set during initial setup

### Features
- Visual content management
- Relationship management
- Media library
- Draft/Publish workflows
- User management
- Role-based access control

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

### Database Issues
- Check `database/sqlite.db` permissions
- Verify database connection string
- Run migrations if needed

### API Not Responding
- Verify server is running on port 1337
- Check firewall settings
- Review error logs in console

### Import Script Fails
- Ensure server is running
- Check API_TOKEN configuration
- Verify network connectivity

## Future Enhancements

Consider adding:
- Advanced search with Elasticsearch
- Image optimization and CDN integration
- Caching layer (Redis)
- GraphQL API alongside REST
- Real-time updates with WebSockets
- Analytics integration
- Comment system
- User authentication for frontend
- Multiple language support (i18n)
- Article recommendations engine
- Social media integration

## Resources

- [Strapi Documentation](https://docs.strapi.io)
- [Strapi Community](https://discord.strapi.io)
- [REST API Documentation](http://localhost:1337/documentation)
- [TypeScript Support](https://docs.strapi.io/developer-docs/getting-started/typescript)
