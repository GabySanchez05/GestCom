import { createClient } from "@/lib/supabase/server";
import { Wallet, Plus, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PaymentsTable } from "./PaymentsTable";

export const metadata = {
  title: "Pagos | GestCom",
  description: "Gestión de pagos y transferencias",
};

export default async function PaymentsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await (supabase
    .from("profiles") as any)
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  const { data, error } = await supabase
    .from("payments")
    .select(`
      *,
      units ( unit_number ),
      profiles ( full_name )
    `)
    .order("created_at", { ascending: false });

  const payments = (data as any[]) ?? [];

  const totalCollected = payments
    .filter((p: any) => p.status === "verified")
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const pendingCount = payments.filter((p: any) => p.status === "pending").length;
  const rejectedCount = payments.filter((p: any) => p.status === "rejected").length;

  if (error) {
    console.error("Error fetching payments:", error);
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pagos Registrados</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Verifica y gestiona los pagos reportados por los residentes
            </p>
          </div>
        </div>
        <Button asChild className="shrink-0 h-11 px-6 rounded-xl shadow-md hover:shadow-lg transition-all">
          <Link href="/dashboard/payments/new">
            <Plus className="h-5 w-5 mr-2" />
            Reportar Pago
          </Link>
        </Button>
      </div>

      {/* Admin Stats */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-4">
            <Wallet className="h-6 w-6 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalCollected)}</p>
              <p className="text-xs text-muted-foreground">Recaudado Verificado</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-4">
            <Clock className="h-6 w-6 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-4">
            <XCircle className="h-6 w-6 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{rejectedCount}</p>
              <p className="text-xs text-muted-foreground">Rechazados</p>
            </div>
          </div>
        </div>
      )}

      {/* Payments Table with real search & filters (Client Component) */}
      <PaymentsTable payments={payments} isAdmin={isAdmin} />
    </div>
  );
}
