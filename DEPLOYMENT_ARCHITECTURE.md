# SchedulaPro Deployment Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│                     (schedulapro.vercel.app)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL (Frontend Host)                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Static React App (dist/)                                 │  │
│  │  • HTML, CSS, JavaScript                                  │  │
│  │  • Optimized bundles                                      │  │
│  │  • CDN cached globally                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              │ (JWT Auth)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SUPABASE (Backend Platform)                   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Edge Functions (Deno Runtime)                         │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │  /functions/v1/make-server-f3e46fd1/*           │  │    │
│  │  │                                                  │  │    │
│  │  │  Routes:                                         │  │    │
│  │  │  • POST /schedules                              │  │    │
│  │  │  • GET  /schedules                              │  │    │
│  │  │  • PUT  /schedules/:id                          │  │    │
│  │  │  • POST /faculty                                │  │    │
│  │  │  • GET  /faculty                                │  │    │
│  │  │  • POST /rooms                                  │  │    │
│  │  │  • GET  /rooms                                  │  │    │
│  │  │  • POST /courses                                │  │    │
│  │  │  • GET  /courses                                │  │    │
│  │  │  • POST /sections                               │  │    │
│  │  │  • GET  /sections                               │  │    │
│  │  │  • POST /approvals                              │  │    │
│  │  │  • POST /validations                            │  │    │
│  │  │  • GET  /audit-trail                            │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                  │
│                              ▼                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  PostgreSQL Database                                   │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │  Tables:                                         │  │    │
│  │  │  • kv_store_f3e46fd1 (main data storage)       │  │    │
│  │  │    - schedules                                   │  │    │
│  │  │    - faculty                                     │  │    │
│  │  │    - rooms                                       │  │    │
│  │  │    - courses                                     │  │    │
│  │  │    - sections                                    │  │    │
│  │  │    - audit_logs                                  │  │    │
│  │  │    - approvals                                   │  │    │
│  │  │    - version_history                             │  │    │
│  │  │                                                  │  │    │
│  │  │  • auth.users (Supabase Auth)                   │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Authentication Service                                │    │
│  │  • JWT token generation                               │    │
│  │  • User sessions                                      │    │
│  │  • Role-based access control                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Storage (Optional)                                    │    │
│  │  • File uploads                                       │    │
│  │  • Document storage                                   │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Request Flow

### 1. User Sign Up Flow

```
Browser                    Vercel                  Supabase
   │                         │                         │
   │──Sign Up Form────────▶  │                         │
   │                         │                         │
   │                         │──POST /auth/signup────▶ │
   │                         │   (email, password)     │
   │                         │                         │
   │                         │                         │──Create User
   │                         │                         │  in auth.users
   │                         │                         │
   │                         │◀────JWT Token───────────│
   │◀──Store Token──────────│                         │
   │   (localStorage)        │                         │
   │                         │                         │
   │──Navigate to Dashboard─│                         │
```

### 2. Data Fetch Flow

```
Browser                    Vercel                  Supabase
   │                         │                         │
   │──GET /schedules───────▶ │                         │
   │  (with JWT token)       │                         │
   │                         │                         │
   │                         │──GET /schedules───────▶ │
   │                         │  Authorization: Bearer  │
   │                         │                         │
   │                         │                         │──Verify JWT
   │                         │                         │
   │                         │                         │──Query Database
   │                         │                         │  SELECT * FROM
   │                         │                         │  kv_store...
   │                         │                         │
   │                         │◀────JSON Response───────│
   │◀──Display Data─────────│                         │
```

### 3. Create Schedule Flow

```
Browser                    Vercel                  Supabase
   │                         │                         │
   │──Create Schedule──────▶ │                         │
   │  (schedule data)        │                         │
   │                         │                         │
   │                         │──POST /schedules──────▶ │
   │                         │  (with JWT + data)      │
   │                         │                         │
   │                         │                         │──Validate JWT
   │                         │                         │
   │                         │                         │──Run Validations
   │                         │                         │  • Room capacity
   │                         │                         │  • Time conflicts
   │                         │                         │  • Faculty load
   │                         │                         │
   │                         │                         │──Save to Database
   │                         │                         │  INSERT INTO
   │                         │                         │  kv_store...
   │                         │                         │
   │                         │                         │──Create Audit Log
   │                         │                         │
   │                         │◀────Success Response────│
   │◀──Show Toast───────────│                         │
   │  "Schedule created!"    │                         │
```

---

## Technology Stack Details

### Frontend (Vercel)
```
┌─────────────────────────────┐
│  React 18.3.1               │
│  ├─ TypeScript              │
│  ├─ Vite 6.3.5              │
│  ├─ Tailwind CSS 4.1.12     │
│  ├─ Radix UI Components     │
│  ├─ React DnD (drag/drop)   │
│  ├─ Recharts (analytics)    │
│  └─ Supabase JS Client      │
└─────────────────────────────┘
```

### Backend (Supabase)
```
┌─────────────────────────────┐
│  Deno Runtime               │
│  ├─ Hono Web Framework      │
│  ├─ PostgreSQL 15           │
│  ├─ JWT Authentication      │
│  ├─ Row Level Security      │
│  └─ Automatic Backups       │
└─────────────────────────────┘
```

---

## Data Storage Structure

### Key-Value Store (kv_store_f3e46fd1)

```
┌────────────────────────────────────────────────────────┐
│  key (TEXT)          │  value (JSONB)                  │
├────────────────────────────────────────────────────────│
│  schedule:001        │  { id, name, items, status... } │
│  schedule:002        │  { id, name, items, status... } │
│  faculty:001         │  { id, name, email, load... }   │
│  room:LAB-101        │  { id, name, type, capacity...} │
│  course:CS101        │  { id, code, name, units... }   │
│  section:CS-1A       │  { id, name, year, size... }    │
│  audit:20250107-001  │  { action, user, timestamp... } │
│  approval:001        │  { scheduleId, approver... }    │
└────────────────────────────────────────────────────────┘
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: HTTPS/TLS                                     │
│  • All traffic encrypted                                │
│  • Automatic SSL certificates (Vercel + Supabase)       │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 2: JWT Authentication                            │
│  • Tokens expire after 1 hour                           │
│  • Signed with secret key                               │
│  • Includes user ID and role                            │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 3: Row Level Security (RLS)                      │
│  • Database enforces access policies                    │
│  • Users can only access authorized data                │
│  • Service role has full access (server only)           │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Application Logic                             │
│  • Role-based UI rendering                              │
│  • API endpoint authorization                           │
│  • Validation services                                  │
└─────────────────────────────────────────────────────────┘
```

---

## Deployment Pipeline

```
Developer                GitHub                 Vercel
    │                      │                       │
    │──git push──────────▶ │                       │
    │                      │                       │
    │                      │──webhook trigger────▶ │
    │                      │                       │
    │                      │                       │──Pull Code
    │                      │                       │
    │                      │                       │──npm install
    │                      │                       │
    │                      │                       │──npm run build
    │                      │                       │
    │                      │                       │──Optimize Assets
    │                      │                       │
    │                      │                       │──Deploy to CDN
    │                      │                       │
    │                      │◀──Deployment URL──────│
    │◀──Deploy Success────│                       │
    │  (email notification)│                       │
    │                      │                       │
    │                      │                  LIVE! 🚀
```

---

## Monitoring & Logs

### Frontend (Vercel)
- ✅ Real-time deployment logs
- ✅ Performance metrics
- ✅ Error tracking
- ✅ Analytics (optional)

### Backend (Supabase)
- ✅ Database query logs
- ✅ Function execution logs
- ✅ Authentication events
- ✅ API request logs

---

## Scalability

### Current Setup (Free Tier)
```
Users:      Up to 50,000 MAU
Database:   500 MB
Storage:    2 GB
Bandwidth:  100 GB/month
Functions:  500K invocations/month
```

### Production Setup (Paid Tier)
```
Users:      Unlimited
Database:   8+ GB (expandable)
Storage:    100+ GB (expandable)
Bandwidth:  1+ TB/month
Functions:  Unlimited invocations
Backups:    Daily automatic backups
Support:    Priority support
```

---

## Cost Breakdown

### Free Tier (Good for 1-2 schools)
- Vercel: $0/month
- Supabase: $0/month
- **Total: $0/month**

### Starter (Good for 5-10 schools)
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- **Total: $45/month**

### Production (Enterprise)
- Vercel Team: $100/month
- Supabase Team: $99/month
- **Total: $199/month**

---

## Backup & Recovery

```
┌──────────────────────────────────────────────┐
│  Automatic Backups (Supabase Pro)            │
│  • Daily database snapshots                  │
│  • 7-day retention                           │
│  • Point-in-time recovery                    │
│  • One-click restore                         │
└──────────────────────────────────────────────┘
```

---

## Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| URL | localhost:5173 | schedulapro.vercel.app |
| Database | Demo mode / Local | Supabase PostgreSQL |
| Auth | Mock tokens | Real JWT tokens |
| Storage | localStorage | Database + S3 |
| HTTPS | No | Yes (automatic) |
| CDN | No | Yes (global) |
| Monitoring | Console logs | Full analytics |

---

This architecture provides a **production-ready, scalable, and secure** foundation for SchedulaPro! 🚀
