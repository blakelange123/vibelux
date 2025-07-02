# Clean Vercel Environment Setup

## Add to Vercel Environment Variables

Go to: https://vercel.com/blakelange123/vibelux-app/settings/environment-variables

## 🔴 CRITICAL (Required for app to start):

```bash
# Database (from Neon)
DATABASE_URL=[Your Neon connection string]

# Redis (from Upstash)  
REDIS_URL=[Your Upstash Redis URL]

# Security Keys
JWT_SECRET=Xhn/hPnWm3OhN1aXmq3suvgvLDoN7KxtyU59utM0I6s=
ENCRYPTION_KEY=lbLfkAufkU4ETWRYAGw5PkLr+m0eJRRpDBaIRuC8DDc=
SESSION_SECRET=BVWLzFnG0/P9AfcnbblKYihoJzyXNcu+htyySu5peuY=

# App Config
NEXT_PUBLIC_APP_URL=https://vibelux-app.vercel.app
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cGxlYXNlZC1vc3RyaWNoLTcwLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_IZuAb6YBmFclG7GOVi4nrfkdw9f7Kdre3pDzrdbU8x
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## 🟡 TEMPORARY (Add dummy values for now):

```bash
# Stripe (replace with real keys later)
STRIPE_SECRET_KEY=sk_test_dummy
STRIPE_WEBHOOK_SECRET=whsec_dummy
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_dummy

# Email
SENDGRID_API_KEY=SG_dummy

# AI
OPENAI_API_KEY=sk_dummy
CLAUDE_API_KEY=sk_dummy

# Feature flags
NEXT_PUBLIC_USE_OPENAI=false
NEXT_PUBLIC_USE_CLAUDE=true
NEXT_PUBLIC_BYPASS_PAYWALLS=true
```

## ⚠️ SECURITY NOTES:

1. **AWS Credentials**: Found exposed in .env.local - ROTATE IMMEDIATELY
2. **Twilio Credentials**: Found exposed in .env.local - ROTATE IMMEDIATELY  
3. **PlantNet API**: Hardcoded in source code - remove from code

## Steps:

1. Add DATABASE_URL and REDIS_URL from your dashboards
2. Add all environment variables above to Vercel
3. Run: `npx prisma db push` to deploy schema
4. Deploy with: `git push`