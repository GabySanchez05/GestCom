

CREATE TABLE IF NOT EXISTS condo_settings (
  id                  TEXT PRIMARY KEY DEFAULT 'singleton',
  name                TEXT NOT NULL DEFAULT 'Condominio GestCom',
  tax_id              TEXT DEFAULT 'J-12345678-9', -- tax identifier
  bank_name           TEXT DEFAULT 'Banco Universal',
  bank_account_number TEXT DEFAULT '0102-0102-33-0123456789',
  bank_account_holder TEXT DEFAULT 'Administración GestCom S.A.',
  bank_account_email  TEXT DEFAULT 'pagos@gestcom.com',
  phone               TEXT DEFAULT '+58 (212) 555-1234',
  address             TEXT DEFAULT 'Av. Principal del Condominio, Torre GestCom',
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert the default singleton row if not exists
INSERT INTO condo_settings (id) 
VALUES ('singleton') 
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE condo_settings ENABLE ROW LEVEL SECURITY;

-- Allow reading to all authenticated users
CREATE POLICY "condo_settings_read_all" 
ON condo_settings FOR SELECT 
USING (true);

-- Allow admins to update settings
CREATE POLICY "condo_settings_admin_all" 
ON condo_settings FOR ALL 
USING (get_my_role() = 'admin');
