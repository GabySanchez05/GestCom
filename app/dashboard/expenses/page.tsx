import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FileText, Plus, Calculator, AlertTriangle, CheckCircle2, Receipt } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { distributeExpense } from "@/app/actions/expenses";

export const metadata = {
  title: "Expensas Comunes | GestCom",
  description: "Gestión de gastos comunes y distribución de alícuotas",
};

export default async function ExpensesPage() {
  const supabase = await createClient();

  // ── Admin guard ───────────────────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: callerProfile } = await (supabase.from("profiles") as any)
    .select("role").eq("id", user.id).single();
  if (callerProfile?.role !== "admin") redirect("/dashboard");

  const { data, error } = await supabase
    .from("common_expenses")
    .select("*")
    .order("expense_date", { ascending: false });

  const expenses = data as any[];

  if (error) {
    console.error("Error fetching expenses:", error);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <FileText className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Expensas Comunes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Registra los gastos del condominio y distribúyelos según las alícuotas
            </p>
          </div>
        </div>
        <Button asChild className="shrink-0 h-11 px-6 rounded-xl shadow-md hover:shadow-lg transition-all">
          <Link href="/dashboard/expenses/new">
            <Plus className="h-5 w-5 mr-2" />
            Registrar Gasto
          </Link>
        </Button>
      </div>

      {/* Warning/Info Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 items-start">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-700 dark:text-amber-500">
          <p className="font-semibold mb-1">Distribución de Gastos</p>
          <p>
            Al hacer clic en "Distribuir", el monto total del gasto se dividirá automáticamente entre todas las unidades activas según su porcentaje de alícuota registrado. Asegúrate de que los porcentajes sumen el 100%.
          </p>
        </div>
      </div>

      {/* Expenses Grid */}
      {expenses && expenses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {expenses.map((expense: any) => (
            <div 
              key={expense.id} 
              className={`group bg-card rounded-2xl border ${expense.is_distributed ? 'border-border' : 'border-blue-500/30 shadow-blue-500/5'} shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col`}
            >
              {/* Card Header */}
              <div className="p-6 border-b border-border bg-gradient-to-br from-card to-accent/20">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-background border shadow-sm flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-foreground/80" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">
                        {getCategoryLabel(expense.category)}
                      </span>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        Período: <span className="font-medium text-foreground">{expense.period}</span>
                      </p>
                    </div>
                  </div>
                  {expense.is_distributed ? (
                    <span className="flex items-center gap-1 text-xs font-medium bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Distribuido
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium bg-blue-500/10 text-blue-600 px-2.5 py-1 rounded-full">
                      <Calculator className="h-3.5 w-3.5" />
                      Pendiente
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg leading-tight mb-1">{expense.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                  {expense.description || 'Sin descripción adicional.'}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Monto Total</p>
                    <p className="font-bold text-2xl">{formatCurrency(expense.total_amount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Fecha</p>
                    <p className="text-sm font-medium">{formatDate(expense.expense_date)}</p>
                  </div>
                </div>
                
                <div className="mt-auto">
                  {!expense.is_distributed ? (
                    <form action={async () => {
                      "use server"
                      await distributeExpense(expense.id)
                    }}>
                      <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                        <Calculator className="h-4 w-4 mr-2" />
                        Distribuir a Unidades
                      </Button>
                    </form>
                  ) : (
                    <Button variant="outline" className="w-full h-11 border-border" asChild>
                      <Link href={`/dashboard/expenses/${expense.id}`}>
                        Ver Detalles de Distribución
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-card rounded-2xl border border-dashed border-border">
          <div className="h-20 w-20 rounded-full bg-accent flex items-center justify-center mb-6">
            <FileText className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No hay gastos registrados</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Registra los gastos de mantenimiento, servicios y administración para poder distribuirlos a los residentes.
          </p>
          <Button asChild size="lg" className="rounded-xl shadow-lg hover:shadow-primary/25 transition-all">
            <Link href="/dashboard/expenses/new">
              <Plus className="h-5 w-5 mr-2" />
              Registrar Primer Gasto
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
