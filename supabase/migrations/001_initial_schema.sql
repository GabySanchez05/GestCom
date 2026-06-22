-- ============================================================
-- CONDOMINIUM MANAGEMENT APP — Initial Schema
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: units
-- ============================================================
CREATE TABLE units (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_number        TEXT NOT NULL UNIQUE,
  unit_type          TEXT NOT NULL DEFAULT 'apartment' CHECK (unit_type IN ('apartment', 'house', 'local')),
  aliquot_percentage NUMERIC(6, 4) NOT NULL CHECK (aliquot_percentage > 0 AND aliquot_percentage <= 100),
  floor_number       INT,
  status             TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: profiles  (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'resident' CHECK (role IN ('admin', 'resident')),
  unit_id     UUID REFERENCES units(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at on profiles
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABLE: payments
-- ============================================================
CREATE TABLE payments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id          UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  profile_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount           NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency         TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD')),
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  payment_date     DATE NOT NULL,
  reference_number TEXT,
  receipt_url      TEXT,
  period           TEXT NOT NULL,  -- Format: 'YYYY-MM'
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABLE: common_expenses
-- ============================================================
CREATE TABLE common_expenses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  total_amount    NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
  currency        TEXT NOT NULL DEFAULT 'USD',
  category        TEXT NOT NULL DEFAULT 'maintenance' CHECK (category IN ('maintenance', 'utilities', 'security', 'admin', 'other')),
  expense_date    DATE NOT NULL,
  period          TEXT NOT NULL,  -- Format: 'YYYY-MM'
  receipt_url     TEXT,
  is_distributed  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: expense_distributions
-- ============================================================
CREATE TABLE expense_distributions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id         UUID NOT NULL REFERENCES common_expenses(id) ON DELETE CASCADE,
  unit_id            UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  assigned_amount    NUMERIC(12, 2) NOT NULL,
  aliquot_percentage NUMERIC(6, 4) NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (expense_id, unit_id)
);

-- ============================================================
-- TABLE: announcements
-- ============================================================
CREATE TABLE announcements (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  priority     TEXT NOT NULL DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_pinned    BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUNCTION: distribute_expense
-- Distributes a common_expense across all active units
-- ============================================================
CREATE OR REPLACE FUNCTION distribute_expense(p_expense_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_total_amount    NUMERIC(12,2);
  v_aliquot_sum     NUMERIC(6,4);
  v_unit            RECORD;
  v_assigned        NUMERIC(12,2);
BEGIN
  -- Get expense amount
  SELECT total_amount INTO v_total_amount
  FROM common_expenses WHERE id = p_expense_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Expense not found: %', p_expense_id;
  END IF;

  -- Validate aliquots sum to 100
  SELECT SUM(aliquot_percentage) INTO v_aliquot_sum
  FROM units WHERE status = 'active';

  IF ABS(v_aliquot_sum - 100) > 0.01 THEN
    RAISE EXCEPTION 'Active units aliquots must sum to 100%%. Current sum: %', v_aliquot_sum;
  END IF;

  -- Delete previous distributions if any (re-distribute)
  DELETE FROM expense_distributions WHERE expense_id = p_expense_id;

  -- Insert distributions per unit
  FOR v_unit IN
    SELECT id, aliquot_percentage FROM units WHERE status = 'active'
  LOOP
    v_assigned := ROUND(v_total_amount * (v_unit.aliquot_percentage / 100), 2);
    INSERT INTO expense_distributions (expense_id, unit_id, assigned_amount, aliquot_percentage)
    VALUES (p_expense_id, v_unit.id, v_assigned, v_unit.aliquot_percentage);
  END LOOP;

  -- Mark expense as distributed
  UPDATE common_expenses SET is_distributed = TRUE WHERE id = p_expense_id;
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Helper to get current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Helper to get current user's unit_id
CREATE OR REPLACE FUNCTION get_my_unit_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT unit_id FROM profiles WHERE id = auth.uid();
$$;

-- UNITS
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "units_read_all"   ON units FOR SELECT USING (TRUE);
CREATE POLICY "units_admin_write" ON units FOR ALL USING (get_my_role() = 'admin');

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_read_own"   ON profiles FOR SELECT USING (id = auth.uid() OR get_my_role() = 'admin');
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid() OR get_my_role() = 'admin');
CREATE POLICY "profiles_admin_all"  ON profiles FOR ALL USING (get_my_role() = 'admin');

-- PAYMENTS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_admin_all"       ON payments FOR ALL   USING (get_my_role() = 'admin');
CREATE POLICY "payments_resident_own"    ON payments FOR SELECT USING (unit_id = get_my_unit_id());
CREATE POLICY "payments_resident_insert" ON payments FOR INSERT WITH CHECK (unit_id = get_my_unit_id() AND profile_id = auth.uid());

-- COMMON_EXPENSES
ALTER TABLE common_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expenses_read_all"    ON common_expenses FOR SELECT USING (TRUE);
CREATE POLICY "expenses_admin_write" ON common_expenses FOR ALL   USING (get_my_role() = 'admin');

-- EXPENSE_DISTRIBUTIONS
ALTER TABLE expense_distributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "distributions_read_all"    ON expense_distributions FOR SELECT USING (TRUE);
CREATE POLICY "distributions_admin_write" ON expense_distributions FOR ALL   USING (get_my_role() = 'admin');

-- ANNOUNCEMENTS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "announcements_read_all"       ON announcements FOR SELECT USING (expires_at IS NULL OR expires_at > NOW());
CREATE POLICY "announcements_admin_write"    ON announcements FOR ALL   USING (get_my_role() = 'admin');

-- ============================================================
-- SUPABASE STORAGE BUCKET (run via Supabase dashboard or CLI)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);
-- Storage RLS for receipts bucket should restrict upload to authenticated users only.
