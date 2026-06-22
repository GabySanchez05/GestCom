import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Wrench } from "lucide-react";
import { IncidentsClient } from "./IncidentsClient";

export const metadata = {
  title: "Incidencias y Mantenimiento | GestCom",
  description: "Reporta desperfectos y gestiona el mantenimiento de áreas comunes",
};

export default async function IncidentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await (supabase.from("profiles") as any)
    .select("id, role, full_name, unit_id")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  const { data: incidents, error } = await (supabase.from("incidents") as any)
    .select(
      `
        id, title, description, area, priority, status,
        evidence_url, admin_notes, profile_id, created_at,
        profiles ( full_name ),
        units    ( unit_number )
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching incidents:", error);
  }

  const currentUser = {
    id: user.id,
    full_name: profile?.full_name ?? "Usuario",
    role: profile?.role ?? "resident",
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <Wrench className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Incidencias y Mantenimiento
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Reporta desperfectos en áreas comunes y haz seguimiento de las
              reparaciones
            </p>
          </div>
        </div>
      </div>

      <IncidentsClient
        initialIncidents={incidents ?? []}
        currentUser={currentUser}
        isAdmin={isAdmin}
      />
    </div>
  );
}
