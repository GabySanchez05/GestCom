-- ============================================================
-- TABLE: incidents
-- Módulo 11: Incidencias y Mantenimiento (Ticketera)
-- ============================================================
CREATE TABLE IF NOT EXISTS incidents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  area         TEXT NOT NULL,
  priority     TEXT NOT NULL DEFAULT 'medium'  CHECK (priority  IN ('low', 'medium', 'high', 'urgent')),
  status       TEXT NOT NULL DEFAULT 'reported' CHECK (status   IN ('reported', 'in_progress', 'resolved')),
  evidence_url TEXT,
  admin_notes  TEXT,
  unit_id      UUID REFERENCES units(id)    ON DELETE CASCADE,
  profile_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on status changes
CREATE TRIGGER incidents_set_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read incidents (avoids duplicate reports)
CREATE POLICY "incidents_read_all"    ON incidents FOR SELECT USING (TRUE);
-- Residents can only create tickets under their own profile
CREATE POLICY "incidents_insert_self" ON incidents FOR INSERT WITH CHECK (auth.uid() = profile_id);
-- Admins manage everything; residents can update/cancel only their own
CREATE POLICY "incidents_update"      ON incidents FOR UPDATE USING (
  get_my_role() = 'admin' OR auth.uid() = profile_id
);
CREATE POLICY "incidents_admin_all"   ON incidents FOR ALL USING (get_my_role() = 'admin');
