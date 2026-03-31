# PostgreSQL Migration Guide

How to switch from SQLite (development) to PostgreSQL (production).

## Prerequisites

- PostgreSQL 14+ installed and running
- A database created for Strapi

## Step 1: Create the PostgreSQL Database

```sql
CREATE USER strapi WITH PASSWORD 'your_secure_password';
CREATE DATABASE pmcnews OWNER strapi;
GRANT ALL PRIVILEGES ON DATABASE pmcnews TO strapi;
```

## Step 2: Install the PostgreSQL Driver

```bash
npm install pg
```

## Step 3: Set Environment Variables

Update your `.env` file (or set env vars in your hosting platform):

```env
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=pmcnews
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your_secure_password
DATABASE_SSL=false
```

For cloud-hosted PostgreSQL (e.g., Supabase, Neon, Railway), you can use a connection string instead:

```env
DATABASE_CLIENT=postgres
DATABASE_URL=postgresql://strapi:password@host:5432/pmcnews
DATABASE_SSL=true
```

## Step 4: Build and Start

```bash
npm run build
npm run start
```

Strapi will automatically create all tables on first start. No manual migration is needed — the schema is defined in `src/api/*/content-types/*/schema.json` and applied automatically.

## Step 5: Create Admin Account

Open `http://your-host:1337/admin` and create a new admin account (the SQLite admin account does not carry over).

## Step 6: Configure Permissions

1. Go to **Settings → Users & Permissions → Roles → Public**
2. Enable `find` and `findOne` for News, Category, and Source
3. Save

## Step 7: Import Seed Data (Optional)

Create an API token (Settings → API Tokens → Full access), then:

```bash
STRAPI_API_TOKEN=your_token npm run import-data
```

## Notes

- **No data migration**: SQLite data is not transferred to PostgreSQL. Use the import script to repopulate.
- **`config/database.ts`** already handles both SQLite and PostgreSQL — the `DATABASE_CLIENT` env var controls which is used, defaulting to `sqlite`.
- **SSL**: Set `DATABASE_SSL=true` for cloud-hosted databases. For self-signed certs, you may also need `DATABASE_SSL_REJECT_UNAUTHORIZED=false`.
- **Connection pooling**: Defaults are `min: 2, max: 10`. Adjust with `DATABASE_POOL_MIN` and `DATABASE_POOL_MAX` env vars if needed.
