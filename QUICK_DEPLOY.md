# Quick Deploy - 15 Minute Setup

Follow these steps to deploy SchedulaPro in ~15 minutes.

## Prerequisites Check ✓

- [ ] GitHub account created
- [ ] Supabase account created (free tier)
- [ ] Vercel account created (free tier)

---

## Step 1: GitHub (2 minutes)

1. Go to https://github.com/new
2. Repository name: `schedulapro`
3. Make it **Private**
4. Click "Create repository"
5. **Keep this tab open** - you'll need the commands shown

---

## Step 2: Download & Upload Code (3 minutes)

1. In Figma Make, click the **Export** or **Download** button
2. Extract the ZIP file to a folder
3. Open terminal/command prompt in that folder
4. Run these commands (replace YOUR_USERNAME):

```bash
git init
git add .
git commit -m "Initial deployment"
git remote add origin https://github.com/YOUR_USERNAME/schedulapro.git
git branch -M main
git push -u origin main
```

---

## Step 3: Supabase Setup (5 minutes)

### Create Project
1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - Name: `SchedulaPro`
   - Password: Create strong password (**SAVE THIS!**)
   - Region: Choose nearest
4. Click "Create" (wait ~2 minutes)

### Get Credentials
1. Once ready, click **"Project Settings"** (gear icon)
2. Click **"API"** in sidebar
3. **COPY THESE** (you'll need them):
   - Project URL: `https://xxxxx.supabase.co`
   - Project ID: `xxxxx` (just the ID part)
   - anon/public key: `eyJhbGc...` (long string)
   - service_role key: `eyJhbGc...` (**Keep secret!**)

### Setup Database
1. Click **"SQL Editor"** in sidebar
2. Click **"New Query"**
3. Paste this SQL:

```sql
-- Create KV Store table
CREATE TABLE IF NOT EXISTS kv_store_f3e46fd1 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE kv_store_f3e46fd1 ENABLE ROW LEVEL SECURITY;

-- Allow authenticated access
CREATE POLICY "authenticated_access" ON kv_store_f3e46fd1 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow service role access
CREATE POLICY "service_role_access" ON kv_store_f3e46fd1 
FOR ALL TO service_role USING (true) WITH CHECK (true);
```

4. Click **"Run"** (bottom right)
5. Should see "Success" message

### Deploy Edge Function

**Install Supabase CLI** (choose one):

**Mac/Linux:**
```bash
brew install supabase/tap/supabase
```

**Windows PowerShell:**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**OR use npm:**
```bash
npm install -g supabase
```

**Deploy function:**
```bash
# Login
supabase login

# Link to your project (use Project ID from step 3.2)
supabase link --project-ref YOUR_PROJECT_ID

# Deploy
supabase functions deploy server
```

---

## Step 4: Update Code (2 minutes)

1. Open your code folder
2. Open file: `/utils/supabase/info.tsx`
3. Replace with your Supabase credentials:

```typescript
export const projectId = 'YOUR_PROJECT_ID';
export const publicAnonKey = 'YOUR_ANON_KEY';
```

4. Save file
5. Push changes:

```bash
git add .
git commit -m "Add Supabase credentials"
git push
```

---

## Step 5: Deploy to Vercel (3 minutes)

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Authorize GitHub if prompted
4. Select `schedulapro` repository
5. Configure:
   - Framework: **Vite** (should auto-detect)
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click **"Deploy"**
7. Wait ~2 minutes

**Your app is now live!** 🎉

---

## Step 6: Test (2 minutes)

1. Click the deployment URL (e.g., `schedulapro.vercel.app`)
2. Click **"Sign Up"**
3. Create test account:
   - Email: `admin@test.com`
   - Password: `Test123!`
   - Name: `Admin User`
   - Role: `Program Head`
4. Should see Dashboard with data

---

## Troubleshooting

### "Invalid login credentials"
- Clear browser cache
- Try a different email
- Check Supabase → Authentication is enabled

### "Request failed" errors
- Verify credentials in `/utils/supabase/info.tsx`
- Check Edge Function is deployed: `supabase functions list`
- Look at browser console for detailed errors

### Edge function won't deploy
- Make sure you linked to correct project
- Check you're in the right folder
- Verify `supabase/functions/server/index.tsx` exists

---

## What's Next?

### Disable Demo Mode (Production)

Your app currently works but may still have demo mode code. To fully switch to production:

1. Open `/src/app/hooks/useAuth.tsx`
2. Update `signUp` function to use real Supabase (see DEPLOYMENT_GUIDE.md Part 6)
3. Open `/src/app/services/ApiService.ts`
4. Remove demo mode checks (see DEPLOYMENT_GUIDE.md Part 6)

### Customize

- **Logo**: Replace in `/public` folder
- **Colors**: Update `/src/styles/theme.css`
- **Name**: Update `<title>` in `/index.html`

### Add Custom Domain

1. Buy domain (Namecheap, Google Domains, etc.)
2. Vercel Dashboard → Settings → Domains
3. Add domain and follow instructions

### Invite Team

1. Share your deployment URL
2. Have them sign up with their email
3. Assign appropriate roles

---

## Your URLs

Save these for reference:

- **Live App**: `https://YOUR-APP.vercel.app`
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **Supabase Dashboard**: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID`
- **GitHub Repo**: `https://github.com/YOUR_USERNAME/schedulapro`

---

## Support

Need help? Check:
- Full guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Supabase docs: https://supabase.com/docs
- Vercel docs: https://vercel.com/docs

---

**Total Time: ~15 minutes**

**Status: Your SchedulaPro is now deployed and accessible worldwide! 🚀**
