import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, FileText, Landmark, Calendar, DollarSign, Calculator, Percent, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Detalles de Distribución | GestCom",
  description: "Detalles y auditoría de alícuotas y gastos comunes",
};

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ExpenseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. Fetch common expense details
  const { data: expense, error: expenseError } = await (supabase
    .from("common_expenses") as any)
    .select("*")
    .eq("id", id)
    .single();

  if (expenseError || !expense) {
    redirect("/dashboard/expenses");
  }

  // 2. Fetch distributions
  const { data: distributions } = await (supabase
    .from("expense_distributions") as any)
    .select(`
      id,
      assigned_amount,
      aliquot_percentage,
      units (
        unit_number,
        unit_type,
        floor_number
      )
    `)
    .eq("expense_id", id) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      maintenance: "Mantenimiento",
      utilities: "Servicios Básicos",
      security: "Seguridad",
      admin: "Administración",
      other: "Otros"
    };
    return categories[category] || category;
  };

  const getUnitTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      apartment: "Apartamento",
      house: "Casa",
      local: "Local Comercial",
    };
    return types[type] || type;
  };

  const getUnitWeightLabel = (type: string) => {
    const weights: Record<string, { label: string; color: string }> = {
      apartment: { label: "Base (×1.0)", color: "text-muted-foreground bg-muted/50 border-border" },
      house:     { label: "+50% (×1.5)", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
      local:     { label: "+150% (×2.5)", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    };
    return weights[type] ?? { label: "Base", color: "text-muted-foreground" };
  };

  const totalAlícuotaSum = (distributions || []).reduce((sum: number, d: any) => sum + Number(d.aliquot_percentage), 0);
  const totalDistributedSum = (distributions || []).reduce((sum: number, d: any) => sum + Number(d.assigned_amount), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <Button variant="ghost" size="icon" asChild className="rounded-full shrink-0">
          <Link href="/dashboard/expenses">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
          <FileText className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detalles de Distribución</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Auditoría transparente de cuotas de expensas asignadas por alícuotas
          </p>
        </div>
      </div>

      {/* Main Stats Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Card: Expense Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 relative overflow-hidden space-y-5">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            
            <div className="flex items-center gap-2 text-blue-500">
              <Landmark className="h-5 w-5" />
              <h2 className="font-bold text-xs uppercase tracking-wider">Resumen del Gasto</h2>
            </div>

            <div className="space-y-4 text-sm leading-relaxed">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Gasto</span>
                <span className="font-semibold text-foreground">{expense.title}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Descripción</span>
                <span className="text-muted-foreground leading-relaxed text-xs block">{expense.description || "Sin descripción."}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Categoría</span>
                <span className="font-semibold text-foreground">{getCategoryLabel(expense.category)}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Período</span>
                <span className="font-mono font-semibold text-foreground">{expense.period}</span>
              </div>

              <div className="space-y-1 border-t border-border pt-4">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Monto Original</span>
                <span className="font-mono text-xl font-bold text-foreground">
                  {formatCurrency(expense.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Audit Metrics */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Calculator className="h-5 w-5" />
              <h3 className="font-bold text-xs uppercase tracking-wider">Métricas de Distribución</h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground text-xs">Total Distribuido</span>
                <span className="font-mono font-bold text-foreground">{formatCurrency(totalDistributedSum)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground text-xs">Suma de Alícuotas</span>
                <span className="font-mono font-bold text-primary flex items-center gap-1">
                  <Percent className="h-3.5 w-3.5" />
                  {totalAlícuotaSum.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Table: Distributions details */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Calculator className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Reparto por Unidad</h2>
            </div>

            {distributions && distributions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                      <th className="pb-3 pl-1 font-semibold">Unidad</th>
                      <th className="pb-3 font-semibold">Tipo</th>
                      <th className="pb-3 font-semibold text-center">Piso</th>
                      <th className="pb-3 font-semibold text-right">Alícuota (%)</th>
                      <th className="pb-3 pr-1 font-semibold text-right">Cuota Asignada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium">
                    {distributions.map((d: any) => (
                      <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 pl-1 font-semibold text-foreground">
                          Unidad {d.units?.unit_number}
                        </td>
                        <td className="py-4 text-xs text-muted-foreground">
                          {getUnitTypeLabel(d.units?.unit_type)}
                        </td>
                        <td className="py-4 text-center text-xs">
                          {d.units?.floor_number !== null ? `Piso ${d.units?.floor_number}` : "PB"}
                        </td>
                        <td className="py-4 text-right font-mono text-xs">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-primary font-semibold">{d.aliquot_percentage}%</span>
                            {(() => {
                              const w = getUnitWeightLabel(d.units?.unit_type);
                              return (
                                <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded border ${w.color}`}>
                                  {w.label}
                                </span>
                              );
                            })()}
                          </div>
                        </td>
                        <td className="py-4 pr-1 text-right font-mono font-bold text-foreground">
                          {formatCurrency(d.assigned_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-border rounded-xl">
                <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Este gasto no ha sido distribuido a ninguna unidad todavía.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
