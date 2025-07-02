# Copy-Paste Environment Variables for Vercel

Go to: https://vercel.com/blakelange123/vibelux-app/settings/environment-variables

Copy and paste each line below as separate environment variables:

## 🔴 DATABASE & CACHE:

```
DATABASE_URL=postgres://neondb_owner:npg_q9kupLF1BIzE@ep-muddy-brook-ade61hva-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
REDIS_URL=rediss://default:AarDAAIjcDFmNTRlYmMyNTciNjk0ZDc3YWI2YTRlMWFlZmIzYWJkMHAxMA@witty-cow-43715.upstash.io:6379
```

## 🔴 SECURITY KEYS (Copy exactly as shown):

```
JWT_SECRET=Xhn/hPnWm3OhN1aXmq3suvgvLDoN7KxtyU59utM0I6s=
ENCRYPTION_KEY=lbLfkAufkU4ETWRYAGw5PkLr+m0eJRRpDBaIRuC8DDc=
SESSION_SECRET=BVWLzFnG0/P9AfcnbblKYihoJzyXNcu+htyySu5peuY=
MASTER_KEY=5qCS4zDGdlRWICK5TlyQinG/zexr7fr5BT/o6F6HkZk=
```

## 🔴 APP CONFIGURATION (Copy exactly as shown):

```
NEXT_PUBLIC_APP_URL=https://vibelux-app.vercel.app
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## 🔴 AUTHENTICATION - CLERK (From your .env.local):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cGxlYXNlZC1vc3RyaWNoLTcwLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_IZuAb6YBmFclG7GOVi4nrfkdw9f7Kdre3pDzrdbU8x
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## 🟡 INFLUXDB (From your .env.local):

```
INFLUXDB_URL=http://localhost:8086
INFLUXDB_ORG=vibelux
INFLUXDB_BUCKET=vibelux_sensors
INFLUXDB_TOKEN=ceNkFNi-m2fYz7bq6gKhtA7pT2q4rFLf6GVSBJfjg71HsNe8Imm9syc2IvYTAXI21w7XBfLsStBme4ozIXUeYA==
INFLUXDB_ADMIN_USER=vibelux_admin
INFLUXDB_ADMIN_PASSWORD=vibelux_secure_2025
```

## 🟡 FEATURE FLAGS (Copy exactly as shown):

```
NEXT_PUBLIC_USE_OPENAI=false
NEXT_PUBLIC_USE_CLAUDE=true
NEXT_PUBLIC_BYPASS_PAYWALLS=true
ENABLE_ANALYTICS=true
ENABLE_COMPLIANCE_TRACKING=true
ENABLE_DOCUMENT_PROCESSING=true
ENABLE_FINANCIAL_AUTOMATION=true
ENABLE_IOT_MONITORING=true
ENABLE_MARKETPLACE=true
ENABLE_ML_PREDICTIONS=true
ENABLE_UTILITY_INTEGRATION=true
```

## 🟡 TEMPORARY DUMMY VALUES (For services you'll set up later):

```
STRIPE_SECRET_KEY=sk_test_dummy_replace_later
STRIPE_WEBHOOK_SECRET=whsec_dummy_replace_later
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_dummy_replace_later
SENDGRID_API_KEY=SG_dummy_replace_later
OPENAI_API_KEY=sk_dummy_replace_later
CLAUDE_API_KEY=sk_dummy_replace_later
OPENWEATHER_API_KEY=dev_placeholder_key
NREL_API_KEY=dev_placeholder_key
NEXT_PUBLIC_OPENWEATHER_API_KEY=dev_placeholder_key
NEXT_PUBLIC_NREL_API_KEY=dev_placeholder_key
NEXT_PUBLIC_PLANTNET_API_KEY=dev_placeholder_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=dev_placeholder_key
PUSHER_APP_ID=dummy_pusher_app_id
PUSHER_SECRET=dummy_pusher_secret
NEXT_PUBLIC_PUSHER_KEY=dummy_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=us2
SENTRY_DSN=dummy_sentry_dsn
SLACK_WEBHOOK_URL=dummy_slack_webhook
```

## ⚠️ CREDENTIALS TO ROTATE IMMEDIATELY:

### AWS (Create new IAM user - these are exposed):
```
AWS_ACCESS_KEY_ID=[CREATE_NEW_AWS_IAM_USER]
AWS_SECRET_ACCESS_KEY=[CREATE_NEW_AWS_IAM_USER]
AWS_REGION=us-east-1
AWS_S3_BUCKET=[YOUR_S3_BUCKET_NAME]
```

### Twilio (Get new keys - these are exposed):
```
TWILIO_ACCOUNT_SID=[GET_NEW_FROM_TWILIO_DASHBOARD]
TWILIO_AUTH_TOKEN=[GET_NEW_FROM_TWILIO_DASHBOARD]
TWILIO_API_KEY_SID=[GET_NEW_FROM_TWILIO_DASHBOARD]
TWILIO_API_KEY_SECRET=[GET_NEW_FROM_TWILIO_DASHBOARD]
TWILIO_PHONE_NUMBER=+18669726974
```

---

## Instructions:

1. **First**: Add DATABASE_URL and REDIS_URL from your dashboards
2. **Then**: Copy/paste all the other variables above
3. **Finally**: Test deployment by pushing to git

## To Get Missing URLs:

- **Neon DATABASE_URL**: From your Neon quickstart (the first DATABASE_URL)
- **Upstash REDIS_URL**: From your Upstash console (the URL after `redis-cli --tls -u`)

Once you add these, your app should deploy successfully!