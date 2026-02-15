# Troubleshooting Guide

## 404 Not Found Error

### Symptoms
```
{
    "data": null,
    "error": {
        "status": 404,
        "name": "NotFoundError",
        "message": "Not Found",
        "details": {}
    }
}
```

### Causes & Solutions

#### 1. Strapi Server Not Running (Most Common)

**Check if server is running:**
```bash
# In new terminal
curl http://localhost:1337/api/news
```

**If connection refused, start server:**
```bash
cd D:\Projects\Strapi\strapi-news
npm run develop
```

Wait for startup message:
```
⚡ Server started in XXX ms
✔ Welcome to Strapi
```

---

#### 2. Content Types Not Initialized

Strapi needs to rebuild content types after schema changes.

**Solution: Full Rebuild**

```bash
# Stop the server (Ctrl+C)

# Delete database
rm database/sqlite.db

# Delete cache
rm -rf .cache

# Clean node modules (optional)
rm -rf node_modules
npm install

# Restart
npm run develop
```

Expected output:
```
⚡ Server started in 5000 ms
✔ Strapi admin customization loaded
✔ Welcome to Strapi
```

---

#### 3. Content Type Still Not Registered

**Manually register through Admin UI:**

1. Go to http://localhost:1337/admin
2. Login with admin account
3. Navigate to **Content Manager**
4. Check if collections appear:
   - News
   - Categories
   - Sources

If missing, rebuild database (see #2)

---

#### 4. Wrong API Endpoint Path

**Common mistakes:**
```bash
# ❌ Wrong
http://localhost:1337/api/news/articles

# ✓ Correct
http://localhost:1337/api/news
```

**Verify endpoints:**
```bash
# News
curl http://localhost:1337/api/news

# Categories
curl http://localhost:1337/api/categories

# Sources
curl http://localhost:1337/api/sources
```

---

#### 5. Authentication/Token Issue

**If you see authentication errors:**

1. Clear token from import script:
```javascript
const API_TOKEN = ""; // Leave empty for development
```

2. Uncomment token only if authentication is enabled:
```javascript
// Comment out for development
// 'Authorization': `Bearer ${API_TOKEN}`
```

3. Test without authentication:
```bash
curl http://localhost:1337/api/news
```

---

#### 6. Database Corruption

**Symptoms:**
- Endpoints 404 even though server runs
- Data import fails
- Collections don't appear in admin

**Solution:**

```bash
# Stop server
# Delete database file
rm database/sqlite.db

# Remove cache
rm -rf .cache

# Restart
npm run develop
```

New database will be created automatically.

---

## Quick Diagnostic Script

Run the health check:

```bash
node scripts/check-api.js
```

Expected output:
```
🔍 Strapi API Health Check

Testing: http://localhost:1337/api

✓ news                         [200] OK
✓ categories                   [200] OK
✓ sources                      [200] OK

📊 Summary:
3/3 endpoints accessible

✅ All systems operational!
```

---

## Common Error Messages

### "Port Already in Use"

```bash
# Kill process on port 1337
lsof -ti:1337 | xargs kill -9

# Or start on different port
PORT=1338 npm run develop
```

### "ENOENT: no such file or directory"

```bash
# Create missing directories
mkdir -p database/migrations
mkdir -p public/uploads
```

### "Database is locked"

```bash
# Database file is corrupted
rm database/sqlite.db

# Restart to rebuild
npm run develop
```

### "Cannot find module"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run develop
```

---

## Import Data Failures

### "Failed to create news entry"

**Check:**
1. Is Strapi running? (`curl http://localhost:1337/api/news`)
2. Are categories created first? (Script creates them in order)
3. Are source IDs valid?
4. Is content published?

**Run import again:**
```bash
npm run import-data
```

---

## Verify Setup Checklist

```bash
# 1. Server running?
curl http://localhost:1337/api/news

# 2. Database exists?
ls -la database/sqlite.db

# 3. Check health
node scripts/check-api.js

# 4. Admin accessible?
# Visit http://localhost:1337/admin

# 5. Data exists?
curl http://localhost:1337/api/news?populate=*
```

---

## Reset Everything (Nuclear Option)

Start completely fresh:

```bash
cd D:\Projects\Strapi\strapi-news

# Stop server (Ctrl+C)

# Remove everything
rm -rf database/sqlite.db
rm -rf .cache
rm -rf node_modules
rm -rf package-lock.json

# Reinstall
npm install

# Start fresh
npm run develop

# Import data once server is running
npm run import-data
```

---

## Enable Debug Mode

**For more detailed error messages:**

```bash
# Add to start command
DEBUG=* npm run develop
```

Or set environment variable:

```bash
# Linux/Mac
export DEBUG=*
npm run develop

# Windows (PowerShell)
$env:DEBUG='*'
npm run develop
```

---

## Check Strapi Logs

**Location:** Console output where `npm run develop` runs

**Look for:**
- ✔ Success messages (green checkmarks)
- ✗ Error messages (red X marks)
- ⚠️ Warnings
- Database initialization messages

---

## Database Issues

### Check SQLite Database

```bash
# Verify file exists
ls -la database/sqlite.db

# Check file size (should be > 1MB if data exists)
du -h database/sqlite.db

# View database info
sqlite3 database/sqlite.db ".tables"
```

### Force Database Rebuild

```bash
rm database/sqlite.db
rm -rf .cache
npm run develop
```

---

## Network/CORS Issues

### From Frontend (Next.js)

If you see CORS errors when fetching from frontend:

**Check Strapi CORS config:**

**`config/middlewares.ts`**
```typescript
{
    name: 'strapi::cors',
    config: {
        origin: ['http://localhost:3000'],
        credentials: true,
    },
}
```

### Test CORS

```bash
# From frontend machine
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     http://localhost:1337/api/news
```

---

## Performance Issues

### Slow API Responses

1. **Check pagination:**
```bash
# Limit results
curl http://localhost:1337/api/news?pagination[pageSize]=10
```

2. **Don't populate all relations:**
```bash
# Avoid
curl http://localhost:1337/api/news?populate=*

# Better
curl http://localhost:1337/api/news?populate=category,source
```

3. **Check database size:**
```bash
du -h database/sqlite.db
```

4. **Clear cache:**
```bash
rm -rf .cache
npm run develop
```

---

## Getting Help

### Check Official Docs

- [Strapi Documentation](https://docs.strapi.io)
- [Strapi Discord Community](https://discord.strapi.io)
- [Strapi GitHub Issues](https://github.com/strapi/strapi/issues)

### Collect Debug Info

When reporting issues, provide:
1. Node version: `node --version`
2. Strapi version: `npm list strapi`
3. Error message (full)
4. Console output
5. Steps to reproduce

### Error Log Collection

```bash
# Capture full log
npm run develop > strapi.log 2>&1

# View log
cat strapi.log

# Share log for debugging
```

---

## Quick Fix Summary

| Issue | Fix |
|-------|-----|
| 404 Error | Restart server: `npm run develop` |
| No Data | Run: `npm run import-data` |
| Content Types Missing | Rebuild: `rm database/sqlite.db && npm run develop` |
| Port in Use | `lsof -ti:1337 \| xargs kill -9` |
| Module Not Found | `npm install` |
| Database Locked | `rm database/sqlite.db` |
| CORS Error | Check `config/middlewares.ts` |
| Slow Response | Add pagination: `?pagination[pageSize]=10` |

---

## Success Indicators

✅ Server started
```
⚡ Server started in XXX ms
```

✅ Admin panel loads
```
http://localhost:1337/admin
```

✅ API responds
```bash
$ curl http://localhost:1337/api/news
{"data":[...]}
```

✅ Health check passes
```bash
$ node scripts/check-api.js
✅ All systems operational!
```

✅ Data imported
```bash
$ npm run import-data
✅ Data import completed successfully!
```
