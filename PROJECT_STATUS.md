## Current Goal
Build and maintain **PMC News** — a news aggregator with Strapi v5 backend + Next.js frontend. The backend fetches, scrapes, and AI-summarizes news articles; the frontend displays them.

## What Has Been Done

### Backend (Strapi + News Fetcher)
- Expanded from 6 → **11 categories** and 6 → **17 RSS sources** (~170 articles/fetch)
- New categories: Education, Environment, Finance
- Replaced 3 broken RSS feeds: Reuters→CNBC, Healthline→NPR Health, EdSurge→NPR Education
- Fixed dotenv path resolution, pagination (maxLimit 100), and `NODE_ENV=production` support across all scripts
- Solved cross-environment batch update by switching from documentId-based to **title-based matching**
- Full cycle completed on both **local and production** (delete → fetch → get-today-content → AI summarize → batch-update)
- All 169 production articles summarized (122 via title match + 47 via direct ID)
- Updated OPERATIONAL_FLOW.md and MAINTENANCE_GUIDE.md

### Frontend PRD (updated 2026-04-01)
- Added backend context, content pipeline description
- Raised **Pagination (3.5) to High** priority (~170 articles/day makes it critical)
- Updated Homepage Redesign (3.21) for 11 categories
- Added new features: **3.25 Source Page**, **3.26 Content Quality Indicator**
- Added **Section 6: Backend Dependencies** cross-referencing both PRDs

## Key Decisions

| Decision | Why |
|----------|-----|
| Title-based matching for batch-update | documentIds differ between local and production Strapi |
| `raw_content` vs `content` fields | raw = scraped text, content = AI summary shown to users |
| Scripts run from local machine, not server | `NODE_ENV=production` switches API URL/token |
| `.env` in project root, resolved via `path.join(__dirname, '../../../.env')` | Scripts nested 3 levels deep |
| Strapi maxLimit: 100 | All scripts that fetch >100 articles need pagination loops |

## Remaining Steps (by priority)

### Backend PRD TODO (High)
1. **3.19** Automated Scheduling — cron for daily fetch
2. **3.20** Auto-Summarization via AI API — eliminate manual copy-paste step

### Backend PRD TODO (Medium)
3. **3.21** Category `slug` field — enables robust frontend dynamic nav
4. **3.22** Image Scraping — og:image extraction during scrape

### Frontend PRD TODO (High)
1. **3.19** SEO: Open Graph & Structured Data
2. **3.20** Sitemap.xml
3. **3.5** Pagination (raised from Medium)

### Frontend PRD TODO (Medium)
4. **3.22** Article Date & Source Badge
5. **3.12** Loading Skeletons
6. **3.21** Homepage Redesign (11 categories)
