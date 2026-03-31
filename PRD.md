# PMC News Backend - Product Requirements Document (PRD)

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

**PMC News Backend** is a headless CMS built with Strapi v5, serving as the data layer for a Next.js news website. It manages news articles, categories, and sources via REST API.

**Stack**: Strapi v5.36.0 · TypeScript · SQLite (dev) / PostgreSQL (prod) · REST API

**Frontend**: `D:\Projects\Nextjs\lazy-nextjs-news` (Next.js 16 + React 19 + Tailwind v4 + shadcn/ui)

**Frontend Architecture**: Clean architecture with layers:
- `src/domain/` — `Article` and `Category` interfaces
- `src/infrastructure/strapi/` — API client, types (`StrapiArticle`, `StrapiCategory`, `StrapiSource`), transformers (`convertStrapiToArticle`)
- `src/application/` — Use cases (`get-home-articles`, `get-category-articles`, `get-article-detail`, `get-nav-categories`)

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

### 3.1 Add `content` Field to News Schema `[DONE]`

**Priority**: High
**Why**: The frontend expects a `content` field for full article body text. Currently the schema only has `title`, `summary`, and `url`. The frontend falls back to `summary` when `content` is missing, so article detail pages show just the summary.

**Requirements**:
- Add `content` field to `src/api/news/content-types/news/schema.json`
- Type: `richtext` (Strapi rich text) or `text` (plain long text)
- Optional field (not all articles have full content)
- Update import script to populate `content` with realistic article body text (2-4 paragraphs)
- Verify the field appears in API responses at `/api/news-articles?populate=*`

**Frontend impact**: `StrapiArticle` type in `src/infrastructure/strapi/types.ts` already declares `content?: string`. The `convertStrapiToArticle()` transformer in `src/infrastructure/strapi/transformers.ts` falls back to `summary` when `content` is missing (`content: strapiArticle.content || strapiArticle.summary`). No frontend changes needed once this field is added.

**Also unblocks**: Frontend PRD 3.1 (Typography Plugin) — article body will have real content to style with `prose` classes.

---

### 3.2 Add `image` Field to News Schema `[DONE]`

**Priority**: High
**Why**: Frontend shows grey placeholder boxes for every article. Strapi should serve image URLs so the frontend can display real images.

**Requirements**:
- Add `image` field to news schema — choose one approach:
  - **Option A**: `media` type (Strapi Media Library) — images uploaded to Strapi
  - **Option B**: `string` type with URL format — external image URLs stored as text
- Update import script to include image URLs for each article (use placeholder image services like `picsum.photos` or category-appropriate stock URLs)
- Ensure `populate=*` includes the image in API response

**Frontend impact**: Frontend `convertStrapiToArticle()` in `src/infrastructure/strapi/transformers.ts` currently hardcodes `image: "/placeholder.jpg"`. Once this field exists, the frontend transformer needs updating to read from `strapiArticle.image`. The `StrapiArticle` type in `src/infrastructure/strapi/types.ts` also needs an `image` field added.

**Also unblocks**: Frontend PRD 3.6 (Real Images) — `NewsCard` and featured article can show actual images via Next.js `<Image>`.

---

### 3.3 Add `author` Field to News Schema `[DONE]`

**Priority**: Medium
**Why**: Frontend displays `source.name` as the author. A dedicated `author` field allows showing the actual journalist/writer name separately from the publication source.

**Requirements**:
- Add `author` field to news schema (type: `string`, optional, max 100 chars)
- Update import script to include realistic author names
- Keep existing `source` relation for the publication

**Frontend impact**: Frontend `convertStrapiToArticle()` in `src/infrastructure/strapi/transformers.ts` currently maps `source.name` → `author` as fallback (`author: strapiArticle.source?.name || "Unknown"`). After this field is added, the transformer should prefer `strapiArticle.author` over `source.name`. The `StrapiArticle` type also needs an `author?: string` field.

**Also unblocks**: Frontend PRD 3.8 (Source Link) — frontend can show author name and source name as separate elements, with source name as a clickable link to the source URL.

---

### 3.4 Seed Data: More Realistic Articles `[DONE]`

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

### 3.6 Search Improvements `[DONE]`

**Priority**: Medium
**Why**: Current search only works on `title` and `summary` via Strapi's `$containsi` filter. Adding `content` search and better relevance would improve the frontend search feature.

**Requirements**:
- Ensure `content` field (once added) is also searchable
- Frontend already sends `$or` filters for title and summary — just needs content added to the filter set
- Consider adding a custom search endpoint if more advanced search is needed later

**Frontend impact**: Frontend `searchArticles()` in `src/infrastructure/strapi/article-repository.ts` sends `$or` filters on `title` and `summary`. After adding content field, the frontend function needs a third filter: `"filters[$or][2][content][$containsi]": query`.

**Also unblocks**: Frontend PRD 3.4 (Search Feature) — search page UI already planned, better search results make it more useful.

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

### 3.8 CORS Configuration for Production `[DONE]`

**Priority**: Medium (before deployment)
**Why**: Production deployed via Docker with Caddy reverse proxy. CORS handled at proxy level.

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

### 3.14 Add `slug` Field to Category Schema `[TODO]`

**Priority**: Medium
**Why**: Frontend routes use `/category/[slug]` and currently derives slug from `category.name.toLowerCase()`. A proper `slug` field is more robust (handles multi-word categories, special characters, etc.) and allows the frontend to fetch categories dynamically from Strapi instead of hardcoding them.

**Requirements**:
- Add `slug` field to `src/api/category/content-types/category/schema.json` (type: `string`, required, unique)
- Auto-generate slug from `name` on create (e.g., "Technology" → "technology", "Breaking News" → "breaking-news")
- Update import script to set slug for each category
- Ensure slug is returned in `/api/categories` responses

**Frontend impact**: The `StrapiCategory` type in `src/infrastructure/strapi/types.ts` needs a `slug` field. The `get-nav-categories` use case can then build navigation from Strapi data instead of the hardcoded `categories` array in `src/domain/category.ts`. Also unblocks frontend PRD 3.3 (Dynamic Navigation from Strapi).

---

### 3.15 Fix Documentation: v4 vs v5 Response Format `[TODO]`

**Priority**: Low
**Why**: `INTEGRATION_GUIDE.md` still shows Strapi v4 nested `attributes` response format in some examples, but the actual API returns Strapi v5 flat format. The `types/index.ts` `StrapiArticle` type is correct (v5 flat), but the guide is misleading.

**Requirements**:
- Audit `INTEGRATION_GUIDE.md` and fix any examples showing `data.attributes.title` (v4) — should be `data.title` (v5)
- Ensure all code examples match the actual `StrapiArticle` type in `types/index.ts`
- No code changes needed, just documentation fixes

---

### 3.16 Add `check-api` Script to package.json `[TODO]`

**Priority**: Low
**Why**: `scripts/check-api.js` exists but has no npm script entry. Only `import-data` is registered in `package.json`.

**Requirements**:
- Add `"check-api": "node scripts/check-api.js"` to `package.json` scripts
- Verify the script works correctly

---

### 3.17 PostgreSQL Migration Guide `[DONE]`

**Priority**: Low (before deployment)
**Why**: Production runs PostgreSQL via Docker Compose. Migration guide documented in `DEPLOYMENT.md`.

---

### 3.18 API Token Authentication Setup `[DONE]`

**Priority**: Medium
**Why**: API tokens configured for both local and production. News fetcher scripts use tokens for CRUD operations.

---

### 3.19 News Fetcher: Automated Scheduling `[TODO]`

**Priority**: High
**Why**: Currently news fetch + summarization is manual (run scripts + paste to AI). Should be automated on a schedule.

**Requirements**:
- Set up cron job or scheduled task to run `fetch-news` daily
- Options: Docker cron container, system crontab on server, or GitHub Actions
- Auto-run steps 1-2 of OPERATIONAL_FLOW (delete-today + fetch)
- Step 3-4 (AI summarization) still manual for now

---

### 3.20 News Fetcher: Auto-Summarization via API `[TODO]`

**Priority**: High
**Why**: Currently AI summarization requires manual copy-paste of raw_content to AI, then running batch-update. This should be automated.

**Requirements**:
- Create script that reads `raw_content` from Strapi, sends to AI API (Claude/OpenAI), writes summary back to `content`
- Configurable AI provider via env var
- Respect rate limits
- Fallback: use `summary` field (from RSS) if AI fails
- Run as final step after fetch-news

---

### 3.21 Add `slug` Field to Category Schema `[TODO]`

**Priority**: Medium
**Why**: Frontend routes use `/category/[slug]` and currently derives slug from `category.name.toLowerCase()`. A proper `slug` field is more robust.

**Requirements**:
- Add `slug` field to `src/api/category/content-types/category/schema.json` (type: `string`, required, unique)
- Auto-generate slug from `name` on create
- Update news-fetcher to set slug when creating categories
- Ensure slug is returned in `/api/categories` responses

---

### 3.22 Image Scraping from Articles `[TODO]`

**Priority**: Medium
**Why**: Fetched articles use placeholder images. Real article images would improve the frontend significantly.

**Requirements**:
- Extract Open Graph image (`og:image`) or first article image during scraping
- Store image URL in article's `image` field
- Fallback to category-based placeholder if no image found
- Handle relative URLs (convert to absolute)

---

### 3.23 Article Deduplication Improvement `[TODO]`

**Priority**: Low
**Why**: Current dedup checks URL only. Same story from different sources creates separate articles (e.g., "Spain airspace" from BBC and Al Jazeera).

**Requirements**:
- Add title similarity check (fuzzy matching) alongside URL check
- Configurable threshold (e.g., 80% similarity = skip)
- Option to merge/link related articles from different sources

---

### 3.24 Content Cleanup & Formatting `[TODO]`

**Priority**: Low
**Why**: Scraped `raw_content` contains noise (nav text, "ShareSave", timestamps, related article links). Cleaner raw content = better AI summaries.

**Requirements**:
- Improve content selectors in `config/sources.js`
- Strip common noise patterns (share buttons, timestamps, related links)
- Better markdown conversion (proper heading levels, list formatting)

---

### 3.25 Docker: Health Check Endpoint `[TODO]`

**Priority**: Low
**Why**: Docker Compose health checks currently only check if port is open. A proper health endpoint checks database connectivity.

**Requirements**:
- Create custom route `GET /api/health` returning `{ status: "ok", db: "connected" }`
- Use in `docker-compose.yml` healthcheck instead of port check
- Include in Caddy upstream health monitoring

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
| 3.3 Add `author` field | Frontend 3.8 Source Link (separate author from source) |
| 3.4 Better seed data | All frontend features (better demo data) |
| 3.6 Search on content | Frontend 3.4 Search Feature |
| 3.8 CORS for production | Frontend deployment |
| 3.14 Add `slug` to categories | Frontend 3.3 Dynamic Navigation from Strapi |

---

## 6. Priority Order (Suggested Build Sequence)

### Already Done
| Feature | Status |
|---------|--------|
| 3.1 Add `content` field | DONE |
| 3.2 Add `image` field | DONE |
| 3.3 Add `author` field | DONE |
| 3.4 Better seed data | DONE |
| 3.6 Search improvements | DONE |
| 3.8 CORS for production | DONE |
| 3.17 PostgreSQL guide | DONE |
| 3.18 API token setup | DONE |

### Next Up
| Order | Feature | Priority | Blocks Frontend? |
|-------|---------|----------|-----------------|
| 1 | 3.19 News Fetcher: Automated Scheduling | High | No |
| 2 | 3.20 News Fetcher: Auto-Summarization | High | No |
| 3 | 3.21 Add `slug` to categories | Medium | Yes — dynamic navigation |
| 4 | 3.22 Image Scraping from Articles | Medium | Yes — real images |
| 5 | 3.24 Content Cleanup & Formatting | Low | No |
| 6 | 3.23 Article Deduplication | Low | No |
| 7 | 3.5 Category counts API | Low | No |
| 8 | 3.7 Rate limiting | Low | No |
| 9 | 3.9 Response caching | Low | No |
| 10 | 3.25 Docker Health Check | Low | No |
| 11 | 3.15 Fix v4/v5 docs | Low | No |
| 12 | 3.16 Add check-api script | Low | No |
| 13 | 4.3 Security hardening | Ongoing | No |

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

### Frontend Key Files (for reference)
| What | File |
|------|------|
| Strapi types | `src/infrastructure/strapi/types.ts` |
| Strapi→Article transformer | `src/infrastructure/strapi/transformers.ts` |
| Article API calls | `src/infrastructure/strapi/article-repository.ts` |
| Category API calls | `src/infrastructure/strapi/category-repository.ts` |
| Domain Article interface | `src/domain/article.ts` |
| Domain Category (hardcoded) | `src/domain/category.ts` |
| Frontend PRD | `PRD.md` |

### How to Ask Claude to Build
```
"Build feature 3.1"           → Add content field to news schema
"Build all High priority"     → Build 3.1 and 3.2
"Build features 3.1 to 3.4"  → Build those four features
"Build all TODO features"     → Build everything marked [TODO]
"What's left to build?"       → Claude reads this file and lists remaining [TODO] items
```

After Claude completes a feature, it will update the status tag from `[TODO]` to `[DONE]`.
