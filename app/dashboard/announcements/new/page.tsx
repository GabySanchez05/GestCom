"use client"

import { useActionState } from "react"
import { createAnnouncement } from "@/app/actions/announcements"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"

export default function NewAnnouncementPage() {
  const [state, action, isPending] = useActionState(createAnnouncement, null)

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/dashboard/announcements">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Publicar Anuncio</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crea un nuevo comunicado para toda la comunidad
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8">
        <form action={action} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80 pl-1">
              Título del Anuncio <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              name="title"
              placeholder="Ej. Mantenimiento programado de piscina"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80 pl-1">
              Contenido <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              rows={8}
              className="w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y min-h-[150px]"
              placeholder="Escribe el mensaje completo aquí..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 pl-1">
                Prioridad
              </label>
              <div className="relative">
                <select
                  name="priority"
                  id="priority"
                  defaultValue="low"
                  className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-10 appearance-none"
                >
                  <option value="low" className="bg-card text-foreground">Baja (Informativo)</option>
                  <option value="medium" className="bg-card text-foreground">Media (Recordatorio)</option>
                  <option value="high" className="bg-card text-foreground">Alta (Importante)</option>
                  <option value="urgent" className="bg-card text-foreground">Urgente (Crítico)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-6 md:justify-end">
              <input
                type="checkbox"
                id="is_pinned"
                name="is_pinned"
                className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-600 cursor-pointer"
              />
              <label htmlFor="is_pinned" className="text-sm font-medium text-foreground/80 cursor-pointer">
                Fijar al inicio del tablón
              </label>
            </div>
          </div>

          {state?.error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center">
              {state.error}
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
            <Button variant="outline" asChild type="button">
              <Link href="/dashboard/announcements">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending} className="min-w-[140px] shadow-md hover:shadow-lg transition-all bg-purple-600 hover:bg-purple-700 text-white">
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Publicando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Publicar Anuncio
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
