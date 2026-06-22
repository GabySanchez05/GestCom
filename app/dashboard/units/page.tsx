import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Building2, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UnitsGrid } from "./UnitsGrid";

export const metadata = {
  title: "Unidades | GestCom",
  description: "Gestión de unidades del condominio",
};

export default async function UnitsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: callerProfile } = await (supabase.from("profiles") as any)
    .select("role").eq("id", user.id).single();
  if (callerProfile?.role !== "admin") redirect("/dashboard");

  const { data: unitsData, error: unitsError } = await (supabase
    .from("units") as any)
    .select("*")
    .order("unit_number", { ascending: true });

  const { data: distributions } = await (supabase
    .from("expense_distributions") as any)
    .select("unit_id, assigned_amount");

  const { data: payments } = await (supabase
    .from("payments") as any)
    .select("unit_id, amount")
    .eq("status", "verified");

  const units = (unitsData || []).map((unit: any) => {
    const totalDebt = (distributions as any[] || [])
      ?.filter((d: any) => d.unit_id === unit.id)
      .reduce((sum: number, d: any) => sum + Number(d.assigned_amount), 0) || 0;

    const totalPaid = (payments as any[] || [])
      ?.filter((p: any) => p.unit_id === unit.id)
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;

    return {
      ...unit,
      current_debt: Math.max(0, totalDebt - totalPaid),
    };
  });

  if (unitsError) {
    console.error("Error fetching units:", unitsError);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Unidades</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona los apartamentos, casas y locales del condominio
            </p>
          </div>
        </div>
        <Button asChild className="shrink-0 h-11 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
          <Link href="/dashboard/units/new">
            <Plus className="h-5 w-5 mr-2" />
            Nueva Unidad
          </Link>
        </Button>
      </div>

      {/* Units Grid with search (Client Component) */}
      <UnitsGrid units={units} />
    </div>
  );
}
