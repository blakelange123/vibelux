# Complete Vercel Setup - Ready to Deploy!

## Your Database URLs:

### Neon DATABASE_URL:
```
DATABASE_URL=postgresql://[username]:[password]@ep-muddy-brook-ade61hva-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```
**Note**: You provided `F1BIzE@ep-muddy-brook...` - the full URL should start with `postgresql://` and include the username and password.

### Upstash REDIS_URL:
```
REDIS_URL=rediss://default:AarDAAIjcDFmNTRlYmMyNTdiNjk0ZDc3YWI2YTRlMWFlZmIzYWJkMHAxMA@witty-cow-43715.upstash.io:6379
```

## Quick Deploy Steps:

### 1. Add to Vercel Environment Variables
Go to: https://vercel.com/blakelange123/vibelux-app/settings/environment-variables

Copy all variables from `VERCEL_ENV_COPY_PASTE.md` and add:
- The complete Neon DATABASE_URL (get the full connection string from Neon dashboard)
- The Redis URL above

### 2. Deploy Database Schema
Once DATABASE_URL is in Vercel, run locally:
```bash
export DATABASE_URL="postgresql://[your_full_neon_url]"
npx prisma db push --accept-data-loss
```

### 3. Deploy App
```bash
git push
```

## Need the Full Neon URL?

The format should be:
`postgresql://username:password@ep-muddy-brook-ade61hva-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require`

Check your Neon dashboard → Connection Details for the complete string.