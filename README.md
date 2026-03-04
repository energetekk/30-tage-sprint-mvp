# 30-Tage-Sprint MVP - Source Code

> 🚀 Next.js + Supabase Web Application
> 
> **Domain:** mvpbuildr.com  
> **Status:** Beta MVP Development

---

## 🔒 License

**Proprietary Software - All Rights Reserved**

This source code is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (Pages Router)
- **Database:** Supabase (PostgreSQL + RLS)
- **Styling:** Inline CSS
- **Language:** JavaScript (TypeScript-ready)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account
- Git

### Installation
```bash
# Clone (if you have access)
git clone https://github.com/energetekk/30-tage-sprint-mvp.git
cd 30-tage-sprint-mvp

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open http://localhost:3000

---

## 🔐 Environment Variables

Create `.env.local` in project root:
```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Stripe (Coming Soon)
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

**⚠️ NEVER commit `.env.local` to Git!**

---

## 📁 Project Structure
```
30-tage-sprint-mvp/
├── pages/
│   ├── index.js              # Homepage
│   ├── onboarding.js         # Tag 0 Onboarding
│   ├── dashboard.js          # Main Dashboard
│   ├── test-supabase.js      # DB Connection Test
│   └── api/                  # API Routes (TBD)
├── lib/
│   └── supabase.js           # Supabase Client
├── styles/
│   └── globals.css           # Global Styles
├── docs/
│   ├── development/          # Dev Notes & Guides
│   └── screenshots/          # UI Screenshots
└── public/                   # Static Assets
```

---

## 🗄️ Database Setup

### 1. Create Supabase Project

Go to https://supabase.com and create a new project.

### 2. Run Schema

Execute SQL from `docs/development/Schema_Update_Tag0_Onboarding.sql`:
```sql
-- See docs/development/ for complete schema
ALTER TABLE users ADD COLUMN quick_validation JSONB;
ALTER TABLE users ADD COLUMN quick_validation_completed_at TIMESTAMPTZ;
-- ... etc
```

### 3. Configure RLS Policies

Enable Row Level Security and add policies:
```sql
-- Users can read own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update own data  
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

---

## 🧪 Development

### Available Commands
```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Test Pages

- `/` - Homepage
- `/onboarding` - Onboarding Flow
- `/dashboard` - Main Dashboard
- `/test-supabase` - DB Connection Test

---

## 🚢 Deployment

**Planned:** Vercel

**Domain:** mvpbuildr.com

**Steps:** (TBD)

---

## 📚 Documentation

**Public Documentation:** https://github.com/energetekk/30-Tage-Finish-Sprint-Oeffentlicher-Log

For product documentation, features, and screenshots, see the public repo.

This repo contains only source code.

---

## 🐛 Development Notes

See `docs/development/` for:
- Deployment guides
- Schema updates
- Component examples
- Development logs

---

## ✅ Features Implemented

- ✅ Onboarding Flow (7 fields)
- ✅ Dashboard with Sprint Status
- ✅ Countdown Timer
- ✅ Quick-Validation (optional)
- ✅ Supabase Integration
- ✅ RLS Policies

## 🚧 In Development

- ⏳ Auth System (Signup/Login)
- ⏳ Stripe Payment
- ⏳ Admin Panel
- ⏳ Email Automation

---

## 👤 Contact

**Private Repository - Access Restricted**

For questions about public documentation, see the main repo.

---

**Last Updated:** 2026-03-03
