# NewsWire Backend - Gemini CLI Documentation

## Project Overview

The NewsWire Backend is a Strapi headless CMS designed to manage and serve news articles, categories, and sources. It provides RESTful APIs for a news application, emphasizing a comprehensive data structure, relationships, and efficient queries. The system is designed to be production-ready, featuring type-safe TypeScript interfaces and a robust set of utility functions for data manipulation.

## Tech Stack

-   **Framework**: Strapi v4+ (Headless CMS)
-   **Database**: SQLite (development), PostgreSQL (production)
-   **Language**: JavaScript/TypeScript
-   **API**: REST API with JSON responses
-   **Documentation**: Auto-generated Strapi API documentation (Swagger/OpenAPI)

## Data Model

The core of the NewsWire application revolves around three interconnected content types: **News (Article)**, **Category**, and **Source**.

### 1. News Collection (`news`)

Represents individual news articles.

#### Schema Attributes:
-   `id`: Unique identifier
-   `title`: String (required, 3-250 chars)
-   `summary`: Text (required)
-   `url`: String (required, unique, URL format)
-   `publishedAt`: Datetime
-   `source`: Relation (Many-to-One → `Source`)
-   `category`: Relation (Many-to-One → `Category`)

#### TypeScript Interface (Frontend Context):
```typescript
interface Article {
    id: string;
    title: string;
    description: string; // From summary in backend
    content: string;     // Full article content (not directly in backend schema, but expected by frontend)
    category: string;    // Category name
    image: string;       // Image URL or path (not directly in backend schema)
    author: string;      // Author name (not directly in backend schema)
    publishedAt: string;
}
```

### 2. Category Collection (`categories`)

Defines news categories.

#### Schema Attributes:
-   `id`: Unique identifier
-   `name`: String (required, unique, 2-100 chars)
-   `news_articles`: Relation (One-to-Many → `News`)

#### Available Categories (Example):
- Technology
- Business
- Sports
- Entertainment
- Health
- Science

### 3. Source Collection (`sources`)

Lists news providers.

#### Schema Attributes:
-   `id`: Unique identifier
-   `name`: String (required, unique, 2-100 chars)
-   `url`: String (required, unique, URL format)
-   `description`: Text (optional)
-   `news_articles`: Relation (One-to-Many → `News`)

#### Available Sources (Example):
- TechCrunch
- CNN
- BBC News
- The New York Times
- The Guardian
- Reuters

## API Endpoints & Usage

All content types (News, Categories, Sources) expose RESTful API endpoints at `http://localhost:1337/api/`.

### General Operations:
-   `GET /api/[collection]`: Retrieve all entries.
-   `GET /api/[collection]/:id`: Retrieve a single entry by ID.
-   `POST /api/[collection]`: Create a new entry (requires authentication).
-   `PUT /api/[collection]/:id`: Update an entry (requires authentication).
-   `DELETE /api/[collection]/:id`: Delete an entry (requires authentication).

### Query Examples:

-   **Filter Articles by Category ID**:
    ```bash
    curl http://localhost:1337/api/news?filters[category][id][$eq]=1
    ```
-   **Search Articles by Title**:
    ```bash
    curl http://localhost:1337/api/news?filters[title][$contains]=AI
    ```
-   **Populate Relations (e.g., Source and Category for News)**:
    ```bash
    curl http://localhost:1337/api/news?populate=*
    ```
-   **Pagination (Page 1, 10 items per page)**:
    ```bash
    curl http://localhost:1337/api/news?pagination[page]=1&pagination[pageSize]=10
    ```
-   **Sort by Published Date (descending)**:
    ```bash
    curl http://localhost:1337/api/news?sort=publishedAt:desc
    ```

## Development Workflow

### Commands:
-   `npm install`: Install dependencies.
-   `npm run develop`: Start development server with watch mode (runs at `http://localhost:1337`).
-   `npm run build`: Build admin panel and optimize for production.
-   `npm run start`: Start production server.
-   `npm run import-data`: Import mock data into the database (creates 6 sources, 6 categories, and 30+ articles).
-   `npm run lint`: Run linter.

### Environment Variables (.env.local):
```env
HOST=localhost
PORT=1337
ADMIN_JWT_SECRET=your_secret_here
JWT_SECRET=your_secret_here
API_TOKEN_SALT=your_salt_here
```

### Data Import

A script (`scripts/import-data.js`) is provided to pre-populate the database with mock data. It creates:
-   6 news sources
-   6 news categories
-   30+ news articles, linking them to created sources and categories.

**To run the import script:**
1.  Ensure the Strapi server is running in development mode (`npm run develop`).
2.  Execute: `npm run import-data`

## Key Features

-   **Complete Data Model**: TypeScript interfaces for type safety, relationships between articles, categories, and sources, and validation rules for all fields.
-   **Utility Functions**: 40+ utility functions in `src/lib/data-utils.ts` for article retrieval, filtering, sorting, searching, pagination, grouping, and complex multi-filter queries.
-   **Comprehensive Mock Data**: 30 high-quality articles distributed across 6 categories, with realistic authors, publication dates, and source information.
-   **Backend API**: REST API for all CRUD operations, relationship management, draft and publish workflow, filtering, sorting, and pagination support.
-   **Draft & Publish Workflow**: All content types support draft/publish functionality.
-   **Relationships**: Articles are linked to Categories and Sources via one-to-many relationships.
-   **Data Validation**: Enforced constraints on fields like title length, unique URLs, etc.
-   **API Features**: RESTful CRUD, JSON, pagination, filtering, sorting.
-   **Admin Panel**: Visual content management for all content types, accessible at `http://localhost:1337/admin`.

## Troubleshooting

-   **Database Issues**: Check `database/sqlite.db` permissions or verify connection string for PostgreSQL. To reset the SQLite database, you can remove `database/sqlite.db` and restart Strapi.
-   **API Not Responding**: Ensure server is running on port 1337, check firewall, review error logs. If port 1337 is in use, you can kill the process or start Strapi on a different port (e.g., `PORT=1338 npm run develop`).
-   **Import Script Fails**: Ensure Strapi is running, verify API_TOKEN configuration, and check network connectivity.
-   **Type Errors**: Ensure correct TypeScript interfaces are imported from `types/index.ts`.
-   **CORS Error**: Check `config/middlewares.ts` for CORS configuration.

## Future Enhancements (Considerations)

-   Advanced search with Elasticsearch.
-   Image optimization and CDN integration.
-   Caching layer (Redis).
-   GraphQL API.
-   Real-time updates with WebSockets.
-   Analytics integration, comment system, user authentication for frontend, multiple language support (i18n), article recommendations engine, social media integration.

## File Structure Summary

```
D:\Projects\Strapi\strapi-news/
├── config/                  # Strapi configurations (admin, api, database, middlewares, plugins, server)
├── src/
│   ├── api/                 # API routes, controllers, services, content-types (News, Category, Source)
│   ├── extensions/          # Plugin extensions
│   ├── admin/               # Admin panel customizations
│   └── lib/                 # Data utility functions (data-utils.ts)
├── database/                # SQLite database and migrations (sqlite.db)
├── public/                  # Uploaded files
├── scripts/                 # Data import script (import-data.js)
├── types/                   # TypeScript type definitions (index.ts, generated)
├── package.json             # Project dependencies and scripts
└── README.md
```
