"use client"

import { useActionState, useState } from "react";
import { 
  User, Building, Key, History, Home, MapPin, 
  CheckCircle2, XCircle, Save, FileText, Calendar, 
  DollarSign, ArrowUpRight, HelpCircle, Landmark
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateUnit } from "@/app/actions/units";
import Link from "next/link";

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

interface UnitDetailsTabsProps {
  unit: any;
  residents: any[];
  distributions: any[];
  payments: any[];
  isAdmin: boolean;
}

export function UnitDetailsTabs({ 
  unit, 
  residents, 
  distributions, 
  payments, 
  isAdmin 
}: UnitDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState<"info" | "expenses" | "payments" | "edit">("info");

  // Bind the unit.id to the update action
  const updateUnitWithId = updateUnit.bind(null, unit.id);
  const [state, action, isPending] = useActionState(updateUnitWithId, null);

  // Financial aggregates
  const totalDebt = distributions.reduce((sum, d) => sum + Number(d.assigned_amount), 0);
  const totalPaid = payments.filter(p => p.status === "verified").reduce((sum, p) => sum + Number(p.amount), 0);
  const netDebt = Math.max(0, totalDebt - totalPaid);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Navigation Menu */}
      <div className="lg:col-span-1 space-y-2">
        <button
          onClick={() => setActiveTab("info")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
            activeTab === "info"
              ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          <Home className="h-5 w-5" />
          Resumen General
        </button>

        <button
          onClick={() => setActiveTab("expenses")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
            activeTab === "expenses"
              ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          <Calendar className="h-5 w-5" />
          Historial de Expensas ({distributions.length})
        </button>

        <button
          onClick={() => setActiveTab("payments")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
            activeTab === "payments"
              ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          <History className="h-5 w-5" />
          Historial de Pagos ({payments.length})
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab("edit")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
              activeTab === "edit"
                ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <Building className="h-5 w-5" />
            Editar Unidad
          </button>
        )}
      </div>

      {/* Tabs Content */}
      <div className="lg:col-span-3 space-y-8">
        
        {/* TAB 1: SUMMARY / GENERAL INFO */}
        {activeTab === "info" && (
          <div className="space-y-6">
            {/* Financial Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card rounded-2xl border border-border p-6 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Estado de Cuenta</span>
                <div className="flex items-center justify-between">
                  <span className={`text-xl font-bold ${netDebt > 0 ? "text-red-500 animate-pulse" : "text-emerald-500"}`}>
                    {netDebt > 0 ? "En Mora" : "Solvente"}
                  </span>
                  {netDebt > 0 ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  )}
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Deuda Pendiente</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-mono font-bold text-foreground">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(netDebt)}
                  </span>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Total Pagado</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-mono font-bold text-emerald-500">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalPaid)}
                  </span>
                </div>
              </div>
            </div>

            {/* General Specs */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <Building className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Especificaciones de la Propiedad</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground block">Identificador</span>
                  <span className="font-semibold text-foreground">{unit.unit_number}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground block">Tipo de Unidad</span>
                  <span className="font-semibold text-foreground capitalize">{UNIT_TYPE_LABELS[unit.unit_type] ?? unit.unit_type}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground block">Piso / Ubicación</span>
                  <span className="font-semibold text-foreground">Piso {unit.floor_number || "Planta Baja"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground block">Alícuota Asignada</span>
                  <span className="font-semibold text-primary">{unit.aliquot_percentage}%</span>
                  <span className="text-[10px] text-muted-foreground block">Automática</span>
                </div>
              </div>
            </div>

            {/* Resident Directory */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Residentes Registrados</h2>
              </div>

              {residents.length > 0 ? (
                <div className="divide-y divide-border">
                  {residents.map((r) => (
                    <div key={r.id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-foreground">{r.full_name || "Sin nombre registrado"}</p>
                        <p className="text-xs text-muted-foreground">{r.email}</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium capitalize">
                        {r.role}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-border rounded-xl">
                  <p className="text-sm text-muted-foreground">No hay usuarios de GestCom asociados a esta unidad todavía.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: EXPENSES HISTORY */}
        {activeTab === "expenses" && (
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Historial de Expensas Comunes</h2>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                Total Acumulado: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalDebt)}
              </span>
            </div>
            {/* Aliquot Explanation Banner */}
            {(() => {
              const weightInfo = UNIT_WEIGHTS[unit.unit_type];
              if (!weightInfo) return null;
              return (
                <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Landmark className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tu Alícuota Explicada</p>
                      <p className="text-sm font-bold text-foreground">
                        Tipo de Unidad: {UNIT_TYPE_LABELS[unit.unit_type] ?? unit.unit_type}
                        <span className={`ml-2 inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full border ${weightInfo.badgeColor}`}>
                          {weightInfo.badge}
                        </span>
                      </p>
                    </div>
                    <div className="ml-auto text-right shrink-0">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tu porcentaje</p>
                      <p className="text-2xl font-bold font-mono text-primary">{unit.aliquot_percentage}%</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed border-t border-primary/10 pt-3">
                    {weightInfo.explanation}
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {Object.entries(UNIT_WEIGHTS).map(([type, info]) => (
                      <div
                        key={type}
                        className={`text-center p-2 rounded-xl border text-[10px] font-semibold ${
                          unit.unit_type === type
                            ? `${info.badgeColor} opacity-100`
                            : "border-border text-muted-foreground opacity-50"
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

            {distributions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                      <th className="pb-3 pl-1 font-semibold">Descripción del Gasto</th>
                      <th className="pb-3 font-semibold text-center">Mes / Período</th>
                      <th className="pb-3 font-semibold text-right">Alícuota</th>
                      <th className="pb-3 pr-1 font-semibold text-right">Monto Asignado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium">
                    {distributions.map((d) => (
                      <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 pl-1">
                          <p className="font-semibold text-foreground">{d.common_expenses?.title}</p>
                          <p className="text-xs text-muted-foreground max-w-xs truncate">{d.common_expenses?.description}</p>
                        </td>
                        <td className="py-4 text-center font-mono text-xs">{d.common_expenses?.period}</td>
                        <td className="py-4 text-right text-muted-foreground">{d.aliquot_percentage}%</td>
                        <td className="py-4 pr-1 text-right font-mono font-semibold text-foreground">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(d.assigned_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-border rounded-xl">
                <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Esta unidad no registra cobros ni expensas distribuidas todavía.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PAYMENTS HISTORY */}
        {activeTab === "payments" && (
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <History className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Pagos Reportados</h2>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                Total Verificado: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalPaid)}
              </span>
            </div>

            {payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                      <th className="pb-3 pl-1 font-semibold">Período</th>
                      <th className="pb-3 font-semibold">Referencia</th>
                      <th className="pb-3 font-semibold">Fecha de Reporte</th>
                      <th className="pb-3 font-semibold text-center">Estado</th>
                      <th className="pb-3 font-semibold text-right">Monto</th>
                      <th className="pb-3 pr-1 font-semibold text-right">Comprobante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 pl-1 font-mono text-xs">{p.period}</td>
                        <td className="py-4 font-mono text-xs">{p.reference_number || "S/R"}</td>
                        <td className="py-4 text-xs text-muted-foreground">
                          {new Date(p.payment_date).toLocaleDateString()}
                        </td>
                        <td className="py-4 text-center">
                          {p.status === "verified" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                              Verificado
                            </span>
                          )}
                          {p.status === "pending" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-wider">
                              Pendiente
                            </span>
                          )}
                          {p.status === "rejected" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full border border-red-500/20 uppercase tracking-wider">
                              Rechazado
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-right font-mono font-semibold text-foreground">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p.amount)}
                        </td>
                        <td className="py-4 pr-1 text-right">
                          {p.receipt_url ? (
                            <Button variant="ghost" size="icon" asChild className="rounded-xl h-8 w-8 hover:bg-primary/10 hover:text-primary">
                              <a href={p.receipt_url} target="_blank" rel="noreferrer" title="Ver Comprobante">
                                <ArrowUpRight className="h-4 w-4" />
                              </a>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-border rounded-xl">
                <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No se registran transferencias ni pagos reportados para esta unidad.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: EDIT FORM (ADMIN ONLY) */}
        {activeTab === "edit" && isAdmin && (
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Building className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Modificar Datos de la Unidad</h2>
            </div>

            <form action={action} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 pl-1">
                    Número de Unidad / Identificador <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="unit_number"
                    name="unit_number"
                    defaultValue={unit.unit_number || ""}
                    placeholder="Ej. A-101, Casa 5"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 pl-1">
                    Tipo de Unidad <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="unit_type"
                      id="unit_type"
                      defaultValue={unit.unit_type || "apartment"}
                      className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 h-10 appearance-none"
                      required
                    >
                      <option value="apartment" className="bg-card text-foreground">Apartamento</option>
                      <option value="house" className="bg-card text-foreground">Casa</option>
                      <option value="local" className="bg-card text-foreground">Local Comercial</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 pl-1">
                    Alícuota Asignada
                  </label>
                  <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 text-sm">
                    <span className="text-primary font-bold">{unit.aliquot_percentage}%</span>
                    <span className="text-muted-foreground text-xs">— Calculada automáticamente según el tipo de unidad. Se actualizará al guardar.</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 pl-1">
                    Número de Piso (Opcional)
                  </label>
                  <Input
                    id="floor_number"
                    name="floor_number"
                    type="number"
                    min="0"
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === '+' || e.key === '.') {
                        e.preventDefault();
                      }
                    }}
                    defaultValue={unit.floor_number ?? ""}
                    placeholder="Ej. 1"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground/80 pl-1">
                    Estado <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="status"
                      id="status"
                      defaultValue={unit.status || "active"}
                      className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 h-10 appearance-none"
                      required
                    >
                      <option value="active" className="bg-card text-foreground">Activo (Paga expensas)</option>
                      <option value="inactive" className="bg-card text-foreground">Inactivo (Exento / En construcción)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

              </div>

              {state?.error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center">
                  {state.error}
                </div>
              )}

              {state?.success && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium text-center">
                  {state.message}
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
                <Button type="submit" disabled={isPending} className="min-w-[140px] shadow-md hover:shadow-lg transition-all font-semibold flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
