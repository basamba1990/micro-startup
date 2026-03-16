# Smoovebox AI MVP

A production-ready SaaS platform for AI-powered video analysis and content generation. Deploy in 14 days with 3 IA modules, Supabase backend, and Stripe payments.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- Supabase account (https://supabase.com)
- OpenAI API key (https://platform.openai.com)
- Stripe account (https://stripe.com)

### 2. Installation

```bash
# Clone and install
unzip smoovebox-ai-mvp.zip
cd smoovebox-ai-mvp
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

### 3. Setup Supabase

```bash
# Create Supabase project at https://supabase.com
# Copy your project URL and anon key to .env

# Push migrations
supabase db push

# Deploy Edge Functions
supabase functions deploy linkedin-ghost
supabase functions deploy recruit-audit
supabase functions deploy realestate-clip
```

### 4. Run Locally

```bash
pnpm dev
# Open http://localhost:5173
```

### 5. Deploy to Vercel

```bash
# Push to GitHub
git push origin main

# Deploy to Vercel
vercel deploy
```

## 📦 Project Structure

```
smoovebox-ai-mvp/
├── supabase/
│   ├── migrations/          # PostgreSQL schema
│   └── functions/           # Edge Functions (LinkedIn, Recruit, RealEstate)
├── src/
│   ├── lib/                 # Supabase, OpenAI, Stripe integrations
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── modules/         # AI module components
│   │   └── Dashboard.tsx
│   ├── pages/               # Home, Payment pages
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🧠 3 AI Modules

### LinkedIn Ghost
Generate 60-second LinkedIn video scripts optimized for engagement.
- Input: Video idea
- Output: Hook + Full script + CTA
- Quota: 5/month (Freemium), 100/month (Pro), Unlimited (Enterprise)

### Recruit Audit
Analyze interview videos with communication scoring.
- Input: Interview transcript + Job title
- Output: 5 communication scores + Feedback + Recommendation
- Quota: 3/month (Freemium), 50/month (Pro), Unlimited (Enterprise)

### RealEstate Clip
Create marketing scripts for real estate properties.
- Input: Property description
- Output: 30-second script + Key highlights + SEO description
- Quota: 3/month (Freemium), 50/month (Pro), Unlimited (Enterprise)

## 💳 Pricing Plans

| Feature | Freemium | Pro | Enterprise |
|---------|----------|-----|------------|
| LinkedIn Ghost | 5/mo | 100/mo | Unlimited |
| Recruit Audit | 3/mo | 50/mo | Unlimited |
| RealEstate Clip | 3/mo | 50/mo | Unlimited |
| Price | Free | $29/mo | $299/mo |

## 🔧 Configuration

### Supabase
1. Create project at https://supabase.com
2. Copy Project URL and Anon Key
3. Add to `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### OpenAI
1. Get API key from https://platform.openai.com/account/api-keys
2. Add to `.env`:
   ```
   VITE_OPENAI_API_KEY=sk_test_...
   ```

### Stripe
1. Get keys from https://dashboard.stripe.com/apikeys
2. Add to `.env`:
   ```
   VITE_STRIPE_PUBLIC_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

## 📊 Database Schema

### Users
- id (UUID)
- email (TEXT, UNIQUE)
- full_name (TEXT)
- created_at (TIMESTAMP)

### Videos
- id (UUID)
- user_id (UUID)
- title (TEXT)
- file_path (TEXT)
- product_type (TEXT) - linkedin_ghost / recruit_audit / realestate_clip
- status (TEXT) - uploaded / processing / completed
- created_at (TIMESTAMP)

### Video Analysis
- id (UUID)
- video_id (UUID)
- clarity_score (INT)
- persuasion_score (INT)
- emotion_score (INT)
- engagement_score (INT)
- storytelling_score (INT)
- feedback (JSONB)
- generated_script (TEXT)
- generated_hook (TEXT)
- generated_cta (TEXT)

### Subscriptions
- id (UUID)
- user_id (UUID)
- plan (TEXT) - freemium / pro / enterprise
- status (TEXT) - active / canceled
- stripe_subscription_id (TEXT)
- current_period_start (TIMESTAMP)
- current_period_end (TIMESTAMP)

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Authenticated users can only access their own data
- Environment variables for all secrets
- HTTPS enforced in production

## 🚀 Deployment Checklist

- [ ] Supabase project created
- [ ] Database migrations applied
- [ ] Edge Functions deployed
- [ ] OpenAI API key configured
- [ ] Stripe account setup
- [ ] Environment variables set
- [ ] GitHub repository created
- [ ] Vercel project linked
- [ ] Custom domain configured (optional)
- [ ] SSL certificate enabled

## 📈 Next Steps

1. **Test locally**: `pnpm dev`
2. **Deploy to Vercel**: Push to GitHub and connect Vercel
3. **Monitor**: Check Supabase logs and Vercel analytics
4. **Iterate**: Gather user feedback and improve prompts
5. **Scale**: Add more modules and features

## 🆘 Troubleshooting

### Supabase Connection Error
- Verify SUPABASE_URL and SUPABASE_ANON_KEY in .env
- Check Supabase project is active
- Ensure RLS policies are correct

### OpenAI API Error
- Verify OPENAI_API_KEY is correct
- Check API key has sufficient credits
- Ensure model (gpt-4) is available

### Stripe Payment Error
- Verify STRIPE_PUBLIC_KEY and STRIPE_SECRET_KEY
- Check Stripe account is in test mode
- Ensure webhook endpoint is configured

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Vite Docs](https://vitejs.dev)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review logs in Supabase/Vercel dashboard
3. Contact support@smoovebox.ai

---

**Built with React, Supabase, OpenAI, and Stripe. Ready to deploy in 14 days.**
