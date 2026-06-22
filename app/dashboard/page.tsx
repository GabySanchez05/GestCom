import { createClient } from "@/lib/supabase/server";
import { Wallet, Users, FileWarning, TrendingUp, AlertCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Landmark } from "lucide-react";
import { RevenueChart } from "./RevenueChart";

// Map unit_type values to Spanish labels
const UNIT_TYPE_LABELS: Record<string, string> = {
  apartment: "Apartamento",
  house: "Casa",
  local: "Local Comercial",
};

// Weight info per unit type
const UNIT_WEIGHTS: Record<string, { weight: string; badge: string; badgeColor: string; explanation: string }> = {
  apartment: {
    weight: "×1.0",
    badge: "Base (×1.0)",
    badgeColor: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    explanation: "El Apartamento es el tipo base del sistema. Contribuye el porcentaje más bajo entre todos los tipos de unidades.",
  },
  house: {
    weight: "×1.5",
    badge: "+50% (×1.5)",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    explanation: "La Casa paga un 50% más que un Apartamento equivalente, reflejando su mayor superficie y uso de zonas comunes.",
  },
  local: {
    weight: "×2.5",
    badge: "+150% (×2.5)",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    explanation: "El Local Comercial paga el máximo porque genera mayor tráfico, desgaste y uso de infraestructura común que los residentes.",
  },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const currentMonth = new Date().toISOString().slice(0, 7);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await (supabase
    .from("profiles") as any)
    .select("role, unit_id")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  if (isAdmin) {
    // 1. Unidades activas
    const { count: activeUnitsCount } = await supabase
      .from("units")
      .select("*", { count: 'exact', head: true })
      .eq("status", "active");

    // 2. Recaudación del mes (pagos verificados)
    const { data: verifiedPayments } = await supabase
      .from("payments")
      .select("amount")
      .eq("status", "verified")
      .eq("period", currentMonth);

    const totalCollected = verifiedPayments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;

    // 3. Gastos pendientes de distribución
    const { data: pendingExpenses } = await supabase
      .from("common_expenses")
      .select("total_amount")
      .eq("is_distributed", false);

    const totalPendingExpenses = pendingExpenses?.reduce((sum: number, e: any) => sum + Number(e.total_amount), 0) || 0;

    // 4. Unidades en Mora (deuda > 0)
    const { data: allUnits } = await (supabase
      .from("units") as any)
      .select("id");

    const { data: allDistributions } = await (supabase
      .from("expense_distributions") as any)
      .select("unit_id, assigned_amount");

    const { data: allPayments } = await (supabase
      .from("payments") as any)
      .select("unit_id, amount")
      .eq("status", "verified");

    const delinquentUnitsCount = (allUnits || []).filter((unit: any) => {
      const totalDebt = (allDistributions as any[] || [])
        .filter((d: any) => d.unit_id === unit.id)
        .reduce((sum: number, d: any) => sum + Number(d.assigned_amount), 0) || 0;

      const totalPaid = (allPayments as any[] || [])
        .filter((p: any) => p.unit_id === unit.id)
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;

      return (totalDebt - totalPaid) > 0.01;
    }).length;

    const stats = [
      {
        title: "Recaudación del Mes",
        value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalCollected),
        change: "Datos en tiempo real",
        icon: Wallet,
      },
      {
        title: "Gastos por Distribuir",
        value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalPendingExpenses),
        change: "Pendiente de acción",
        icon: TrendingUp,
      },
      {
        title: "Unidades Activas",
        value: activeUnitsCount || 0,
        change: "Total registradas",
        icon: Users,
      },
      {
        title: "Unidades en Mora",
        value: delinquentUnitsCount,
        change: delinquentUnitsCount > 0 ? "Requieren atención" : "Al día",
        icon: FileWarning,
      },
    ];

    // 5. Historial de recaudación (Últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    const minPeriod = sixMonthsAgo.toISOString().slice(0, 7);

    const { data: historicalPayments } = await supabase
      .from("payments")
      .select("amount, period")
      .eq("status", "verified")
      .gte("period", minPeriod)
      .order("period", { ascending: true });

    // Agrupar por mes para el gráfico
    const monthlyData: Record<string, number> = {};
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    
    // Inicializar los últimos 6 meses en 0
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.toISOString().slice(0, 7); // YYYY-MM
      const label = `${months[d.getMonth()]} ${d.getFullYear()}`;
      monthlyData[m] = 0;
    }

    historicalPayments?.forEach((p: any) => {
      if (monthlyData[p.period] !== undefined) {
        monthlyData[p.period] += Number(p.amount);
      }
    });

    const chartData = Object.entries(monthlyData).map(([period, amount]) => {
      const [year, month] = period.split("-");
      return {
        month: `${months[parseInt(month) - 1]} ${year}`,
        amount
      };
    });

    // 6. Últimos movimientos (5 más recientes)
    const { data: recentPayments } = await supabase
      .from("payments")
      .select(`
        id, 
        amount, 
        status, 
        created_at,
        units(unit_number)
      `)
      .order("created_at", { ascending: false })
      .limit(5);

    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resumen Ejecutivo</h1>
          <p className="text-muted-foreground mt-1">
            Estado financiero y operativo del condominio en tiempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col space-y-2 hover:shadow-md transition-all hover:border-primary/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </span>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold">{stat.value}</span>
                <span className="text-xs font-medium text-muted-foreground mt-1">
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart Panel */}
          <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-6 flex flex-col shadow-sm">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recaudación Histórica (Últimos 6 meses)
            </h3>
            <div className="flex-1 min-h-[300px]">
              <RevenueChart data={chartData} />
            </div>
          </div>
          
          {/* Recent Movements Panel */}
          <div className="rounded-2xl bg-card border border-border p-6 flex flex-col shadow-sm h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Últimos movimientos
              </h3>
              <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
                <Link href="/dashboard/payments">Ver todos</Link>
              </Button>
            </div>
            
            <div className="space-y-4 flex-1">
              {!recentPayments || recentPayments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <Wallet className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">No hay movimientos recientes</p>
                </div>
              ) : (
                recentPayments.map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-semibold text-sm">
                        Unidad {(payment.units as any)?.unit_number || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        {new Date(payment.created_at).toLocaleDateString()}
                        <span>•</span>
                        <span className={
                          payment.status === 'verified' ? "text-emerald-500 font-medium" : 
                          payment.status === 'rejected' ? "text-red-500 font-medium" : 
                          "text-amber-500 font-medium"
                        }>
                          {payment.status === 'verified' ? 'Verificado' : 
                           payment.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                        </span>
                      </p>
                    </div>
                    <p className="font-bold font-mono">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payment.amount)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RESIDENT DASHBOARD
  let currentDebt = 0;
  let unitInfo = null;
  let distributions: any[] = [];

  if (profile?.unit_id) {
    const { data: unitData } = await supabase
      .from("units")
      .select("unit_type, aliquot_percentage")
      .eq("id", profile.unit_id)
      .single();
    
    unitInfo = unitData;
    let distributionsData: any[] = [];
    const { data } = await supabase
      .from("expense_distributions")
      .select(`
        id,
        assigned_amount,
        aliquot_percentage,
        common_expenses (
          title,
          period
        )
      `)
      .eq("unit_id", profile.unit_id)
      .order("created_at", { ascending: false });
    
    if (data) distributionsData = data;
    
    // Simplification for MVP: We assume all distributions are debt until marked paid.
    // In a real app we'd join with payments to see what's paid.
    currentDebt = distributionsData.reduce((sum: number, d: any) => sum + Number(d.assigned_amount), 0);
    distributions = distributionsData;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Estado de Cuenta</h1>
        <p className="text-muted-foreground mt-1">
          Revisa tus deudas y reporta tus pagos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-8 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-center text-center justify-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
          <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-lg font-medium text-muted-foreground">Deuda Total Pendiente</h2>
          <span className="text-5xl font-bold tracking-tight text-foreground">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(currentDebt)}
          </span>
          {currentDebt > 0 ? (
            <p className="text-sm text-red-500 font-medium">Por favor ponte al día con tus pagos.</p>
          ) : (
            <p className="text-sm text-emerald-500 font-medium">¡Estás al día!</p>
          )}
        </div>

        <div className="p-8 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-center text-center justify-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-primary" />
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-medium text-foreground">¿Realizaste una transferencia?</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Reporta tu pago adjuntando el comprobante para que la administración lo valide.
          </p>
          <Button asChild className="w-full mt-4 font-semibold shadow-md">
            <Link href="/dashboard/payments/new">
              Reportar Pago Ahora
            </Link>
          </Button>
        </div>

        {/* Aliquot Explanation Card */}
        {unitInfo && (() => {
          const weightInfo = UNIT_WEIGHTS[unitInfo.unit_type];
          if (!weightInfo) return null;
          return (
            <div className="p-6 md:p-8 rounded-2xl border border-dashed border-primary/30 bg-primary/5 flex flex-col justify-center space-y-4 relative overflow-hidden">
              <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Landmark className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Tu Alícuota</h2>
                  <p className="text-3xl font-bold font-mono text-primary">{unitInfo.aliquot_percentage}%</p>
                </div>
              </div>

              <div className="space-y-2 mt-2">
                <p className="text-sm font-bold text-foreground">
                  Tipo: {UNIT_TYPE_LABELS[unitInfo.unit_type] ?? unitInfo.unit_type}
                  <span className={`ml-2 inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full border ${weightInfo.badgeColor}`}>
                    {weightInfo.badge}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {weightInfo.explanation}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                {Object.entries(UNIT_WEIGHTS).map(([type, info]) => (
                  <div
                    key={type}
                    className={`text-center p-2 rounded-xl border text-[10px] font-semibold ${
                      unitInfo.unit_type === type
                        ? `${info.badgeColor} opacity-100`
                        : "border-border text-muted-foreground opacity-40"
                    }`}
                  >
                    <p className="font-bold">{UNIT_TYPE_LABELS[type]}</p>
                    <p>{info.badge}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Breakdown of Unpaid Expenses */}
      {distributions.length > 0 && (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <FileWarning className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Detalle de la Deuda (Cobros de Alícuota)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                  <th className="pb-3 pl-1 font-semibold">Concepto (Razón del cobro)</th>
                  <th className="pb-3 font-semibold text-center">Período</th>
                  <th className="pb-3 font-semibold text-right">Alícuota Aplicada</th>
                  <th className="pb-3 pr-1 font-semibold text-right">Monto a Pagar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {distributions.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 pl-1">
                      <p className="font-semibold text-foreground">{d.common_expenses?.title}</p>
                    </td>
                    <td className="py-4 text-center font-mono text-xs">{d.common_expenses?.period}</td>
                    <td className="py-4 text-right text-muted-foreground">{d.aliquot_percentage}%</td>
                    <td className="py-4 pr-1 text-right font-mono font-bold text-foreground">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(d.assigned_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
