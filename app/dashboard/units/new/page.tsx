"use client"

import { useActionState } from "react"
import { createUnit } from "@/app/actions/units"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Building2, Save } from "lucide-react"
import Link from "next/link"

export default function NewUnitPage() {
  const [state, action, isPending] = useActionState(createUnit, null)

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/dashboard/units">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva Unidad</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registra una nueva propiedad en el condominio
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8">
        <form action={action} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 pl-1">
                Número de Unidad / Identificador <span className="text-red-500">*</span>
              </label>
              <Input
                id="unit_number"
                name="unit_number"
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
                  defaultValue="apartment"
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
                <span className="text-primary">⚡</span>
                <span className="text-muted-foreground text-xs">Calculada automáticamente según el tipo de unidad al guardar.</span>
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
                  defaultValue="active"
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

          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
            <Button variant="outline" asChild type="button">
              <Link href="/dashboard/units">Cancelar</Link>
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
                  Guardar Unidad
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
