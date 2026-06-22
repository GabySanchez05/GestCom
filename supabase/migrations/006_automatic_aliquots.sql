-- 006_automatic_aliquots.sql

-- 1. Modificar la restricción de la tabla units para permitir alícuotas de 0 (para inactivos)
ALTER TABLE units DROP CONSTRAINT IF EXISTS units_aliquot_percentage_check;
ALTER TABLE units ADD CONSTRAINT units_aliquot_percentage_check CHECK (aliquot_percentage >= 0 AND aliquot_percentage <= 100);

-- 2. Función Trigger para actualizar automáticamente los porcentajes visuales en la tabla units
CREATE OR REPLACE FUNCTION trigger_recalculate_aliquots() RETURNS TRIGGER AS $$
DECLARE
  v_total_weight NUMERIC;
BEGIN
  -- Prevenir recursividad infinita
  IF pg_trigger_depth() > 1 THEN
    RETURN NULL;
  END IF;

  -- Calcular el peso total de las unidades activas
  SELECT SUM(
    CASE unit_type
      WHEN 'local' THEN 2.5
      WHEN 'house' THEN 1.5
      WHEN 'apartment' THEN 1.0
      ELSE 1.0
    END
  ) INTO v_total_weight
  FROM units WHERE status = 'active';

  -- Si hay unidades activas, recalcular
  IF v_total_weight IS NOT NULL AND v_total_weight > 0 THEN
    UPDATE units
    SET aliquot_percentage = ROUND((
        CASE unit_type
          WHEN 'local' THEN 2.5
          WHEN 'house' THEN 1.5
          WHEN 'apartment' THEN 1.0
          ELSE 1.0
        END / v_total_weight
      ) * 100, 4)
    WHERE status = 'active';
  END IF;

  -- Las inactivas pasan a 0%
  UPDATE units SET aliquot_percentage = 0 WHERE status = 'inactive';

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger que se ejecuta ante cualquier cambio que afecte el cálculo
DROP TRIGGER IF EXISTS on_unit_change ON units;
CREATE TRIGGER on_unit_change
AFTER INSERT OR UPDATE OF unit_type, status OR DELETE
ON units
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_recalculate_aliquots();

-- 4. Modificar la función distribute_expense para que use el factor de peso real (perfectamente exacto)
-- y además asigne cualquier remanente de centavos a la última unidad para un cuadre perfecto
CREATE OR REPLACE FUNCTION distribute_expense(p_expense_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_total_amount    NUMERIC(12,2);
  v_total_weight    NUMERIC;
  v_unit            RECORD;
  v_assigned        NUMERIC(12,2);
  v_sum_assigned    NUMERIC(12,2) := 0;
  v_last_unit_id    UUID;
BEGIN
  -- Get expense amount
  SELECT total_amount INTO v_total_amount
  FROM common_expenses WHERE id = p_expense_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Expense not found: %', p_expense_id;
  END IF;

  -- Calculate total weight
  SELECT SUM(
    CASE unit_type
      WHEN 'local' THEN 2.5
      WHEN 'house' THEN 1.5
      WHEN 'apartment' THEN 1.0
      ELSE 1.0
    END
  ) INTO v_total_weight
  FROM units WHERE status = 'active';

  IF v_total_weight IS NULL OR v_total_weight = 0 THEN
    RAISE EXCEPTION 'No active units to distribute expense.';
  END IF;

  -- Delete previous distributions if any
  DELETE FROM expense_distributions WHERE expense_id = p_expense_id;

  -- Insert distributions per unit based on weight
  FOR v_unit IN
    SELECT id, 
      CASE unit_type
        WHEN 'local' THEN 2.5
        WHEN 'house' THEN 1.5
        WHEN 'apartment' THEN 1.0
        ELSE 1.0
      END as weight,
      aliquot_percentage
    FROM units WHERE status = 'active'
  LOOP
    v_assigned := ROUND(v_total_amount * (v_unit.weight / v_total_weight), 2);
    INSERT INTO expense_distributions (expense_id, unit_id, assigned_amount, aliquot_percentage)
    VALUES (p_expense_id, v_unit.id, v_assigned, v_unit.aliquot_percentage);
    
    v_sum_assigned := v_sum_assigned + v_assigned;
    v_last_unit_id := v_unit.id;
  END LOOP;

  -- Fix rounding error on the last unit (e.g. 0.01 cents difference)
  IF v_sum_assigned != v_total_amount AND v_last_unit_id IS NOT NULL THEN
    UPDATE expense_distributions
    SET assigned_amount = assigned_amount + (v_total_amount - v_sum_assigned)
    WHERE expense_id = p_expense_id AND unit_id = v_last_unit_id;
  END IF;

  -- Mark expense as distributed
  UPDATE common_expenses SET is_distributed = TRUE WHERE id = p_expense_id;
END;
$$;

-- 5. Inicializar/recalcular todo al correr la migración
DO $$
BEGIN
  -- Forzamos la actualización de la tabla para disparar el cálculo
  UPDATE units SET updated_at = NOW();
EXCEPTION WHEN OTHERS THEN
  -- Si no existe updated_at (por schema anterior), hacemos una actualizacion nula
  UPDATE units SET status = status;
END;
$$;
