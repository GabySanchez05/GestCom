-- 007_reservations_updated_at.sql

-- Add updated_at column to reservations
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Create trigger to auto-update updated_at on status changes
DROP TRIGGER IF EXISTS reservations_set_updated_at ON reservations;
CREATE TRIGGER reservations_set_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Update all existing reservations so their updated_at is at least their created_at
UPDATE reservations SET updated_at = created_at WHERE updated_at = NOW();
