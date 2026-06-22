import { createClient } from "@/lib/supabase/server";
import { SettingsTabs } from "./SettingsTabs";
import { Settings as SettingsIcon } from "lucide-react";

export const metadata = {
  title: "Configuración | GestCom",
  description: "Ajustes de perfil y administración del condominio",
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Fetch User Profile
  const { data: profile } = await (supabase
    .from("profiles") as any)
    .select("role, full_name, unit_id")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  // 2. Fetch all registered units
  let units = [];
  try {
    const { data } = await (supabase
      .from("units") as any)
      .select("id, unit_number, floor_number")
      .order("unit_number", { ascending: true });
    units = data || [];
  } catch (err) {
    console.error("Error loading units in settings:", err);
  }

  // 3. Fetch Condo Settings (Resilient to table absence)
  let condoSettings = null;
  try {
    const { data, error } = await (supabase
      .from("condo_settings") as any)
      .select("*")
      .eq("id", "singleton")
      .single();
    
    if (!error) {
      condoSettings = data;
    }
  } catch (err) {
    console.error("Error loading condo_settings. Did you execute the migration?", err);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <SettingsIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuración del Sistema</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra tus credenciales personales y los parámetros operativos de GestCom
          </p>
        </div>
      </div>

      {/* Main Settings Tabs Component */}
      <SettingsTabs 
        profile={profile} 
        email={user.email} 
        condoSettings={condoSettings} 
        isAdmin={isAdmin} 
        units={units}
      />
    </div>
  );
}
