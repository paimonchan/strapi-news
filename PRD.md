# NewsWire Backend - Product Requirements Document (PRD)

> **How to use this file**: Each feature has a status tag. Change it to tell Claude what to build next.
>
> - `[TODO]` — Not started. Claude should build this when asked.
> - `[IN PROGRESS]` — Currently being worked on.
> - `[DONE]` — Complete. No changes needed.
> - `[SKIP]` — Intentionally skipped. Claude should ignore this.
>
> **To request work**, just say: _"Build all TODO features"_ or _"Build feature 3.2"_.

---

## 1. Project Summary

**NewsWire Backend** is a headless CMS built with Strapi v5, serving as the data layer for a Next.js news website. It manages news articles, categories, and sources via REST API.

**Stack**: Strapi v5.36.0 · TypeScript · SQLite (dev) / PostgreSQL (prod) · REST API

**Frontend**: `D:\Projects\Nextjs\lazy-nextjs-news` (Next.js 16 + React 19 + Tailwind v4 + shadcn/ui)

---

## 2. Current State (What's Already Built)

### 2.1 Content Types `[DONE]`

| Collection | API Endpoint | Fields |
|------------|-------------|--------|
| News (`news`) | `/api/news-articles` | title, summary, url, publishedAt, source (relation), category (relation) |
| Category (`category`) | `/api/categories` | name |
| Source (`source`) | `/api/sources` | name, url, description |

### 2.2 Relationships `[DONE]`

| From | To | Type |
|------|----|------|
| News → Category | manyToOne | Each article belongs to one category |
| News → Source | manyToOne | Each article belongs to one source |
| Category → News | oneToMany | Category has many articles |
| Source → News | oneToMany | Source has many articles |

### 2.3 Data Import Script `[DONE]`

- `scripts/import-data.js` creates 6 sources, 6 categories, 25+ articles
- Run via `npm run import-data`
- `scripts/check-api.js` for API health checks

### 2.4 API Controllers/Services/Routes `[DONE]`

- All three collections use Strapi core factories (auto-generated CRUD)
- TypeScript files in `src/api/*/` compiled to `dist/`

### 2.5 Data Utilities `[DONE]`

- `src/lib/data-utils.ts` with 40+ helper functions (filtering, sorting, pagination, aggregation)
- These are backend utilities, not used by the API directly

### 2.6 Configuration `[DONE]`

- SQLite database for development
- Server on port 1337
- Draft/publish enabled by default
- CORS configured for localhost

---

## 3. Features To Build

### 3.1 Add `content` Field to News Schema `[TODO]`

**Priority**: High
**Why**: The frontend expects a `content` field for full article body text. Currently the schema only has `title`, `summary`, and `url`. The frontend falls back to `summary` when `content` is missing, so article detail pages show just the summary.

**Requirements**:
- Add `content` field to `src/api/news/content-types/news/schema.json`
- Type: `richtext` (Strapi rich text) or `text` (plain long text)
- Optional field (not all articles have full content)
- Update import script to populate `content` with realistic article body text (2-4 paragraphs)
- Verify the field appears in API responses at `/api/news-articles?populate=*`

**Frontend impact**: `src/lib/api.ts` already reads `content` from Strapi response. No frontend changes needed.

---

### 3.2 Add `image` Field to News Schema `[TODO]`

**Priority**: High
**Why**: Frontend shows grey placeholder boxes for every article. Strapi should serve image URLs so the frontend can display real images.

**Requirements**:
- Add `image` field to news schema — choose one approach:
  - **Option A**: `media` type (Strapi Media Library) — images uploaded to Strapi
  - **Option B**: `string` type with URL format — external image URLs stored as text
- Update import script to include image URLs for each article (use placeholder image services like `picsum.photos` or category-appropriate stock URLs)
- Ensure `populate=*` includes the image in API response

**Frontend impact**: Frontend PRD feature 3.6 (Real Images) depends on this. Frontend `convertStrapiToArticle()` currently hardcodes `image: "/placeholder.jpg"` — will need to read from Strapi field.

---

### 3.3 Add `author` Field to News Schema `[TODO]`

**Priority**: Medium
**Why**: Frontend displays `source.name` as the author. A dedicated `author` field allows showing the actual journalist/writer name separately from the publication source.

**Requirements**:
- Add `author` field to news schema (type: `string`, optional, max 100 chars)
- Update import script to include realistic author names
- Keep existing `source` relation for the publication

**Frontend impact**: Frontend currently maps `source.name` → `author`. After this, frontend can show both author name and source name separately.

---

### 3.4 Seed Data: More Realistic Articles `[TODO]`

**Priority**: Medium
**Why**: Current import script creates articles with minimal content. Better seed data makes development and demos more convincing.

**Requirements**:
- Update `scripts/import-data.js` to include:
  - Longer, realistic article body text (3-5 paragraphs per article) in `content` field
  - Varied publish dates (spread across last 30 days, not all the same date)
  - Realistic author names
  - Image URLs (if 3.2 is done)
- Increase to 30+ articles with good distribution across all 6 categories (5+ per category)
- Include a few articles per source to make source filtering useful

---

### 3.5 Custom API: Article Count per Category `[TODO]`

**Priority**: Low
**Why**: Frontend may want to show article counts next to category names in navigation (e.g., "Technology (8)").

**Requirements**:
- Create a custom route: `GET /api/categories/counts`
- Returns: `{ data: [{ name: "Technology", slug: "technology", count: 8 }, ...] }`
- Or extend the existing `/api/categories` endpoint with a custom controller that includes article count
- Use Strapi entity service to count related articles

---

### 3.6 Search Improvements `[TODO]`

**Priority**: Medium
**Why**: Current search only works on `title` and `summary` via Strapi's `$containsi` filter. Adding `content` search and better relevance would improve the frontend search feature.

**Requirements**:
- Ensure `content` field (once added) is also searchable
- Frontend already sends `$or` filters for title and summary — just needs content added to the filter set
- Consider adding a custom search endpoint if more advanced search is needed later

**Frontend impact**: Frontend `searchArticles()` in `api.ts` sends `$or` filters. After adding content field, update the frontend function to also search content.

---

### 3.7 API Rate Limiting `[TODO]`

**Priority**: Low
**Why**: Protect the API from abuse. Currently no rate limiting is configured.

**Requirements**:
- Configure rate limiting in `config/middlewares.ts`
- Reasonable limits: 100 requests/minute for public endpoints
- Higher limits for authenticated requests
- Return `429 Too Many Requests` when exceeded

---

### 3.8 CORS Configuration for Production `[TODO]`

**Priority**: Medium (before deployment)
**Why**: Current CORS is configured for localhost only. Production frontend will be on a different domain.

**Requirements**:
- Update `config/middlewares.ts` to support configurable CORS origins via env var
- Add `CORS_ORIGIN` to `.env.example`
- Default: `http://localhost:3000` (Next.js dev server)
- Production: Set to deployed frontend URL

---

### 3.9 API Response Caching `[TODO]`

**Priority**: Low
**Why**: News articles don't change frequently. Caching reduces database load and improves response times.

**Requirements**:
- Add `Cache-Control` headers to GET responses for news, categories, sources
- Suggested: `max-age=60` for article lists, `max-age=300` for categories/sources
- Implement via custom middleware or controller override
- Ensure POST/PUT/DELETE bypass cache

---

### 3.10 Webhook on Publish `[SKIP]`

**Priority**: Future
**Why**: Would allow triggering Next.js ISR (Incremental Static Regeneration) when content is published. Out of scope until frontend is deployed.

---

### 3.11 GraphQL API `[SKIP]`

**Priority**: Future
**Why**: REST API is sufficient. GraphQL adds complexity without clear benefit for this project size.

---

### 3.12 Multi-language (i18n) `[SKIP]`

**Priority**: Future
**Why**: Requires significant schema changes and frontend support. Out of scope.

---

### 3.13 User Comments Collection `[SKIP]`

**Priority**: Future
**Why**: Requires user authentication on frontend. Out of scope.

---

### 3.14 Fix Documentation: v4 vs v5 Response Format `[TODO]`

**Priority**: Low
**Why**: `INTEGRATION_GUIDE.md` still shows Strapi v4 nested `attributes` response format in some examples, but the actual API returns Strapi v5 flat format. The `types/index.ts` `StrapiArticle` type is correct (v5 flat), but the guide is misleading.

**Requirements**:
- Audit `INTEGRATION_GUIDE.md` and fix any examples showing `data.attributes.title` (v4) — should be `data.title` (v5)
- Ensure all code examples match the actual `StrapiArticle` type in `types/index.ts`
- No code changes needed, just documentation fixes

---

### 3.15 Add `check-api` Script to package.json `[TODO]`

**Priority**: Low
**Why**: `scripts/check-api.js` exists but has no npm script entry. Only `import-data` is registered in `package.json`.

**Requirements**:
- Add `"check-api": "node scripts/check-api.js"` to `package.json` scripts
- Verify the script works correctly

---

### 3.16 PostgreSQL Migration Guide `[TODO]`

**Priority**: Low (before deployment)
**Why**: SQLite is fine for development but PostgreSQL is needed for production. A clear migration guide prevents issues.

**Requirements**:
- Document step-by-step migration from SQLite to PostgreSQL
- Update `config/database.ts` to read from env vars with SQLite fallback
- Add PostgreSQL env vars to `.env.example`
- Test that import script works with PostgreSQL
- Document in this PRD or a separate `DEPLOYMENT.md`

---

### 3.17 API Token Authentication Setup `[TODO]`

**Priority**: Medium
**Why**: Frontend uses `STRAPI_API_TOKEN` env var for authenticated requests. This should be documented and easy to set up.

**Requirements**:
- Document how to create an API token in Strapi Admin
- Specify required permissions (read-only for public content)
- Add setup steps to this PRD or `INTEGRATION_GUIDE.md`
- Ensure the import script uses the token if available

---

## 4. Non-Functional Requirements

### 4.1 Data Integrity `[DONE]`

- Title: required, 3-250 characters
- URL: required, unique, valid URL format
- Category/Source names: required, unique, 2-100 characters

### 4.2 API Consistency `[DONE]`

- All endpoints follow Strapi v5 conventions
- JSON responses with `{ data, meta }` structure
- Pagination metadata included in collection responses

### 4.3 Security `[TODO]`

- Public role: read-only access to news, categories, sources
- Write operations require authentication
- API tokens for programmatic access
- No secrets in committed files

### 4.4 Performance `[TODO]`

- Response times under 200ms for cached content
- Pagination default: 25 items per page
- Database indexes on frequently queried fields

---

## 5. Frontend Dependencies

These backend features are **blocking** frontend PRD features:

| Backend Feature | Frontend Feature It Unblocks |
|----------------|------------------------------|
| 3.1 Add `content` field | Frontend 3.1 Typography (article body has content to style) |
| 3.2 Add `image` field | Frontend 3.6 Real Images |
| 3.3 Add `author` field | Frontend article page author display |
| 3.4 Better seed data | All frontend features (better demo data) |
| 3.6 Search on content | Frontend 3.4 Search Feature |
| 3.8 CORS for production | Frontend deployment |

---

## 6. Priority Order (Suggested Build Sequence)

| Order | Feature | Priority | Blocks Frontend? |
|-------|---------|----------|-----------------|
| 1 | 3.1 Add `content` field | High | Yes — article body |
| 2 | 3.2 Add `image` field | High | Yes — real images |
| 3 | 3.4 Better seed data | Medium | Yes — all features |
| 4 | 3.3 Add `author` field | Medium | Yes — author display |
| 5 | 3.8 CORS for production | Medium | Yes — deployment |
| 6 | 3.6 Search improvements | Medium | Yes — search |
| 7 | 3.17 API token setup | Medium | No |
| 8 | 3.5 Category counts | Low | No |
| 9 | 3.7 Rate limiting | Low | No |
| 10 | 3.9 Response caching | Low | No |
| 11 | 3.14 Fix v4/v5 docs | Low | No |
| 12 | 3.15 Add check-api script | Low | No |
| 13 | 3.16 PostgreSQL guide | Low | No |
| 14 | 4.3 Security hardening | Ongoing | No |

---

## 7. Quick Reference

### Project Paths
- **Backend (this project)**: `D:\Projects\Strapi\strapi-news`
- **Frontend**: `D:\Projects\Nextjs\lazy-nextjs-news`
- **Frontend PRD**: `D:\Projects\Nextjs\lazy-nextjs-news\PRD.md`

### Key Files to Modify
| What | File |
|------|------|
| News schema | `src/api/news/content-types/news/schema.json` |
| Category schema | `src/api/category/content-types/category/schema.json` |
| Source schema | `src/api/source/content-types/source/schema.json` |
| Import script | `scripts/import-data.js` |
| Middleware/CORS | `config/middlewares.ts` |
| Database config | `config/database.ts` |
| Custom controllers | `src/api/*/controllers/*.ts` |
| Custom routes | `src/api/*/routes/*.ts` |

### Commands
```bash
npm run develop       # Start dev server (localhost:1337)
npm run build         # Compile TypeScript
npm run import-data   # Import seed data
npm run check-api     # Health check endpoints
```

### How to Ask Claude to Build
```
"Build feature 3.1"           → Add content field to news schema
"Build all High priority"     → Build 3.1 and 3.2
"Build features 3.1 to 3.4"  → Build those four features
"Build all TODO features"     → Build everything marked [TODO]
"What's left to build?"       → Claude reads this file and lists remaining [TODO] items
```

After Claude completes a feature, it will update the status tag from `[TODO]` to `[DONE]`.
