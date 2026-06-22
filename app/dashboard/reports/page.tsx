import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FileBarChart } from "lucide-react";
import { ReportsClient } from "./ReportsClient";

export const metadata = {
  title: "Informes | GestCom",
  description: "Generación de reportes y estadísticas en PDF",
};

export default async function ReportsPage() {
  const supabase = await createClient();

  // ── Auth + Role guard ─────────────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: callerProfile } = await (supabase.from("profiles") as any)
    .select("role")
    .eq("id", user.id)
    .single();

  // Only admins can access reports
  if (callerProfile?.role !== "admin") redirect("/dashboard");

  // ── Fetch all data needed for reports ──────────────────────────────────────
  // We fetch everything concurrently to pass to the client component.
  
  const [
    { data: profiles },
    { data: units },
    { data: payments },
    { data: expenses },
    { data: amenities },
    { data: reservations },
    { data: incidents },
    { data: announcements }
  ] = await Promise.all([
    (supabase.from("profiles") as any).select("id, full_name, role, unit_id, created_at, units(unit_number)"),
    (supabase.from("units") as any).select("*"),
    (supabase.from("payments") as any).select("id, amount, status, date, type, profiles(full_name), units(unit_number)"),
    (supabase.from("expenses") as any).select("*"),
    (supabase.from("amenities") as any).select("*"),
    (supabase.from("reservations") as any).select("id, date, status, amenities(name), profiles(full_name)"),
    (supabase.from("incidents") as any).select("id, title, status, priority, created_at, profiles(full_name), units(unit_number)"),
    (supabase.from("announcements") as any).select("id, title, content, created_at")
  ]);

  const reportData = {
    profiles: profiles || [],
    units: units || [],
    payments: payments || [],
    expenses: expenses || [],
    amenities: amenities || [],
    reservations: reservations || [],
    incidents: incidents || [],
    announcements: announcements || [],
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileBarChart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Centro de Informes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Genera y descarga reportes estadísticos en formato PDF
            </p>
          </div>
        </div>
      </div>

      <ReportsClient data={reportData} />
    </div>
  );
}
