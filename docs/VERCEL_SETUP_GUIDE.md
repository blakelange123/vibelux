# 🚀 Vercel Deployment Setup Guide

Your Visual Operations Intelligence platform is now ready for deployment! Follow these steps to connect your project to Vercel and enable automatic deployments.

## Step 1: Complete Vercel Login

Since the CLI login is interactive, please complete these steps manually:

1. **Complete Vercel Login:**
   ```bash
   vercel login
   ```
   - Choose "Continue with GitHub" when prompted
   - Authorize Vercel in your browser
   - Return to the terminal when authentication is complete

## Step 2: Create GitHub Repository

1. **Go to GitHub.com and create a new repository:**
   - Repository name: `vibelux-app`
   - Description: "Visual Operations Intelligence Platform for CEA"
   - Make it Public or Private (your choice)
   - Don't initialize with README, .gitignore, or license

2. **Add GitHub remote to your local repository:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/vibelux-app.git
   git push -u origin main
   ```

## Step 3: Deploy to Vercel

Once your GitHub repository is created and pushed:

```bash
# Deploy your project to Vercel
vercel

# Follow the prompts:
# - Link to existing project: No
# - Project name: vibelux-app
# - Directory: ./
# - Override settings: No
```

## Step 4: Configure Environment Variables

After deployment, you need to add your environment variables in the Vercel dashboard:

### Required Environment Variables:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/dbname

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret-key
CLERK_SECRET_KEY=your-clerk-secret-key

# Stripe Payments
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key

# AI Services
OPENAI_API_KEY=your-openai-api-key
CLAUDE_API_KEY=your-anthropic-api-key

# Database & Cache
REDIS_URL=redis://your-redis-url

# Email
SENDGRID_API_KEY=your-sendgrid-api-key

# Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket-name

# External APIs
OPENWEATHER_API_KEY=your-weather-api-key
```

### To add these variables:

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your `vibelux-app` project
3. Go to Settings → Environment Variables
4. Add each variable for all environments (Production, Preview, Development)

## Step 5: Configure Database

Your deployment includes comprehensive database schema. Set up your production database:

1. **Create a PostgreSQL database** (recommended: Vercel Postgres, Supabase, or Railway)

2. **Run database migrations:**
   ```bash
   # Set your DATABASE_URL environment variable locally
   export DATABASE_URL="your-production-database-url"
   
   # Generate Prisma client
   npx prisma generate
   
   # Deploy database schema
   npx prisma migrate deploy
   
   # Seed initial data (optional)
   npm run db:seed
   ```

## Step 6: Enable Automatic Deployments

Once connected to GitHub, Vercel will automatically:

✅ **Deploy on every push to main branch**
✅ **Create preview deployments for pull requests** 
✅ **Run build checks and tests**
✅ **Generate deployment URLs**

## Step 7: Verify Deployment

1. **Check deployment status** in Vercel dashboard
2. **Test your live URL** (provided after deployment)
3. **Verify database connections** by visiting `/api/health`
4. **Test key features** like user registration and AI assistant

## Step 8: Set Up Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to Domains
3. Add your custom domain (e.g., `app.vibelux.com`)
4. Configure DNS as instructed by Vercel

## Step 9: Enable Monitoring

Your app includes built-in monitoring:

- **Health checks**: `/api/health`
- **Performance monitoring**: Automatic via Vercel Analytics
- **Error tracking**: Built into the application
- **Database monitoring**: Via Prisma metrics

## Deployment Commands Reference

```bash
# Initial deployment
vercel

# Deploy to production
vercel --prod

# Deploy specific branch/environment
vercel --target production

# Check deployment status
vercel list

# View deployment logs
vercel logs

# Roll back deployment
vercel rollback [deployment-url]
```

## Automatic Update Workflow

Once connected, your update workflow is simple:

```bash
# 1. Make changes locally
git add .
git commit -m "feat: add new feature"

# 2. Push to GitHub
git push origin main

# 3. Vercel automatically deploys!
# Check deployment at: https://vercel.com/dashboard
```

## Environment-Specific Deployments

- **Production**: Pushes to `main` branch
- **Staging**: Pushes to `staging` branch (if configured)
- **Preview**: Any pull request creates a preview deployment

## Troubleshooting

### Build Fails?
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify `package.json` scripts are correct

### Database Connection Issues?
- Verify `DATABASE_URL` is correctly set
- Check database server allows connections from Vercel IPs
- Run `npx prisma migrate deploy` if schema is outdated

### API Routes Not Working?
- Check function timeout settings in `vercel.json`
- Verify middleware configuration
- Review API route logs in Vercel dashboard

## Next Steps

1. ✅ Complete Vercel authentication
2. ✅ Create GitHub repository and push code
3. ✅ Deploy to Vercel
4. ✅ Configure environment variables
5. ✅ Set up production database
6. ✅ Test deployment
7. ✅ Configure custom domain (optional)

Your Visual Operations Intelligence platform is now production-ready with:
- 🔒 Enterprise-grade security
- 📱 Mobile-responsive design
- 🤖 AI-powered features
- 💳 Stripe payment processing
- 📊 Advanced analytics
- 🔄 Automatic deployments

## Support

If you encounter any issues:
1. Check the Vercel dashboard for deployment logs
2. Review the troubleshooting section above
3. Refer to `/docs/HOSTING_DEPLOYMENT.md` for detailed deployment options

🎉 **Your platform is ready to scale!**