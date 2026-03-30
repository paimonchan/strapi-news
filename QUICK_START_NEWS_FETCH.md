# 🚀 Quick Start: Fetch News

## Setup (First Time Only)

### 1. Install Dependencies

```bash
npm install
```

This installs the required packages:
- `xml2js` - Parse RSS feeds
- `cheerio` - Web scraping
- `dotenv` - Environment variables

### 2. Configure Environment

```bash
# Copy example file to root
copy .env.example .env

# Or create manually in root folder
# Edit .env with your settings
```

**Minimum required settings:**
```env
STRAPI_URL=http://localhost:1337
STRAPI_ADMIN_EMAIL=your-admin-email
STRAPI_ADMIN_PASSWORD=your-admin-password
```

**Location**: `.env` di root folder project

### 3. Start Strapi

```bash
npm run develop
```

Wait for Strapi to start, then:
- Open http://localhost:1337/admin
- Create admin account (if first time)
- Update `.env` with your admin credentials

### 4. Enable Public API Access

In Strapi Admin:
1. Go to **Settings** → **Users & Permissions** → **Roles** → **Public**
2. Check permissions for:
   - News Article: `find`, `findOne`, `create`
   - Category: `find`, `findOne`, `create`
   - Source: `find`, `findOne`, `create`
3. Click **Save**

---

## Fetch News (Quick Commands)

### Using npm scripts (Recommended)

```bash
# Preview (dry run - doesn't insert)
npm run fetch-news:dry

# Fetch from all sources (10 articles each)
npm run fetch-news

# Fetch from specific sources
npm run fetch-news -- --sources=techcrunch,bbc-tech --limit=5

# Scrape websites
npm run scrape-news

# Scrape with preview
npm run scrape-news:dry
```

### Direct node commands

```bash
# Preview
node scripts/fetchers/fetch-news.js --dry-run

# Fetch news
node scripts/fetchers/fetch-news.js

# Fetch from specific sources
node scripts/fetchers/fetch-news.js --sources=techcrunch,bbc-tech --limit=5

# Scrape websites
node scripts/fetchers/scrape-news.js --sites=bbc,cnn --limit=10
```

---

## Verify Results

### 1. Check Strapi Admin

1. Open http://localhost:1337/admin
2. Go to **Content Manager**
3. Check **News Articles** - you should see new articles
4. Check **Categories** - should have Technology, Business, etc.
5. Check **Sources** - should have TechCrunch, BBC, etc.

### 2. Check API

```bash
# Get all articles
curl http://localhost:1337/api/news-articles?populate=*

# Count articles
curl http://localhost:1337/api/news-articles?pagination[pageSize]=1
```

---

## Common Tasks

### Fetch Only Technology News

```bash
node scripts/fetch-news.js --category=Technology --limit=10
```

### Fetch From Specific Sources

```bash
# TechCrunch and BBC only
node scripts/fetch-news.js --sources=techcrunch,bbc-tech --limit=10

# All technology sources
node scripts/fetch-news.js --category=Technology
```

### Test Without Inserting

```bash
# Always use --dry-run first!
node scripts/fetch-news.js --dry-run
```

### Scrape Specific Websites

```bash
# BBC and CNN only
node scripts/scrape-news.js --sites=bbc,cnn --limit=10
```

---

## Troubleshooting

### "Authentication failed"

**Problem:** Can't login to Strapi

**Solution:**
```bash
# 1. Verify Strapi is running
npm run develop

# 2. Check credentials in .env
STRAPI_ADMIN_EMAIL=your-email
STRAPI_ADMIN_PASSWORD=your-password

# 3. Or create API token in admin panel
# Settings → API Tokens → Create new token
# Add token to .env: STRAPI_API_TOKEN=your_token
```

### "No articles inserted"

**Problem:** Script runs but no articles added

**Solution:**
```bash
# 1. Check if Strapi is running
curl http://localhost:1337/api/health

# 2. Verify API permissions
# Admin → Settings → Users & Permissions → Roles → Public
# Enable: find, findOne, create for all content types

# 3. Try with fewer sources
node scripts/fetch-news.js --sources=techcrunch --limit=3
```

### "Duplicate skipped"

**Problem:** All articles are marked as duplicates

**Solution:**
This is normal if you run the script multiple times.
Articles are identified by URL - same URL = duplicate.

To clear and re-fetch:
```bash
# Delete all articles in Strapi admin
# Or use Strapi console:
npm run strapi console
> await strapi.db.query('api::news-article.news-article').deleteMany({})
```

### RSS Feed Errors

**Problem:** Failed to fetch RSS feed

**Solution:**
- Check internet connection
- Some feeds may be temporarily unavailable
- Try alternative source or use web scraping
- Use `--dry-run` to test

---

## Scheduled Fetching

### Windows (Task Scheduler)

Create `fetch-daily.bat`:
```batch
@echo off
cd /d "D:\Projects\Strapi\strapi-news"
node scripts/fetch-news.js --limit=10 >> logs\fetch.log 2>&1
```

Schedule:
1. Open Task Scheduler
2. Create Basic Task
3. Set time (e.g., daily 8 AM)
4. Select "Start a program"
5. Choose `fetch-daily.bat`

### Linux/Mac (Cron)

```bash
# Edit crontab
crontab -e

# Add: Fetch every hour
0 * * * * cd /path/to/strapi-news && node scripts/fetch-news.js --limit=5

# Add: Fetch daily at 8 AM
0 8 * * * cd /path/to/strapi-news && node scripts/fetch-news.js --limit=20
```

---

## Available Sources

### RSS Feeds (No API Key Required)

| Source | Category | Command |
|--------|----------|---------|
| TechCrunch | Technology | `--sources=techcrunch` |
| BBC Tech | Technology | `--sources=bbc-tech` |
| CNN Tech | Technology | `--sources=cnn-tech` |
| Reuters | Business | `--sources=reuters-business` |
| ESPN | Sports | `--sources=espn` |
| Variety | Entertainment | `--sources=variety` |
| Healthline | Health | `--sources=healthline` |
| Science Daily | Science | `--sources=science-daily` |

### Web Scraping

| Site | Category | Command |
|------|----------|---------|
| TechCrunch | Technology | `--sites=techcrunch` |
| BBC News | Technology | `--sites=bbc` |
| CNN | Business | `--sites=cnn` |
| Reuters | Business | `--sites=reuters` |
| ESPN | Sports | `--sites=espn` |
| Variety | Entertainment | `--sites=variety` |

---

## Best Practices

1. **Always dry-run first**
   ```bash
   node scripts/fetch-news.js --dry-run
   ```

2. **Start small**
   ```bash
   node scripts/fetch-news.js --limit=3
   ```

3. **Test specific sources**
   ```bash
   node scripts/fetch-news.js --sources=techcrunch
   ```

4. **Monitor logs**
   ```bash
   # Create logs directory
   mkdir logs
   
   # Run with logging
   node scripts/fetch-news.js >> logs\fetch.log 2>&1
   ```

5. **Respect rate limits**
   - Don't fetch too frequently
   - Use delays between requests
   - Prefer RSS feeds over scraping

---

## Next Steps

After fetching news:

1. ✅ Verify articles in Strapi admin
2. ✅ Check article quality and formatting
3. ✅ Connect your Next.js frontend
4. ✅ Set up scheduled fetching
5. ✅ Deploy to production

---

## Additional Resources

- **Full Documentation**: `NEWS_FETCH_WORKFLOW.md`
- **Configuration**: `scripts\news-sources.config.js`
- **Import Mock Data**: `npm run import-data`

## Support

If you encounter issues:
1. Check `NEWS_FETCH_WORKFLOW.md` for detailed troubleshooting
2. Review logs in console output
3. Verify Strapi is running and accessible
4. Check API permissions in admin panel

---

**Happy Fetching! 📰**
