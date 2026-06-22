"use client"

import { useActionState, useState, useEffect } from "react"
import { createPayment } from "@/app/actions/payments"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Upload, Send, File as FileIcon, Landmark, User, FileText, Mail } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function NewPaymentPage() {
  const [state, action, isPending] = useActionState(createPayment, null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [condoSettings, setCondoSettings] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    async function loadBankDetails() {
      try {
        const { data } = await (supabase
          .from("condo_settings") as any)
          .select("*")
          .eq("id", "singleton")
          .single()
        
        if (data) {
          setCondoSettings(data)
        }
      } catch (err) {
        console.warn("Could not load condo settings:", err)
      }
    }
    loadBankDetails()
  }, [])

  // Current month string 'YYYY-MM'
  const currentMonth = new Date().toISOString().slice(0, 7)

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/dashboard/payments">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reportar Pago</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Envía el comprobante de tu transferencia o depósito
          </p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Bank Account Details Card */}
        {condoSettings && (
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 relative overflow-hidden space-y-5">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              
              <div className="flex items-center gap-2 text-primary">
                <Landmark className="h-5 w-5" />
                <h2 className="font-bold text-xs uppercase tracking-wider">Datos de Transferencia</h2>
              </div>

              <div className="space-y-4 text-sm leading-relaxed">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Banco Receptor</span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    {condoSettings.bank_name}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Titular</span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" /> {condoSettings.bank_account_holder}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Cuenta Bancaria</span>
                  <span className="font-mono font-semibold text-primary bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10 select-all block text-xs truncate">
                    {condoSettings.bank_account_number}
                  </span>
                </div>

                {condoSettings.tax_id && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">ID Fiscal (RIF/NIT/RUT)</span>
                    <span className="font-mono font-semibold text-foreground flex items-center gap-1.5 select-all">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" /> {condoSettings.tax_id}
                    </span>
                  </div>
                )}

                {condoSettings.bank_account_email && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Correo de Notificación</span>
                    <span className="font-semibold text-foreground flex items-center gap-1.5 select-all text-xs truncate">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {condoSettings.bank_account_email}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Right Column: Form Card */}
        <div className={condoSettings ? "lg:col-span-2" : "lg:col-span-3 max-w-2xl mx-auto w-full"}>
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8">
            <form action={action} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 pl-1">
                    Monto Transferido (USD) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Ej. 150.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 pl-1">
                    Fecha del Pago <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="payment_date"
                    name="payment_date"
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 pl-1">
                    Período a Pagar <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="period"
                    name="period"
                    type="month"
                    defaultValue={currentMonth}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 pl-1">
                    Número de Referencia
                  </label>
                  <Input
                    id="reference_number"
                    name="reference_number"
                    placeholder="Ej. 1234567890"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground/80 pl-1">
                    Comprobante (Imagen o PDF)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group">
                    <div className="space-y-1 text-center">
                      <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {fileName ? <FileIcon className="mx-auto h-6 w-6 text-primary" /> : <Upload className="mx-auto h-6 w-6 text-primary" />}
                      </div>
                      <div className="flex text-sm text-muted-foreground justify-center flex-col items-center gap-2">
                        {fileName ? (
                          <span className="font-medium text-primary bg-primary/10 px-3 py-1 rounded-full truncate max-w-xs">{fileName}</span>
                        ) : (
                          <div className="flex">
                            <label htmlFor="receipt_file" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                              <span>Sube un archivo</span>
                            </label>
                            <p className="pl-1">o arrastra y suelta</p>
                          </div>
                        )}
                        <input 
                          id="receipt_file" 
                          name="receipt_file" 
                          type="file" 
                          className="sr-only" 
                          accept="image/*,.pdf" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setFileName(file.name);
                          }}
                        />
                      </div>
                      {!fileName && <p className="text-xs text-muted-foreground mt-2">PNG, JPG, PDF hasta 5MB</p>}
                      {fileName && (
                        <label htmlFor="receipt_file" className="text-xs text-primary cursor-pointer hover:underline mt-2 inline-block">
                          Cambiar archivo
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground/80 pl-1">
                    Notas Adicionales
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    placeholder="Algún detalle sobre este pago..."
                  />
                </div>

              </div>

              {state?.error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center">
                  {state.error}
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
                <Button variant="outline" asChild type="button">
                  <Link href="/dashboard/payments">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isPending} className="min-w-[140px] shadow-md hover:shadow-lg transition-all font-semibold">
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Enviar Reporte
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
