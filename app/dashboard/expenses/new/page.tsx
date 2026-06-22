"use client"

import { useActionState } from "react"
import { createExpense } from "@/app/actions/expenses"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save, FileText, Upload } from "lucide-react"
import Link from "next/link"

export default function NewExpensePage() {
  const [state, action, isPending] = useActionState(createExpense, null)

  const today = new Date();
  
  // Date limits (+/- 1 month)
  const minDateObj = new Date(today);
  minDateObj.setMonth(minDateObj.getMonth() - 1);
  const minDate = minDateObj.toISOString().slice(0, 10);

  const maxDateObj = new Date(today);
  maxDateObj.setMonth(maxDateObj.getMonth() + 1);
  const maxDate = maxDateObj.toISOString().slice(0, 10);

  // Month limits
  const minMonth = minDateObj.toISOString().slice(0, 7);
  const maxMonth = maxDateObj.toISOString().slice(0, 7);
  
  const currentMonth = today.toISOString().slice(0, 7);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/dashboard/expenses">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Registrar Gasto Común</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Añade un nuevo gasto que será distribuido entre los residentes
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8">
        <form action={action} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground/80 pl-1">
                Título del Gasto <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                name="title"
                placeholder="Ej. Mantenimiento de Ascensores - Junio"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 pl-1">
                Monto Total (USD) <span className="text-red-500">*</span>
              </label>
              <Input
                id="total_amount"
                name="total_amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Ej. 1250.00"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 pl-1">
                Categoría <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="category"
                  id="category"
                  defaultValue="maintenance"
                  className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-10 appearance-none"
                  required
                >
                  <option value="maintenance" className="bg-card text-foreground">Mantenimiento</option>
                  <option value="utilities" className="bg-card text-foreground">Servicios Básicos</option>
                  <option value="security" className="bg-card text-foreground">Seguridad</option>
                  <option value="admin" className="bg-card text-foreground">Administración</option>
                  <option value="other" className="bg-card text-foreground">Otros</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 pl-1">
                Fecha del Gasto <span className="text-red-500">*</span>
              </label>
              <Input
                id="expense_date"
                name="expense_date"
                type="date"
                min={minDate}
                max={maxDate}
                defaultValue={today.toISOString().slice(0, 10)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 pl-1">
                Período a Facturar <span className="text-red-500">*</span>
              </label>
              <Input
                id="period"
                name="period"
                type="month"
                min={minMonth}
                max={maxMonth}
                defaultValue={currentMonth}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground/80 pl-1">
                Descripción Adicional
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                placeholder="Detalles sobre este gasto, proveedores, etc."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground/80 pl-1">
                Factura o Recibo (Opcional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group">
                <div className="space-y-1 text-center">
                  <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="mx-auto h-6 w-6 text-primary" />
                  </div>
                  <div className="flex text-sm text-muted-foreground justify-center">
                    <label htmlFor="receipt_url" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                      <span>Sube un archivo</span>
                      <input id="receipt_url" name="receipt_url" type="file" className="sr-only" accept="image/*,.pdf" />
                    </label>
                    <p className="pl-1">o arrastra y suelta</p>
                  </div>
                  <p className="text-xs text-muted-foreground">PDF, JPG hasta 10MB</p>
                </div>
              </div>
            </div>

          </div>

          {state?.error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center">
              {state.error}
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
            <Button variant="outline" asChild type="button">
              <Link href="/dashboard/expenses">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending} className="min-w-[140px] shadow-md hover:shadow-lg transition-all">
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Guardar Gasto
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
