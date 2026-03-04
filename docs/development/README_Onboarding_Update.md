# TAG 0 ONBOARDING - DASHBOARD IMPLEMENTATION

**Version:** 1.0  
**Datum:** 2026-03-02  
**Zweck:** Onboarding via Dashboard (nicht Tally)

---

## 📦 WAS IST ENTHALTEN:

1. **Schema_Update_Tag0_Onboarding.sql**
   - Fügt `email` Feld hinzu
   - Fügt `existing_progress` Feld hinzu
   - Macht `consequence` optional (nicht mehr verwendet)

2. **Onboarding_Page_Component.jsx**
   - Komplette /onboarding Page
   - 7 Felder (wie Tally)
   - Submit → Supabase
   - Redirect zu Dashboard

3. **Deployment_Guide_Onboarding_Update.md**
   - Updates für Deployment Guide
   - Timeline Anpassung
   - Konsistenz-Check

---

## 🚀 QUICK START:

### STEP 1: Schema Update

```sql
-- In Supabase SQL Editor:
-- Copy-paste Schema_Update_Tag0_Onboarding.sql
-- Run
```

### STEP 2: Component kopieren

```bash
# In deinem Next.js Projekt:
cp Onboarding_Page_Component.jsx pages/onboarding.jsx
```

### STEP 3: Testen

```
http://localhost:3000/onboarding
```

---

## 📋 FELDER MAPPING:

| Tally Feld | DB Column | Type | Required |
|------------|-----------|------|----------|
| Vorname | `full_name` | TEXT | ✅ |
| Email | `email` | TEXT | ✅ |
| Projektidee | `project_idea` | TEXT | ✅ |
| Was existiert? | `existing_progress` | TEXT | ✅ |
| Woran fertig? | `goal_definition` | TEXT | ✅ |
| Warum wichtig? | `why_important` | TEXT | ✅ |
| Skill-Level | `skill_level` | TEXT | ✅ |

**Nicht mehr verwendet:**
- `consequence` (minimale Version) - bleibt im Schema aber optional

---

## 🎯 USER FLOW:

```
1. Landing Page
   [Sign Up Button]

2. /signup
   - Email + Password
   - Modul wählen
   [Weiter zu Zahlung]

3. Stripe Checkout
   - Zahlt CHF 25/49/75
   [Nach Erfolg → /onboarding]

4. /onboarding ⭐ NEU!
   - 7 Felder ausfüllen
   [Sprint starten]

5. /dashboard
   - "Sprint startet in 3 Tagen..."
   - Quick-Validation (optional)
```

---

## ⚠️ WICHTIG:

**Tally bleibt live** (zum Submissions sammeln), aber:
- Wird NICHT für Production verwendet
- Dashboard Onboarding ist der echte Flow
- Tally = nur zum Testen/Feedback sammeln während Entwicklung

---

## ✅ KONSISTENZ:

Nach diesem Update sind konsistent:
- Schema (email + existing_progress)
- Dashboard Component (7 Felder)
- Deployment Guide (dokumentiert)
- User Flow (klar definiert)

---

**Ready to implement!** 🚀
