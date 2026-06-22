import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, UserCheck, UserX } from "lucide-react";
import { ResidentsTable } from "./ResidentsTable";

export const metadata = {
  title: "Residentes | GestCom",
  description: "Gestión de residentes del condominio",
};

export default async function ResidentsPage() {
  const supabase = await createClient();

  // ── Auth + Role guard ─────────────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: callerProfile } = await (supabase.from("profiles") as any)
    .select("role")
    .eq("id", user.id)
    .single();

  if (callerProfile?.role !== "admin") redirect("/dashboard");

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: residents } = await (supabase.from("profiles") as any)
    .select("id, full_name, role, unit_id, created_at, units(unit_number, floor_number)")
    .order("created_at", { ascending: false });

  const { data: units } = await (supabase.from("units") as any)
    .select("id, unit_number, floor_number")
    .order("unit_number", { ascending: true });

  const allResidents = (residents as any[]) ?? [];
  const allUnits     = (units     as any[]) ?? [];

  const totalResidents  = allResidents.filter((r: any) => r.role !== "admin").length;
  const assignedUnits   = allResidents.filter((r: any) => r.unit_id && r.role !== "admin").length;
  const unassigned      = totalResidents - assignedUnits;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestión de Residentes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Administra los perfiles y asignaciones de unidades
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Residentes", value: totalResidents, icon: Users,     color: "blue"   },
          { label: "Con Unidad",        value: assignedUnits, icon: UserCheck,  color: "emerald"},
          { label: "Sin Unidad",        value: unassigned,    icon: UserX,      color: "amber"  },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-4">
            <div className={`h-11 w-11 rounded-xl bg-${s.color}-500/10 flex items-center justify-center shrink-0`}>
              <s.icon className={`h-5 w-5 text-${s.color}-500`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Residents Table (Client Component with search) ───────────────────── */}
      <ResidentsTable residents={allResidents} units={allUnits} />
    </div>
  );
}
