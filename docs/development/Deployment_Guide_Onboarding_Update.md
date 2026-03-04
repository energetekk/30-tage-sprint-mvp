# DEPLOYMENT GUIDE UPDATE - TAG 0 ONBOARDING

**Änderung:** Onboarding via Dashboard (nicht Tally)  
**Datum:** 2026-03-02

---

## ✅ WAS ÄNDERT SICH?

### VORHER (in Deployment_Guide_PRD_v3.0.md):
```
UNKLAR - Nicht spezifiziert ob Tally oder Dashboard
```

### NACHHER (korrekt):
```
Tag 0 Onboarding via Dashboard (/onboarding Page)
```

---

## 🔧 UPDATES FÜR DEPLOYMENT GUIDE:

### TAG 1: SUPABASE SETUP

**Nach "Schema v3 deployen" hinzufügen:**

```sql
-- Schema Update: Tag 0 Onboarding Felder
-- (siehe Schema_Update_Tag0_Onboarding.sql)

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS email TEXT UNIQUE NOT NULL;

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS existing_progress TEXT;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

---

### TAG 4-5: DASHBOARD + ONBOARDING

**Neu hinzufügen (zwischen Stripe und Daily Prompts):**

#### **TAG 4: ONBOARDING PAGE**

**Was wird gebaut:**
```
✅ /onboarding Page
✅ 7 Felder (wie Tally):
   1. Vorname
   2. Email
   3. Projektidee
   4. Was existiert bereits?
   5. Woran ist Projekt fertig?
   6. Warum wichtig?
   7. Skill-Level
✅ Submit → Speichert in users table
✅ Setzt tag0_completed_at
✅ Redirect zu /dashboard
```

**User Flow:**
```
1. User zahlt (Stripe) ✅
2. Success Page → Redirect to /onboarding
3. User füllt 7 Felder aus
4. Submit → Supabase users table
5. Redirect to /dashboard
6. Dashboard zeigt: "Sprint startet in 3 Tagen"
```

**Component:** (siehe Onboarding_Page_Component.jsx)

---

### TAG 6-7: DASHBOARD (WAITING STATE)

**Dashboard muss zeigen:**

```jsx
// Wenn status === 'waiting':
const daysSinceTag0 = calculateDays(user.tag0_completed_at)

if (daysSinceTag0 < 3) {
  return (
    <WaitingState 
      daysRemaining={3 - daysSinceTag0}
      quickValidationAvailable={true}
    />
  )
}

// Wenn daysSinceTag0 >= 3:
// Sprint startet! Zeige Tag 1 Content
```

---

## 📊 UPDATED TIMELINE:

```
TAG 1:   Supabase Setup + Schema ✅
TAG 2-3: Auth (Login/Signup) ✅
TAG 4:   Onboarding Page (NEU!)
TAG 5:   Stripe Checkout
TAG 6-7: Dashboard (Waiting + Active States)
TAG 8:   Proof Upload
TAG 9:   Quick Validation
TAG 10:  Profile Settings
TAG 11-12: Admin Panel
TAG 13:  Testing
```

**Gesamtzeit:** Unverändert 13 Tage (Tag 4 ersetzt "Landing Page Details")

---

## ✅ KONSISTENZ CHECK:

| Aspekt | Deployment Guide | Schema | Component |
|--------|------------------|--------|-----------|
| **Email Feld** | ⚠️ Fehlt | ⚠️ Fehlt | ✅ Vorhanden |
| **existing_progress** | ⚠️ Fehlt | ⚠️ Fehlt | ✅ Vorhanden |
| **consequence** | Nicht verwendet | Optional (OK) | Nicht verwendet |
| **Onboarding Flow** | ⚠️ Unklar | - | ✅ Dashboard |

**NACH UPDATE:**
- ✅ Alle konsistent!
- ✅ Schema hat email + existing_progress
- ✅ Component nutzt alle 7 Felder
- ✅ Deployment Guide dokumentiert Onboarding

---

## 🎯 NEXT STEPS (FÜR DICH):

**HEUTE (Tag weiter mit Supabase Client Setup):**

1. ✅ Schema Update laufen lassen (SQL oben)
2. ✅ Supabase Client Setup (wie geplant)
3. ✅ Test: User anlegen mit neuen Feldern

**MORGEN (Tag 4 in deinem Plan):**

4. Onboarding Page bauen (Component kopieren)
5. Routing: /onboarding Page
6. Test: Formular ausfüllen → Daten in DB

---

**Alle Dateien ready!** ✅
