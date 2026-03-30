# News Fetching Workflow Guide

## 📋 Overview

This workflow automates the process of **grabbing news content from external sources** (RSS feeds, news APIs, and websites) and **inserting it into your Strapi database**.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install xml2js cheerio dotenv
```

### 2. Configure Environment

Copy `.env.example` to `.env` in **root folder**:

```bash
# Copy to root folder
copy .env.example .env
```

**Configuration:**
```env
# Strapi Configuration
STRAPI_URL=http://localhost:1337
STRAPI_ADMIN_EMAIL=admin@newswire.local
STRAPI_ADMIN_PASSWORD=Admin1234!

# Optional: API Keys for more sources
NEWSAPI_KEY=your_key_here
GUARDIAN_API_KEY=your_key_here
NYTIMES_API_KEY=your_key_here
```

**File location**: `D:\Projects\Strapi\strapi-news\.env`

### 3. Start Strapi

```bash
npm run develop
```

### 4. Run the Fetcher

```bash
# Fetch from all RSS sources
node scripts/fetch-news.js

# Preview first (dry run)
node scripts/fetch-news.js --dry-run

# Fetch from specific sources
node scripts/fetch-news.js --sources=techcrunch,bbc-tech,cnn-tech --limit=5
```

## 📁 Available Scripts

| Script | Purpose | Method |
|--------|---------|--------|
| `fetch-news.js` | Fetch from RSS feeds & APIs | RSS/XML parsing |
| `scrape-news.js` | Scrape news websites | HTML scraping |
| `import-data.js` | Import mock data | Static data |

## 🔧 Usage Options

### Fetch News (RSS & APIs)

```bash
# Fetch from all sources (default: 10 articles each)
node scripts/fetch-news.js

# Fetch from specific sources
node scripts/fetch-news.js --sources=techcrunch,bbc-tech,cnn-tech

# Fetch only Technology category
node scripts/fetch-news.js --category=Technology

# Limit articles per source
node scripts/fetch-news.js --limit=5

# Preview without inserting
node scripts/fetch-news.js --dry-run

# Combine options
node scripts/fetch-news.js --sources=bbc-tech,cnn-tech --category=Technology --limit=3 --dry-run
```

### Scrape News (Websites)

```bash
# Scrape all configured websites
node scripts/scrape-news.js

# Scrape specific sites
node scripts/scrape-news.js --sites=bbc,cnn,reuters

# Limit articles per site
node scripts/scrape-news.js --limit=5

# Preview without inserting
node scripts/scrape-news.js --dry-run
```

## 📺 Available Sources

### RSS Feed Sources

| ID | Name | Category | URL |
|----|------|----------|-----|
| `techcrunch` | TechCrunch | Technology | techcrunch.com |
| `bbc-tech` | BBC News | Technology | bbc.com/news |
| `cnn-tech` | CNN | Technology | cnn.com |
| `reuters-business` | Reuters | Business | reuters.com |
| `espn` | ESPN | Sports | espn.com |
| `variety` | Variety | Entertainment | variety.com |
| `healthline` | Healthline | Health | healthline.com |
| `science-daily` | Science Daily | Science | sciencedaily.com |

### API Sources (Require API Keys)

| ID | Name | API Key Required |
|----|------|------------------|
| `newsapi` | NewsAPI.org | NEWSAPI_KEY |
| `guardian` | The Guardian | GUARDIAN_API_KEY |
| `nytimes` | NY Times | NYTIMES_API_KEY |

### Web Scraping Sources

| ID | Name | Category |
|----|------|----------|
| `techcrunch` | TechCrunch | Technology |
| `bbc` | BBC News | Technology |
| `cnn` | CNN | Business |
| `reuters` | Reuters | Business |
| `espn` | ESPN | Sports |
| `variety` | Variety | Entertainment |
| `healthline` | Healthline | Health |
| `sciencedaily` | Science Daily | Science |

## 📊 Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    NEWS SOURCES                              │
├─────────────────┬─────────────────┬─────────────────────────┤
│   RSS Feeds     │   News APIs     │   Web Scraping          │
│   (XML)         │   (JSON)        │   (HTML)                │
└────────┬────────┴────────┬────────┴──────────┬──────────────┘
         │                 │                    │
         ▼                 ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│              FETCH/SCRAPE SCRIPTS                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ fetch-news.js│  │  API Client  │  │ scrape-news.js   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                 │                    │
         └─────────────────┼────────────────────┘
                           ▼
                 ┌───────────────────┐
                 │  Data Processing  │
                 │  - Parse content  │
                 │  - Extract fields │
                 │  - Detect dupes   │
                 └─────────┬─────────┘
                           ▼
                 ┌───────────────────┐
                 │  Strapi Backend   │
                 │  - Create source  │
                 │  - Create category│
                 │  - Insert article │
                 └───────────────────┘
```

## 🔄 Step-by-Step Process

### What Happens When You Run the Script

1. **Authentication**
   - Script authenticates with Strapi admin API
   - Gets JWT token for subsequent requests

2. **Source Processing** (for each configured source)
   - Fetches RSS feed or calls news API
   - Parses XML/JSON response
   - Extracts article data (title, summary, URL, etc.)

3. **Category & Source Setup**
   - Checks if category exists in Strapi
   - Creates category if not exists
   - Checks if source exists in Strapi
   - Creates source if not exists

4. **Article Insertion** (for each article)
   - Checks for duplicates (by URL)
   - Skips if already exists
   - Creates new article with relations

5. **Summary**
   - Shows total articles processed
   - Shows articles inserted
   - Shows articles skipped (duplicates)

## 📝 Example Output

```
🚀 News Fetcher - Starting...

Configuration:
  Sources: all
  Category: all
  Limit: 10 articles per source
  Dry Run: false

🔑 Authenticating as admin@newswire.local...
✓ Authentication successful


📰 Fetching from TechCrunch (Technology)...
  Found 10 articles
✓ Created category: Technology
✓ Created source: TechCrunch
✓ Created article: OpenAI Releases GPT-5 with Multimodal...
✓ Created article: Apple Announces Next Generation M4...
✓ Created article: Meta Launches Advanced VR Headset...
...

📰 Fetching from BBC News (Technology)...
  Found 10 articles
⊘ Skipped (duplicate): AI breakthrough announced...
✓ Created article: Quantum computing milestone reached...
...

============================================================
📊 Summary:
  Total articles processed: 80
  Articles inserted: 75
  Articles skipped (duplicates): 5
============================================================
```

## ⚙️ Configuration Options

### Environment Variables

```bash
# Strapi
STRAPI_URL=http://localhost:1337
STRAPI_ADMIN_EMAIL=admin@newswire.local
STRAPI_ADMIN_PASSWORD=Admin1234!
STRAPI_API_TOKEN=optional_token

# News APIs
NEWSAPI_KEY=your_key_here
GUARDIAN_API_KEY=your_key_here
NYTIMES_API_KEY=your_key_here

# Scraper settings
SCRAPER_DELAY=2000  # ms between requests
SCRAPER_MAX_CONCURRENT=3
```

### Script Options

| Option | Description | Default |
|--------|-------------|---------|
| `--sources` | Comma-separated source IDs | all |
| `--category` | Filter by category | all |
| `--limit` | Max articles per source | 10 |
| `--dry-run` | Preview only | false |

## 🗓️ Scheduled Fetching (Cron Jobs)

### Windows Task Scheduler

Create a batch file `fetch-news-daily.bat`:

```batch
@echo off
cd /d "D:\Projects\Strapi\strapi-news"
node scripts/fetch-news.js --limit=5 >> logs\fetch-news.log 2>&1
```

Schedule with Task Scheduler:
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., daily at 8 AM)
4. Action: Start a program
5. Program: `fetch-news-daily.bat`

### Linux/Mac Cron

```bash
# Edit crontab
crontab -e

# Add: Fetch news every hour
0 * * * * cd /path/to/strapi-news && node scripts/fetch-news.js --limit=3 >> logs/fetch-news.log 2>&1

# Add: Fetch news daily at 8 AM
0 8 * * * cd /path/to/strapi-news && node scripts/fetch-news.js --limit=10 >> logs/fetch-news.log 2>&1
```

## 🛠️ Troubleshooting

### Authentication Failed

```
✗ Authentication failed: Invalid credentials
```

**Solution:**
1. Check admin email/password in `.env`
2. Create admin user in Strapi admin panel
3. Or use API token instead

### No Articles Inserted

```
📊 Summary: 0 articles inserted
```

**Possible causes:**
1. Strapi not running - Start with `npm run develop`
2. Wrong API URL - Check `STRAPI_URL` in `.env`
3. RSS feed unavailable - Check internet connection
4. All duplicates - Clear database or use different sources

### RSS Feed Parse Error

```
✗ Failed to fetch RSS feed: HTTP 403
```

**Solution:**
- Some feeds block automated requests
- Try web scraping instead: `node scripts/scrape-news.js`
- Or use official API if available

### Duplicate Detection Too Aggressive

Articles are being skipped even though they're different.

**Solution:**
- Check if URLs are actually the same
- Duplicate detection is by URL - different URLs = different articles
- To disable, comment out duplicate check in script

## ⚠️ Legal & Ethical Considerations

### RSS Feeds
✅ Generally safe to use
✅ Most news sites provide RSS intentionally
✅ Check site's terms of service

### News APIs
✅ Official, authorized access
✅ Follow API rate limits
✅ Check usage terms

### Web Scraping
⚠️ Review site's `robots.txt`
⚠️ Check terms of service
⚠️ Be respectful with request frequency
⚠️ Some sites prohibit scraping

**Best Practices:**
- Add delays between requests (default: 2 seconds)
- Use proper User-Agent header
- Don't overload servers
- Prefer RSS/API when available
- Respect copyright and attribution requirements

## 📦 Data Flow

### Article Structure

```javascript
{
  title: "Article Headline",           // Max 250 chars
  summary: "Brief description...",     // Max 500 chars
  content: "Full article content",     // Rich text
  url: "https://source.com/article",   // Unique identifier
  image: "https://.../image.jpg",      // Optional
  author: "John Doe",                  // Optional
  publishedAt: "2026-03-30T10:00:00Z", // ISO datetime
  category: 1,                         // Relation ID
  source: 1,                           // Relation ID
}
```

### Relations

```
Article (many) → Category (one)
Article (many) → Source (one)
```

## 🎯 Best Practices

### 1. Start with Dry Run
Always preview first:
```bash
node scripts/fetch-news.js --dry-run
```

### 2. Limit Initial Fetch
Start small to test:
```bash
node scripts/fetch-news.js --limit=3
```

### 3. Use Specific Sources
Test with known-good sources:
```bash
node scripts/fetch-news.js --sources=techcrunch,bbc-tech
```

### 4. Run Regularly
Set up scheduled fetching for fresh content:
```bash
# Daily at 8 AM
0 8 * * * node scripts/fetch-news.js --limit=10
```

### 5. Monitor Logs
Check for errors:
```bash
tail -f logs/fetch-news.log
```

### 6. Handle Duplicates
The script automatically skips duplicates by URL. To re-fetch:
- Clear database and re-import
- Or modify duplicate check logic

## 📊 Monitoring & Logging

### Enable Logging

Create `logs` directory:
```bash
mkdir logs
```

Run with logging:
```bash
# Windows
node scripts/fetch-news.js >> logs\fetch-news.log 2>&1

# Linux/Mac
node scripts/fetch-news.js >> logs/fetch-news.log 2>&1
```

### Check Logs

```bash
# View recent entries
tail -n 50 logs/fetch-news.log

# Search for errors
grep "ERROR" logs/fetch-news.log

# Count articles inserted
grep "Created article" logs/fetch-news.log | wc -l
```

## 🔗 Integration with Frontend

After fetching news, your Next.js frontend can access:

```typescript
// Fetch all articles
const response = await fetch('http://localhost:1337/api/news-articles?populate=*');
const articles = await response.json();

// Filter by category
const techArticles = await fetch(
  'http://localhost:1337/api/news-articles?filters[category][name][$eq]=Technology&populate=*'
);

// Get latest 5
const latest = await fetch(
  'http://localhost:1337/api/news-articles?sort=-publishedAt&pagination[pageSize]=5&populate=*'
);
```

## 📚 Additional Resources

- **Strapi Documentation**: https://docs.strapi.io
- **RSS Feed Spec**: https://www.rssboard.org/rss-specification
- **NewsAPI**: https://newsapi.org
- **Guardian API**: https://open-platform.theguardian.com
- **NYTimes API**: https://developer.nytimes.com

## 🎉 Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment
3. ✅ Test with dry run
4. ✅ Run initial fetch
5. ✅ Verify in Strapi admin
6. ✅ Set up scheduled fetching
7. ✅ Connect frontend
8. ✅ Deploy to production

---

**Created**: 2026-03-30
**Project**: NewsWire / strapi-news
**Location**: D:\Projects\Strapi\strapi-news
