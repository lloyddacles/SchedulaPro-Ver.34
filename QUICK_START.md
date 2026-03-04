# ⚡ SchedulaPro - 5-Minute Quick Start

## 🎯 Fastest Way to See Your App Running

### Step 1: Install Node.js (if you don't have it)
**Download:** https://nodejs.org/ (Choose the LTS version)
**Check:** Open terminal and type: `node --version`

---

### Step 2: Install Dependencies
```bash
# Open terminal in your project folder
npm install
```
⏱️ Takes 2-5 minutes

---

### Step 3: Run the App
```bash
npm run dev
```

You'll see:
```
➜  Local:   http://localhost:5173/
```

---

### Step 4: Open in Browser
Click the link or go to: **http://localhost:5173/**

---

### Step 5: Test the App
1. Click **"Sign Up"**
2. Enter any email: `test@example.com`
3. Enter any password: `password123`
4. Choose role: **"Program Assistant"**
5. Click **"Sign Up"**

**🎉 You're in! The app is now running in demo mode.**

---

## ✨ What You Can Do Now

### As Program Assistant:
- ✅ View dashboard with statistics
- ✅ Create new schedules
- ✅ Use drag-and-drop schedule builder
- ✅ Add courses, faculty, rooms, sections
- ✅ See real-time conflict detection
- ✅ Submit schedules for approval

### Try Other Roles:
1. Sign out (top-right menu)
2. Sign up with a different email
3. Choose different role:
   - **Program Head** - Approve schedules (level 1)
   - **Admin** - Final approval, full access, reports
   - **Faculty** - View your teaching schedule

---

## 🗂️ Navigation Guide

**Sidebar Menu:**
- **Dashboard** - Overview, stats, recent activity
- **Schedule Builder** - Create schedules with drag-and-drop
- **Schedules** - View all schedules
- **Approval** - Review pending schedules (Program Head/Admin only)
- **Faculty** - Manage faculty members
- **Conflicts** - View and resolve scheduling conflicts
- **Reports** - Analytics and utilization reports (Admin only)
- **Settings** - System configuration

---

## 💾 Where is Data Stored?

**Demo Mode:** Data is stored in your browser's `localStorage`
- ✅ Persists when you refresh the page
- ⚠️ Lost if you clear browser data
- ⚠️ Only visible on this computer/browser

**Want Real Data Persistence?**
See the full `DEPLOYMENT_GUIDE.md` → Section "Set Up Real Backend"

---

## 🎨 Features to Test

### 1. Create a Schedule
1. Go to **Schedule Builder**
2. Fill in basic info (name, academic year, semester)
3. Drag courses from left panel to calendar
4. Watch for conflict warnings (red alerts)
5. Click **Save Draft** or **Submit for Approval**

### 2. Conflict Detection
- Try scheduling same faculty at same time → Faculty conflict!
- Try double-booking a room → Room conflict!
- Try scheduling same section simultaneously → Section clash!

### 3. Approval Workflow
1. Sign up as **Program Assistant**
2. Create and submit a schedule
3. Sign out, sign up as **Program Head**
4. Go to **Approval** tab
5. Review and approve
6. Sign up as **Admin**
7. Give final approval

### 4. Reports & Analytics
1. Sign up as **Admin**
2. Go to **Reports**
3. View charts:
   - Room utilization
   - Faculty workload
   - Section enrollment

---

## 🛠️ Common Issues

### "Port 5173 already in use"
```bash
# Just use a different port
npm run dev -- --port 3000
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### White screen / blank page
1. Open browser console (Press F12)
2. Look for error messages
3. Most common: Check that `npm install` completed successfully

### Changes not showing up
1. Stop the server (Ctrl+C)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Restart: `npm run dev`

---

## 📱 Mobile Testing

The app is **responsive** and works on mobile!

**Test on your phone:**
1. Make sure your phone is on same WiFi as your computer
2. Look for the "Network" URL in the terminal:
   ```
   ➜  Network: http://192.168.1.123:5173/
   ```
3. Open that URL on your phone's browser
4. Test touch interactions (drag and drop works!)

---

## 🚀 Next Steps

**After testing locally:**

1. **Read the full guide:** `DEPLOYMENT_GUIDE.md`
2. **Set up backend:** For real data persistence
3. **Deploy online:** Share with others
4. **Customize:** Add your school's branding

---

## 🎯 Quick Commands Reference

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Stop the server
Ctrl + C (or Cmd + C on Mac)
```

---

## 📊 System Requirements

**Minimum:**
- Node.js 18+
- 2GB RAM
- Any modern browser
- Internet (for first setup only)

**Recommended:**
- Node.js 20+
- 4GB RAM
- Chrome or Edge browser
- VS Code editor

---

## 🎓 Perfect For

- ✅ Student capstone projects
- ✅ Academic demos
- ✅ Portfolio projects
- ✅ Proof of concepts
- ✅ Learning React/TypeScript
- ✅ Understanding full-stack development

---

## ⏱️ Time Investment

| Task | Time Required |
|------|---------------|
| **Install Node.js** | 5 minutes |
| **Run locally** | 5 minutes |
| **Test basic features** | 15 minutes |
| **Test all roles** | 30 minutes |
| **Set up backend** | 30-60 minutes |
| **Deploy online** | 1-2 hours |

**Total to working demo: ~10 minutes** ⚡
**Total to production: ~2-3 hours** 🚀

---

## 💡 Pro Tips

1. **Use Chrome DevTools** - Press F12 to see console logs and debug
2. **Test all 4 roles** - Each has different features and permissions
3. **Try creating conflicts** - The system is smart about detecting them
4. **Export schedule data** - Demo mode uses localStorage (check Application tab in DevTools)
5. **Take screenshots** - Great for documentation and presentations

---

## ✅ Success Checklist

You know it's working when:
- [ ] App loads at localhost:5173
- [ ] You can sign up with any email
- [ ] Dashboard shows statistics
- [ ] Schedule builder has drag-and-drop
- [ ] Conflicts are detected automatically
- [ ] All navigation links work
- [ ] Different roles show different features
- [ ] No console errors (F12 → Console)

---

## 🎉 You're Ready!

**Your SchedulaPro app is now running!**

- ✅ Professional classroom scheduling system
- ✅ 4 user roles with different permissions
- ✅ Drag-and-drop interface
- ✅ Real-time conflict detection
- ✅ Approval workflows
- ✅ Reports and analytics
- ✅ Fully responsive design

**Want to take it further?**
→ Check `DEPLOYMENT_GUIDE.md` for backend setup and online deployment

---

*Need help? The full deployment guide has detailed troubleshooting and step-by-step instructions.*
