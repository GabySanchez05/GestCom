import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UnitDetailsTabs } from "./UnitDetailsTabs";

export const metadata = {
  title: "Detalle de Unidad | GestCom",
  description: "Detalle, historial y administración de la unidad",
};

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UnitDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch current user profile to verify roles and associations
  const { data: currentUserProfile } = await (supabase
    .from("profiles") as any)
    .select("role, unit_id")
    .eq("id", user.id)
    .single();

  const isAdmin = currentUserProfile?.role === "admin";
  const isResidentOfThisUnit = currentUserProfile?.unit_id === id;

  // Authorization Check
  if (!isAdmin && !isResidentOfThisUnit) {
    redirect("/dashboard");
  }

  // 1. Fetch Unit Details
  const { data: unit, error: unitError } = await (supabase
    .from("units") as any)
    .select("*")
    .eq("id", id)
    .single();

  if (unitError || !unit) {
    redirect("/dashboard/units");
  }

  // 2. Fetch Residents
  const { data: residents } = await (supabase
    .from("profiles") as any)
    .select("id, full_name, email, role")
    .eq("unit_id", id) || [];

  // 3. Fetch Expense Distributions
  const { data: distributions } = await (supabase
    .from("expense_distributions") as any)
    .select(`
      id,
      assigned_amount,
      aliquot_percentage,
      common_expenses (
        title,
        description,
        period,
        expense_date
      )
    `)
    .eq("unit_id", id) || [];

  // 4. Fetch Payments
  const { data: payments } = await (supabase
    .from("payments") as any)
    .select("*")
    .eq("unit_id", id)
    .order("payment_date", { ascending: false }) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <Button variant="ghost" size="icon" asChild className="rounded-full shrink-0">
          <Link href="/dashboard/units">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Unidad {unit.unit_number}</h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">
            Administración de alícuotas, residentes e historial de la propiedad
          </p>
        </div>
      </div>

      {/* Interactive Tabs */}
      <UnitDetailsTabs
        unit={unit}
        residents={residents || []}
        distributions={distributions || []}
        payments={payments || []}
        isAdmin={isAdmin}
      />
    </div>
  );
}
