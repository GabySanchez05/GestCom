-- ============================================================
-- MIGRATION: Role Protection
-- Evita que usuarios sin rol administrador puedan cambiar su propio rol o el de otros a 'admin'
-- ============================================================

CREATE OR REPLACE FUNCTION protect_profile_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Si el rol está cambiando
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Solo permitir el cambio si el usuario que ejecuta la acción es un admin
    IF (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' THEN
      RETURN NEW;
    ELSE
      -- De lo contrario, forzar a mantener el rol anterior
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Crear el disparador en la tabla profiles
DROP TRIGGER IF EXISTS on_profile_role_update ON public.profiles;
CREATE TRIGGER on_profile_role_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION protect_profile_role();
