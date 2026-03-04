# SchedulaPro Deployment Checklist

Print this checklist and check off items as you complete them.

---

## 📋 Pre-Deployment

- [ ] Downloaded all code from Figma Make
- [ ] Extracted ZIP file to local folder
- [ ] Opened terminal/command prompt in project folder
- [ ] Have text editor ready (VS Code, Sublime, etc.)

---

## 🔑 Account Setup

- [ ] Created GitHub account (https://github.com)
- [ ] Created Supabase account (https://supabase.com)
- [ ] Created Vercel account (https://vercel.com)

---

## 📦 GitHub Repository

- [ ] Created new repository named `schedulapro`
- [ ] Set repository to Private
- [ ] Copied repository URL
- [ ] Ran `git init` in project folder
- [ ] Ran `git add .`
- [ ] Ran `git commit -m "Initial deployment"`
- [ ] Ran `git remote add origin [URL]`
- [ ] Ran `git push -u origin main`
- [ ] Verified code is on GitHub

---

## 🗄️ Supabase Backend

### Project Creation
- [ ] Created new Supabase project named "SchedulaPro"
- [ ] Chose region closest to users
- [ ] Created strong database password
- [ ] **SAVED database password securely**
- [ ] Waited for project to initialize (~2 min)

### Credentials Collection
- [ ] Copied Project URL
- [ ] Copied Project ID  
- [ ] Copied anon/public key
- [ ] Copied service_role key (**KEEP SECRET**)
- [ ] Saved all credentials in secure location

### Database Setup
- [ ] Opened SQL Editor in Supabase
- [ ] Created new query
- [ ] Pasted database schema SQL
- [ ] Ran query successfully
- [ ] Verified table `kv_store_f3e46fd1` exists

### Edge Function Deployment
- [ ] Installed Supabase CLI
  - [ ] Mac: `brew install supabase/tap/supabase`
  - [ ] Windows: `scoop install supabase`
  - [ ] Alternative: `npm install -g supabase`
- [ ] Ran `supabase login`
- [ ] Ran `supabase link --project-ref [PROJECT_ID]`
- [ ] Ran `supabase functions deploy server`
- [ ] Verified deployment succeeded

### Authentication Setup
- [ ] Went to Authentication → Providers
- [ ] Verified Email provider is enabled
- [ ] (Optional) Configured email templates

---

## ⚙️ Code Configuration

- [ ] Opened `/utils/supabase/info.tsx`
- [ ] Updated `projectId` with my Supabase Project ID
- [ ] Updated `publicAnonKey` with my anon key
- [ ] Saved file
- [ ] Committed changes: `git add .`
- [ ] Committed changes: `git commit -m "Update Supabase config"`
- [ ] Pushed changes: `git push`

---

## 🚀 Vercel Deployment

- [ ] Went to https://vercel.com/new
- [ ] Clicked "Import Git Repository"
- [ ] Connected GitHub account
- [ ] Selected `schedulapro` repository
- [ ] Verified Framework: Vite
- [ ] Verified Build Command: `npm run build`
- [ ] Verified Output Directory: `dist`
- [ ] Clicked "Deploy"
- [ ] Waited for deployment (~2 min)
- [ ] **SAVED deployment URL**

---

## ✅ Testing

### Basic Functionality
- [ ] Opened deployment URL in browser
- [ ] Clicked "Sign Up"
- [ ] Created test account:
  - [ ] Email: `admin@test.com`
  - [ ] Password: `Test123!`
  - [ ] Name: `Admin User`
  - [ ] Role: `Program Head`
- [ ] Successfully logged in
- [ ] Dashboard loaded with data
- [ ] Opened browser console (F12)
- [ ] No critical errors in console

### Data Persistence
- [ ] Created a test schedule
- [ ] Added courses to schedule
- [ ] Saved schedule
- [ ] Refreshed browser (F5)
- [ ] Schedule still exists (data persisted!)

### Backend Connection
- [ ] Opened Network tab in browser (F12)
- [ ] Performed an action (create/edit)
- [ ] Saw API calls to Supabase URL
- [ ] API calls returned 200 status (not 401/403)

### Multi-User Test (Optional)
- [ ] Opened incognito/private window
- [ ] Signed up as different user
- [ ] Both users can work simultaneously
- [ ] Changes from one user don't affect other

---

## 🎨 Customization (Optional)

- [ ] Updated app title in HTML
- [ ] Changed logo/branding
- [ ] Modified color theme
- [ ] Added custom domain
- [ ] Configured custom email templates

---

## 🔐 Security Review

- [ ] service_role key is NOT in frontend code
- [ ] service_role key is NOT in GitHub
- [ ] `.gitignore` includes `.env` files
- [ ] RLS policies are enabled on database
- [ ] HTTPS is enabled (automatic with Vercel)

---

## 📊 Production Mode (Optional)

- [ ] Removed demo mode from `useAuth.tsx`
- [ ] Removed demo mode from `ApiService.ts`
- [ ] Tested real authentication
- [ ] Committed and pushed changes
- [ ] Vercel auto-deployed updates

---

## 📝 Documentation

- [ ] Created admin login credentials
- [ ] Documented deployment URLs
- [ ] Saved Supabase credentials securely
- [ ] Created user guide for team (optional)
- [ ] Set up monitoring/alerts (optional)

---

## 🎯 Post-Deployment

- [ ] Shared deployment URL with team
- [ ] Created accounts for team members
- [ ] Verified each role works correctly:
  - [ ] Program Assistant
  - [ ] Program Head
  - [ ] Higher Administration
  - [ ] Faculty
- [ ] Backed up database (Supabase auto-backup)
- [ ] Set up email notifications (optional)

---

## 📌 Important URLs (Fill In)

```
Live Application:
https://___________________________.vercel.app

GitHub Repository:
https://github.com/_______________/schedulapro

Supabase Dashboard:
https://supabase.com/dashboard/project/_______________

Vercel Dashboard:
https://vercel.com/_______________/schedulapro
```

---

## 🆘 Troubleshooting Done

If you encountered issues, check these off as you resolve them:

- [ ] Fixed "Invalid login credentials" error
- [ ] Fixed "Request failed" error  
- [ ] Fixed API 401/403 errors
- [ ] Fixed CORS errors
- [ ] Fixed deployment build errors
- [ ] Verified environment variables
- [ ] Checked Supabase logs
- [ ] Reviewed browser console errors

---

## ✨ Success Criteria

All of these should be ✓ for successful deployment:

- ✅ App is accessible via public URL
- ✅ Users can sign up and log in
- ✅ Data persists after page refresh
- ✅ No errors in browser console
- ✅ API calls return 200 status codes
- ✅ All user roles work correctly
- ✅ Schedules can be created and saved
- ✅ Approval workflow functions
- ✅ Reports generate successfully

---

## 🎉 Deployment Status

**Date Deployed**: _______________

**Deployment Time**: _______________ (should be ~15 minutes)

**Deployed By**: _______________

**Status**: 
- [ ] ✅ Successfully Deployed
- [ ] ⚠️ Deployed with Minor Issues (documented above)
- [ ] ❌ Deployment Failed (see troubleshooting)

---

## 📞 Support Resources

- Full Guide: `DEPLOYMENT_GUIDE.md`
- Quick Guide: `QUICK_DEPLOY.md`
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- GitHub Issues: Create in your repository

---

**Congratulations on deploying SchedulaPro! 🚀**

**Next Steps:**
1. Invite your team
2. Import real data
3. Configure notifications
4. Set up backups
5. Monitor usage
