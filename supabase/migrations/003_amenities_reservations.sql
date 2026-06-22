-- ============================================================
-- TABLE: amenities
-- ============================================================
CREATE TABLE amenities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  capacity     INTEGER NOT NULL CHECK (capacity > 0),
  rules        TEXT,
  image_url    TEXT,
  status       TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'inactive')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial amenities
INSERT INTO amenities (name, description, capacity, rules, status) VALUES
('Piscina de la Residencia', 'Piscina templada con deck de descanso y vestidores.', 25, 'Uso obligatorio de traje de baño. Prohibido vasos de vidrio en el área.', 'available'),
('Quincho / Área de Parrilla', 'Quincho equipado con parrilla, mesada, mesas y sillas para eventos.', 15, 'Limpieza a cargo del arrendatario. Música permitida hasta las 22:00.', 'available'),
('Gimnasio Equipado', 'Gimnasio con cintas, mancuernas, poleas y colchonetas.', 8, 'Uso de calzado deportivo limpio obligatorio. Limpiar máquinas al terminar.', 'available'),
('Salón de Eventos Múltiples', 'Salón cerrado con aire acondicionado, cocina y baños independientes.', 50, 'Requiere depósito de garantía. Música permitida hasta las 02:00.', 'available');

-- ============================================================
-- TABLE: reservations
-- ============================================================
CREATE TABLE reservations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amenity_id       UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  unit_id          UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  profile_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reservation_date DATE NOT NULL,
  start_time       TIME NOT NULL,
  end_time         TIME NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_times CHECK (start_time < end_time)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Policies for amenities
CREATE POLICY "amenities_read_all"    ON amenities FOR SELECT USING (TRUE);
CREATE POLICY "amenities_admin_write" ON amenities FOR ALL   USING (get_my_role() = 'admin');

-- Policies for reservations
CREATE POLICY "reservations_read_all"    ON reservations FOR SELECT USING (TRUE);
CREATE POLICY "reservations_insert_self" ON reservations FOR INSERT WITH CHECK (
  auth.uid() = profile_id
);
CREATE POLICY "reservations_update_self" ON reservations FOR UPDATE USING (
  auth.uid() = profile_id OR get_my_role() = 'admin'
) WITH CHECK (
  auth.uid() = profile_id OR get_my_role() = 'admin'
);
CREATE POLICY "reservations_admin_all"   ON reservations FOR ALL USING (get_my_role() = 'admin');
