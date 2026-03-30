# News Fetcher Scripts

Standalone scripts for fetching news from external sources and inserting into Strapi CMS.

## 📁 Structure

```
news-fetcher/
├── README.md               # This file
├── MAINTENANCE_GUIDE.md    # Maintenance & troubleshooting guide
├── OPERATIONAL_FLOW.md     # Daily operational workflow
│
├── scripts/                # ← EXECUTABLE SCRIPTS (run these)
│   ├── fetch-news.js      # Fetch from RSS feeds & APIs
│   ├── scrape-news.js     # Scrape from websites
│   ├── delete-today.js    # Delete articles created today
│   ├── get-today-content.js    # Get today's articles content
│   ├── get-recent-content.js   # Get recent articles content
│   ├── update-content.js   # Update article content/summary
│   └── inspect-article.js  # Inspect article details
│
├── lib/                    # ← Internal libraries (don't run directly)
│   ├── logger.js          # Logging utility
│   ├── strapi-client.js   # Strapi API client
│   ├── rss-fetcher.js     # RSS feed parser
│   └── web-scraper.js     # Web scraper utilities
│
├── config/                 # ← Configuration files
│   └── sources.js         # News sources configuration
│
└── migrations/             # ← Database migrations
    └── add-politics-category.js  # Example migration
```

## 🚀 Quick Start

### From Project Root

```bash
# FETCH: Fetch news from RSS feeds (with full-text scraping)
npm run fetch-news

# FETCH: Fetch with options
npm run fetch-news -- --sources=bbc-world,al-jazeera --limit=10

# FETCH: Preview (dry run)
npm run fetch-news:dry

# FETCH: Scrape websites
npm run scrape-news

# TOOLS: Delete today's articles
npm run delete-today

# TOOLS: Get today's articles content
npm run get-today-content

# TOOLS: Get recent articles content  
npm run get-recent-content
```

### Direct Node Execution

```bash
# FETCH scripts
node scripts/news-fetcher/scripts/fetch-news.js --limit=10
node scripts/news-fetcher/scripts/scrape-news.js --sites=techcrunch

# TOOLS scripts
node scripts/news-fetcher/scripts/delete-today.js
node scripts/news-fetcher/scripts/get-today-content.js
node scripts/news-fetcher/scripts/update-content.js <documentId> "Summary text"
node scripts/news-fetcher/scripts/inspect-article.js <documentId>
```

## 📚 Documentation

- **[MAINTENANCE_GUIDE.md](MAINTENANCE_GUIDE.md)** - Maintenance, monitoring, and selector troubleshooting
- **[OPERATIONAL_FLOW.md](OPERATIONAL_FLOW.md)** - Daily operational workflow and summarization guide

## 📋 Available Commands

### FETCH: Fetch News (RSS & APIs with Full-Text)

```bash
# All sources
npm run fetch-news

# Specific sources
npm run fetch-news -- --sources=bbc-world,al-jazeera,cnn-tech --limit=10

# Specific category
npm run fetch-news -- --category=Technology --limit=5

# Dry run (preview)
npm run fetch-news:dry
```

**Available RSS Sources:**
- `techcrunch` - Technology
- `bbc-tech` - Technology  
- `cnn-tech` - Technology
- `bbc-world` - World News
- `al-jazeera` - International
- `reuters-business` - Business
- `espn` - Sports
- `variety` - Entertainment
- `healthline` - Health
- `science-daily` - Science

### FETCH: Scrape News (Websites)

```bash
# All configured sites
npm run scrape-news

# Specific sites
npm run scrape-news -- --sites=techcrunch,bbc,cnn --limit=10

# Dry run
npm run scrape-news:dry
```

**Available Sites:**
- `techcrunch`, `bbc`, `cnn`, `reuters`, `espn`, `variety`, `healthline`, `sciencedaily`

### TOOLS: Content Management

```bash
# Delete articles created today (UTC)
npm run delete-today

# Get today's articles with full content
node scripts/news-fetcher/scripts/get-today-content.js

# Get recent articles content
node scripts/news-fetcher/scripts/get-recent-content.js

# Update article content/summary
node scripts/news-fetcher/scripts/update-content.js <documentId> "Your summary text"

# Inspect specific article
node scripts/news-fetcher/scripts/inspect-article.js <documentId>
```

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Strapi Configuration
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_api_token_here

# Optional: Admin credentials (for advanced operations)
STRAPI_ADMIN_EMAIL=admin@example.com
STRAPI_ADMIN_PASSWORD=your_password

# Optional: News API Keys
NEWSAPI_KEY=your_newsapi_key
GUARDIAN_API_KEY=your_guardian_key
NYTIMES_API_KEY=your_nytimes_key
```

### Generate API Token

1. Open Strapi Admin: http://localhost:1337/admin
2. Go to **Settings** → **API Tokens**
3. Click **Create new API Token**
4. Set permissions:
   - News Article: `find`, `findOne`, `create`, `delete`
   - Category: `find`, `findOne`, `create`
   - Source: `find`, `findOne`, `create`
5. Copy token to `.env`

## 🔄 Workflow

### Daily Operational Workflow

For complete operational guide, see **[OPERATIONAL_FLOW.md](OPERATIONAL_FLOW.md)**

```bash
# 1. CLEAN: Delete today's articles (start fresh)
npm run delete-today

# 2. FETCH: Pull news from RSS feeds (with full-text scraping)
npm run fetch-news -- --sources=bbc-world,al-jazeera --limit=20

# 3. REVIEW: Check fetched content
node scripts/news-fetcher/scripts/get-today-content.js

# 4. SUMMARIZE: Create weighted summaries (see OPERATIONAL_FLOW.md)
node scripts/news-fetcher/scripts/update-content.js <documentId> "Your summary"

# 5. VERIFY: Check in Strapi Admin
# http://localhost:1337/admin
```

### Maintenance Workflow

For maintenance guide, see **[MAINTENANCE_GUIDE.md](MAINTENANCE_GUIDE.md)**

1. **Monitor** scraping logs for `[Full-Text Success]` messages
2. **Review** Strapi Admin for content quality
3. **Fix selectors** if scraping fails (see MAINTENANCE_GUIDE.md)
4. **Run migrations** if needed (add new categories, etc.)

## 📊 Output Example

```
🗑️  Delete Articles Created Today

API URL: http://127.0.0.1:1337
Token: 1b5cb08dc6ea7680f67c...

Found 10 articles created today (2026-03-30)

Articles to delete:
  1. [doc123] - AI chip startup raises $400M...
  2. [doc456] - New VR headset announced...

Deleting...

✓ [1/10] Deleted: AI chip startup raises $400M...
✓ [2/10] Deleted: New VR headset announced...

============================================================
✓ Finished: 10/10 articles deleted
============================================================

Verification: 50 total articles remaining
```

## 🛠️ Troubleshooting

### "No articles to delete"
- Check date/timezone - script uses UTC date
- Verify articles were created today (check createdAt timestamp)

### "HTTP 403 Forbidden" (Delete fails)
- API token doesn't have delete permission
- Update token permissions in Strapi Admin:
  - Settings → API Tokens → [Your Token] → Check "delete" for News Article

### "ECONNREFUSED"
- Strapi is not running
- Start with: `npm run develop`

### "Invalid credentials"
- Check admin email/password in .env
- Or use API token instead

## 📝 Notes

### Folder Structure
- **scripts/**: All executable scripts (fetch, scrape, delete, content management)
- **lib/**: Internal libraries - don't run directly
- **config/**: Configuration files (sources, selectors)
- **migrations/**: Database migration scripts
- **Documentation/**: MAINTENANCE_GUIDE.md, OPERATIONAL_FLOW.md

### General Notes
- Scripts are **standalone** dan tidak interfere dengan main Strapi project
- All scripts use Strapi API (not direct database access)
- Delete uses `documentId` to properly remove published articles
- RSS feeds are parsed with full-text scraping enabled
- Content is automatically summarized and stored in `raw_content` field

### For Maintenance & Operations
- See **[MAINTENANCE_GUIDE.md](MAINTENANCE_GUIDE.md)** for monitoring and selector troubleshooting
- See **[OPERATIONAL_FLOW.md](OPERATIONAL_FLOW.md)** for daily workflow and summarization

## 🎯 Best Practices

1. **Always dry-run first**
   ```bash
   npm run fetch-news:dry
   ```

2. **Start with small limits**
   ```bash
   npm run fetch-news -- --limit=5
   ```

3. **Test specific sources**
   ```bash
   npm run fetch-news -- --sources=techcrunch
   ```

4. **Delete before re-fetching** (if needed)
   ```bash
   npm run delete-today
   npm run fetch-news -- --limit=20
   ```

---

**Location**: `D:\Projects\Strapi\strapi-news\scripts\news-fetcher\`
**Status**: ✅ Production Ready
