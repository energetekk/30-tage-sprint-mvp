-- ============================================
-- SCHEMA UPDATE: TAG 0 ONBOARDING
-- Version: 3.1
-- Reason: Anpassung an Tally Formular Felder
-- ============================================

-- 1. Email Feld hinzufügen (Duplikat von auth.users.email)
-- ============================================
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS email TEXT UNIQUE NOT NULL;

-- Index für schnelle Email-Suche
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Existing Progress hinzufügen (NEU aus Tally)
-- ============================================
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS existing_progress TEXT;

-- Comment
COMMENT ON COLUMN users.existing_progress IS 'Was der User bereits hat (vor Sprint-Start)';

-- 3. Consequence bleibt, wird aber optional/nicht mehr verwendet
-- ============================================
-- Keine Änderung nötig - ist bereits TEXT (nullable)

-- 4. Update: full_name umbenennen für Konsistenz
-- ============================================
-- Ist bereits "full_name" - aber wir speichern nur Vorname
-- Optional: Umbenennen zu "vorname" für Klarheit
-- ALTER TABLE users RENAME COLUMN full_name TO vorname;
-- → NICHT nötig, "full_name" ist OK (auch wenn nur Vorname)

-- 5. VERIFICATION
-- ============================================
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN (
    'email', 
    'full_name', 
    'project_idea', 
    'existing_progress', 
    'goal_definition', 
    'why_important', 
    'skill_level',
    'consequence'
  )
ORDER BY ordinal_position;

-- Expected output:
-- email               | text    | NO  | NULL
-- full_name           | text    | NO  | NULL
-- project_idea        | text    | NO  | NULL
-- existing_progress   | text    | YES | NULL
-- goal_definition     | text    | NO  | NULL
-- why_important       | text    | YES | NULL
-- skill_level         | text    | YES | NULL
-- consequence         | text    | YES | NULL

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
