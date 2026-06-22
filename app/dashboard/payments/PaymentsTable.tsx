"use client";

import { useState } from "react";
import { Wallet, CheckCircle, Clock, XCircle, FileText, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePaymentStatus } from "@/app/actions/payments";

interface PaymentsTableProps {
  payments: any[];
  isAdmin: boolean;
}

export function PaymentsTable({ payments, isAdmin }: PaymentsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
  };

  const filteredPayments = payments.filter((payment) => {
    // Status filter
    if (statusFilter !== "all" && payment.status !== statusFilter) return false;

    // Text search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const unit = payment.units?.unit_number?.toLowerCase() || "";
      const resident = payment.profiles?.full_name?.toLowerCase() || "";
      const ref = payment.reference_number?.toLowerCase() || "";
      const period = payment.period?.toLowerCase() || "";
      
      if (!unit.includes(q) && !resident.includes(q) && !ref.includes(q) && !period.includes(q)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por unidad, residente o referencia..." 
            className="pl-9 pr-9 bg-card rounded-xl border-border h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button 
            variant={statusFilter === "all" ? "default" : "outline"} 
            className={`rounded-xl h-10 border-border ${statusFilter !== "all" ? "bg-card" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            Todos
          </Button>
          <Button 
            variant={statusFilter === "pending" ? "default" : "outline"} 
            className={`rounded-xl h-10 border-border hover:bg-amber-500/10 hover:text-amber-600 ${statusFilter === "pending" ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-500" : "text-amber-500 bg-card"}`}
            onClick={() => setStatusFilter("pending")}
          >
            Pendientes
          </Button>
          <Button 
            variant={statusFilter === "verified" ? "default" : "outline"} 
            className={`rounded-xl h-10 border-border hover:bg-emerald-500/10 hover:text-emerald-600 ${statusFilter === "verified" ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500" : "text-emerald-500 bg-card"}`}
            onClick={() => setStatusFilter("verified")}
          >
            Verificados
          </Button>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {filteredPayments && filteredPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Unidad / Residente</th>
                  <th className="px-6 py-4 font-medium">Monto / Fecha</th>
                  <th className="px-6 py-4 font-medium">Período / Ref</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPayments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          Unidad {payment.units?.unit_number || 'N/A'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {payment.profiles?.full_name || 'Sin nombre'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">
                          {formatCurrency(payment.amount)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(payment.payment_date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {payment.period}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Ref: {payment.reference_number || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {payment.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600">
                          <Clock className="h-3.5 w-3.5" /> Pendiente
                        </span>
                      )}
                      {payment.status === 'verified' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600">
                          <CheckCircle className="h-3.5 w-3.5" /> Verificado
                        </span>
                      )}
                      {payment.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600">
                          <XCircle className="h-3.5 w-3.5" /> Rechazado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payment.status === 'pending' ? (
                        <div className="flex justify-end gap-2 flex-wrap">
                          {payment.receipt_url && (
                            <Button asChild size="sm" variant="ghost" className="h-8">
                              <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer">
                                <FileText className="h-4 w-4 mr-1.5 text-blue-500" />
                                <span className="text-blue-500">Recibo</span>
                              </a>
                            </Button>
                          )}
                          {isAdmin && (
                            <>
                              <form action={async () => {
                                await updatePaymentStatus(payment.id, 'verified')
                              }}>
                                <Button type="submit" size="sm" variant="outline" className="h-8 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-500/30">
                                  Aprobar
                                </Button>
                              </form>
                              <form action={async () => {
                                await updatePaymentStatus(payment.id, 'rejected')
                              }}>
                                <Button type="submit" size="sm" variant="outline" className="h-8 border-red-500/20 text-red-600 hover:bg-red-500/10 hover:border-red-500/30">
                                  Rechazar
                                </Button>
                              </form>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          {payment.receipt_url && (
                            <Button asChild size="sm" variant="ghost" className="h-8">
                              <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer">
                                <FileText className="h-4 w-4 mr-1.5 text-blue-500" />
                                <span className="text-blue-500">Recibo</span>
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center mb-4">
              {searchQuery || statusFilter !== "all" ? (
                <Search className="h-8 w-8 text-muted-foreground" />
              ) : (
                <Wallet className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-xl font-bold mb-1">
              {searchQuery || statusFilter !== "all" ? "No se encontraron pagos" : "No hay pagos registrados"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              {searchQuery || statusFilter !== "all" 
                ? "No hay resultados que coincidan con los filtros de búsqueda actuales."
                : "Cuando los residentes reporten sus pagos o transferencias, aparecerán aquí para tu revisión."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
