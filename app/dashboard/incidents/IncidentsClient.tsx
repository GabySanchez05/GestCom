"use client"

import { useActionState, useState, useTransition } from "react";
import {
  Wrench, AlertTriangle, Clock, CheckCircle2, ArrowRight,
  Upload, User, MapPin, Flag, FileText,
  MessageSquare, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createIncident, updateIncidentStatus } from "@/app/actions/incidents";

// ─── Types ────────────────────────────────────────────────────────────────────
interface IncidentsClientProps {
  initialIncidents: any[];
  currentUser: any;
  isAdmin: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PRIORITY_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  low:    { label: "Baja",    color: "text-sky-400",    bg: "bg-sky-500/10",    border: "border-sky-500/20" },
  medium: { label: "Media",   color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20" },
  high:   { label: "Alta",    color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  urgent: { label: "Urgente", color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20" },
};

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  reported:    { label: "Reportado",    icon: <AlertTriangle className="h-3.5 w-3.5" />, color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20" },
  in_progress: { label: "En Proceso",   icon: <Clock className="h-3.5 w-3.5 animate-spin" />,        color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
  resolved:    { label: "Resuelto",     icon: <CheckCircle2 className="h-3.5 w-3.5" />,   color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
};

const KANBAN_COLUMNS = [
  { key: "reported",    label: "Reportado",  accent: "border-amber-500/40",  header: "bg-amber-500/10" },
  { key: "in_progress", label: "En Proceso", accent: "border-blue-500/40",   header: "bg-blue-500/10" },
  { key: "resolved",    label: "Resuelto",   accent: "border-emerald-500/40",header: "bg-emerald-500/10" },
];

const AREAS = [
  "Ascensor / Elevador",
  "Pasillos / Escaleras",
  "Lobby / Entrada",
  "Estacionamiento",
  "Piscina",
  "Gimnasio",
  "Quincho / Parrilla",
  "Jardines / Áreas Verdes",
  "Sistema Eléctrico",
  "Sistema de Agua / Plomería",
  "Iluminación Exterior",
  "Portón / Acceso",
  "Salón de Eventos",
  "Otro",
];

// ─── Main Component ────────────────────────────────────────────────────────────
export function IncidentsClient({ initialIncidents, currentUser, isAdmin: serverIsAdmin }: IncidentsClientProps) {
  const [isAdmin, setIsAdmin] = useState(serverIsAdmin);
  const [incidents, setIncidents] = useState<any[]>(initialIncidents);
  const [activeTab, setActiveTab] = useState<"report" | "my-tickets" | "kanban">("report");
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  // ── Form action ────────────────────────────────────────────────────────────
  const [, formAction, isFormPending] = useActionState(async (prevState: any, formData: FormData) => {
    setFormError(""); setFormSuccess("");

    const res = await createIncident(prevState, formData);
    if (res?.error)   setFormError(res.error);
    if (res?.success) { setFormSuccess(res.message); setPreviewUrl(null); }
    return res;
  }, null);

  // ── Status change ──────────────────────────────────────────────────────────
  const handleStatus = (id: string, status: "reported" | "in_progress" | "resolved") => {
    const notes = editingNotes[id] ?? "";
    startTransition(async () => {
      try { await updateIncidentStatus(id, status, notes); }
      catch (e: any) { alert(e.message); }
    });
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const myIncidents = incidents.filter(i => i.profile_id === currentUser.id);
  const pendingCount = incidents.filter(i => i.status !== "resolved").length;

  const PriorityBadge = ({ priority }: { priority: string }) => {
    const m = PRIORITY_META[priority] ?? PRIORITY_META.medium;
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${m.color} ${m.bg} ${m.border}`}>
        <Flag className="h-3 w-3" /> {m.label}
      </span>
    );
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const m = STATUS_META[status] ?? STATUS_META.reported;
    return (
      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${m.color} ${m.bg} ${m.border}`}>
        {m.icon} {m.label}
      </span>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-fade-in">

      {/* Tab bar */}
      <div className="flex gap-2 bg-card border border-border p-2 rounded-2xl overflow-x-auto">
        {[
          { key: "report",     label: "Reportar Incidencia" },
          { key: "my-tickets", label: `Mis Reportes (${myIncidents.length})` },
          ...(isAdmin ? [{ key: "kanban", label: `Panel Kanban (${pendingCount} activas)` }] : []),
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider shrink-0 ${
              activeTab === tab.key
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: REPORT FORM ─────────────────────────────────────────────── */}
      {activeTab === "report" && (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-3 border-b border-border pb-5 mb-6">
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <Wrench className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Nuevo Reporte de Incidencia</h2>
              <p className="text-xs text-muted-foreground">Describe el problema para que la administración lo atienda</p>
            </div>
          </div>

          <form action={formAction} className="space-y-6">
            {/* Title + Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider pl-1">Título del Problema *</label>
                <Input name="title" placeholder="Ej. Ascensor sin funcionar desde las 8am" className="bg-background rounded-xl h-11" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider pl-1">Área Afectada *</label>
                <select name="area" className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" required defaultValue="">
                  <option value="" disabled>Selecciona un área…</option>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider pl-1">Prioridad</label>
              <div className="flex flex-wrap gap-3">
                {Object.entries(PRIORITY_META).map(([val, m]) => (
                  <label key={val} className="cursor-pointer">
                    <input type="radio" name="priority" value={val} defaultChecked={val === "medium"} className="sr-only peer" />
                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all peer-checked:ring-2 peer-checked:ring-primary ${m.color} ${m.bg} ${m.border} hover:opacity-80`}>
                      <Flag className="h-3.5 w-3.5" /> {m.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider pl-1">Descripción Detallada *</label>
              <textarea
                name="description"
                rows={4}
                placeholder="Describe el problema con todos los detalles: cuándo empezó, qué observas, si afecta a más vecinos…"
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2.5 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              />
            </div>

            {/* Evidence upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider pl-1">Foto de Evidencia (Opcional)</label>
              <label className="cursor-pointer flex flex-col items-center justify-center gap-3 w-full rounded-xl border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors p-6">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="max-h-40 rounded-xl object-cover shadow-md" />
                ) : (
                  <>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">Haz clic o arrastra una imagen</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG o WEBP — Máx. 5 MB</p>
                    </div>
                  </>
                )}
                <input
                  type="file"
                  name="evidence"
                  accept="image/*"
                  className="sr-only"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) setPreviewUrl(URL.createObjectURL(f));
                  }}
                />
              </label>
              {previewUrl && (
                <button type="button" onClick={() => setPreviewUrl(null)} className="text-xs text-red-400 hover:underline pl-1">
                  Quitar imagen
                </button>
              )}
            </div>

            {/* Feedback */}
            {formError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex gap-2 items-start">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> {formError}
              </div>
            )}
            {formSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex gap-2 items-start">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> {formSuccess}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-border">
              <Button type="submit" disabled={isFormPending} className="min-w-[160px] rounded-xl h-11 font-bold shadow-md hover:shadow-lg">
                {isFormPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando…</> : "Enviar Reporte"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ── TAB 2: MY TICKETS (Resident Timeline) ─────────────────────────────── */}
      {activeTab === "my-tickets" && (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-5">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Mis Reportes</h2>
          </div>

          {myIncidents.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Wrench className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No has enviado ningún reporte todavía.</p>
            </div>
          ) : (
            <div className="space-y-0 relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-2 bottom-2 w-px bg-border" />
              {myIncidents.map((incident, idx) => {
                const sm = STATUS_META[incident.status] ?? STATUS_META.reported;
                const pm = PRIORITY_META[incident.priority] ?? PRIORITY_META.medium;
                return (
                  <div key={incident.id} className="relative pl-14 pb-8 last:pb-0">
                    {/* Timeline dot */}
                    <div className={`absolute left-3 top-1 h-5 w-5 rounded-full border-2 border-card flex items-center justify-center ${sm.bg}`}>
                      <span className={sm.color}>{sm.icon}</span>
                    </div>

                    <div className={`rounded-2xl border p-5 space-y-3 hover:shadow-md transition-shadow ${incident.status === "resolved" ? "opacity-70" : ""}`}>
                      <div className="flex flex-wrap items-start gap-2 justify-between">
                        <h3 className="font-bold text-sm text-foreground">{incident.title}</h3>
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge status={incident.status} />
                          <PriorityBadge priority={incident.priority} />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" />{incident.area}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-primary" />{new Date(incident.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">{incident.description}</p>

                      {incident.evidence_url && (
                        <a href={incident.evidence_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-1">
                          <img src={incident.evidence_url} alt="Evidencia" className="max-h-32 rounded-xl object-cover border border-border hover:opacity-80 transition-opacity" />
                        </a>
                      )}

                      {/* Admin note notification */}
                      {incident.admin_notes && (
                        <div className="flex gap-2 items-start p-3 bg-primary/5 rounded-xl border border-primary/20">
                          <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">Nota del Administrador</p>
                            <p className="text-xs text-foreground">{incident.admin_notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: ADMIN KANBAN ───────────────────────────────────────────────── */}
      {activeTab === "kanban" && isAdmin && (
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-4 flex items-center gap-3">
            <Wrench className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Tablero Kanban de Incidencias</h2>
            <span className="ml-auto text-xs text-muted-foreground">{incidents.length} reporte(s) total</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {KANBAN_COLUMNS.map(col => {
              const colItems = incidents.filter(i => i.status === col.key);
              const sm = STATUS_META[col.key];
              return (
                <div key={col.key} className={`bg-card rounded-2xl border-2 ${col.accent} shadow-sm flex flex-col`}>
                  {/* Column Header */}
                  <div className={`${col.header} px-5 py-4 rounded-t-xl border-b border-border flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className={sm.color}>{sm.icon}</span>
                      <h3 className="font-bold text-sm">{col.label}</h3>
                    </div>
                    <span className="text-xs font-bold bg-background border rounded-full px-2 py-0.5">{colItems.length}</span>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 p-4 space-y-4 min-h-[160px]">
                    {colItems.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-8">Sin incidencias</p>
                    )}
                    {colItems.map(incident => (
                      <div key={incident.id} className="bg-background rounded-xl border border-border p-4 space-y-3 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-sm leading-tight">{incident.title}</p>
                          <PriorityBadge priority={incident.priority} />
                        </div>

                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" />{incident.area}</span>
                          {incident.profiles?.full_name && (
                            <span className="flex items-center gap-1"><User className="h-3 w-3 text-primary" />{incident.profiles.full_name}</span>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2">{incident.description}</p>

                        {incident.evidence_url && (
                          <a href={incident.evidence_url} target="_blank" rel="noopener noreferrer">
                            <img src={incident.evidence_url} alt="Evidencia" className="w-full h-20 object-cover rounded-lg border border-border hover:opacity-80 transition-opacity" />
                          </a>
                        )}

                        {/* Admin notes textarea */}
                        <textarea
                          rows={2}
                          placeholder="Agrega una nota de actualización…"
                          value={editingNotes[incident.id] ?? incident.admin_notes ?? ""}
                          onChange={e => setEditingNotes(prev => ({ ...prev, [incident.id]: e.target.value }))}
                          className="w-full text-xs rounded-lg border border-border bg-muted/40 px-2.5 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                        />

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {col.key !== "in_progress" && col.key !== "resolved" && (
                            <Button size="sm" onClick={() => handleStatus(incident.id, "in_progress")} disabled={isPending} className="h-7 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex-1">
                              <ArrowRight className="h-3 w-3 mr-1" /> En Proceso
                            </Button>
                          )}
                          {col.key !== "resolved" && (
                            <Button size="sm" onClick={() => handleStatus(incident.id, "resolved")} disabled={isPending} className="h-7 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex-1">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Resolver
                            </Button>
                          )}
                          {col.key !== "reported" && (
                            <Button size="sm" variant="outline" onClick={() => handleStatus(incident.id, "reported")} disabled={isPending} className="h-7 text-xs rounded-lg border-border flex-1">
                              Reabrir
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
