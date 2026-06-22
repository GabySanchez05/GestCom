"use client"

import { useActionState, useState } from "react";
import { 
  Calendar, Clock, User, Check, X, AlertCircle, Info, 
  HelpCircle, ShieldAlert, Sparkles, Building, Play, Plus, BookOpen, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createReservation, updateReservationStatus } from "@/app/actions/reservations";

interface AmenitiesClientProps {
  initialAmenities: any[];
  initialReservations: any[];
  currentUser: any;
  isAdmin: boolean;
  needsMigration: boolean;
}

export function AmenitiesClient({ 
  initialAmenities, 
  initialReservations, 
  currentUser, 
  isAdmin: serverIsAdmin, 
  needsMigration 
}: AmenitiesClientProps) {
  // Tester overrides for interactive preview
  const [isAdmin, setIsAdmin] = useState(serverIsAdmin);
  const [amenities, setAmenities] = useState<any[]>(initialAmenities);
  const [reservations, setReservations] = useState<any[]>(initialReservations);
  const [selectedAmenity, setSelectedAmenity] = useState<any>(initialAmenities[0]);
  const [activeTab, setActiveTab] = useState<"book" | "my-reservations" | "admin-panel">("book");

  // Form inputs
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [state, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    if (needsMigration) {
      // Simulate locally
      if (!date || !startTime || !endTime) {
        return { error: "Por favor, completa todos los campos obligatorios." };
      }
      if (startTime >= endTime) {
        return { error: "La hora de finalización debe ser posterior a la de inicio." };
      }

      // Add to local state
      const mockNew: any = {
        id: `mock-res-${Date.now()}`,
        reservation_date: date,
        start_time: startTime,
        end_time: endTime,
        status: "pending",
        notes: notes,
        profile_id: currentUser.id,
        amenities: { id: selectedAmenity.id, name: selectedAmenity.name },
        profiles: { id: currentUser.id, full_name: "Tú (Simulación)" },
        units: { unit_number: "A-101" }
      };

      setReservations(prev => [mockNew, ...prev]);
      setSuccessMsg("¡(Simulado) Reserva solicitada con éxito! Puedes verla en la pestaña 'Mis Reservas'.");
      setErrorMsg("");
      
      // Clear form
      setDate("");
      setNotes("");
      return { success: true };
    } else {
      // Execute real Server Action
      try {
        const amenity_id = formData.get("amenity_id") as string;
        const reservation_date = formData.get("reservation_date") as string;
        const start_time = formData.get("start_time") as string;
        const end_time = formData.get("end_time") as string;
        const notes = formData.get("notes") as string || undefined;

        if (!currentUser?.unit_id) {
          throw new Error("Tu perfil no tiene una unidad asignada. Ponte en contacto con el administrador.");
        }

        const data = await createReservation({
          amenity_id,
          unit_id: currentUser.unit_id,
          reservation_date,
          start_time,
          end_time,
          notes,
        });

        setSuccessMsg("Solicitada con éxito.");
        setErrorMsg("");
        setDate("");
        setNotes("");
        return { success: true, data };
      } catch (err: any) {
        const errorMsg = err.message || "Error al crear la reserva.";
        setErrorMsg(errorMsg);
        setSuccessMsg("");
        return { error: errorMsg };
      }
    }
  }, null);

  const handleStatusChange = async (resId: string, nextStatus: "approved" | "rejected" | "cancelled") => {
    if (needsMigration) {
      setReservations(prev => 
        prev.map(r => r.id === resId ? { ...r, status: nextStatus } : r)
      );
    } else {
      try {
        await updateReservationStatus(resId, nextStatus);
      } catch (err: any) {
        alert(err.message || "Error al actualizar estado.");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, React.ReactNode> = {
      approved: (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
          <Check className="h-3 w-3" /> Aprobado
        </span>
      ),
      pending: (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-wider">
          <Clock className="h-3 w-3 animate-pulse" /> Pendiente
        </span>
      ),
      rejected: (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-500/10 text-red-500 px-2.5 py-0.5 rounded-full border border-red-500/20 uppercase tracking-wider">
          <X className="h-3 w-3" /> Rechazado
        </span>
      ),
      cancelled: (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-gray-500/10 text-gray-400 px-2.5 py-0.5 rounded-full border border-gray-500/20 uppercase tracking-wider">
          Cancelado
        </span>
      )
    };
    return badges[status] || <span>{status}</span>;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner for SQL Migrations */}
      {needsMigration && (
        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-blue-500 font-bold text-sm uppercase tracking-wider">
              <Sparkles className="h-5 w-5 animate-bounce" />
              Módulo de Reservas Interactivo (Simulado)
            </div>
            <h2 className="text-lg font-bold">¡Las tablas de Reservas no están en tu Supabase todavía!</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Hemos activado un simulador interactivo completo para que puedas probar la experiencia. Para activarlo en la nube real, ejecuta las consultas del archivo <span className="font-mono text-foreground font-semibold">003_amenities_reservations.sql</span> en tu editor SQL de Supabase.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-background/50 border rounded-xl p-2 shrink-0">
            <span className="text-xs font-semibold text-muted-foreground px-2">Modo Tester:</span>
            <Button 
              size="sm" 
              variant={isAdmin ? "default" : "outline"} 
              onClick={() => {
                setIsAdmin(!isAdmin);
                setSuccessMsg("");
              }}
              className="rounded-lg h-8 text-xs font-bold"
            >
              {isAdmin ? "Admin" : "Residente"}
            </Button>
          </div>
        </div>
      )}

      {/* Main Panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Amenities catalog & Rules */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-sm uppercase tracking-wider">Espacios Comunes</h2>
            </div>

            <div className="space-y-3">
              {amenities.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    setSelectedAmenity(a);
                    setSuccessMsg("");
                    setErrorMsg("");
                  }}
                  className={`w-full p-4 rounded-xl text-left border transition-all flex justify-between items-center ${
                    selectedAmenity?.id === a.id
                      ? "bg-primary/10 border-primary/30 text-foreground"
                      : "border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-foreground">{a.name}</p>
                    <p className="text-xs max-w-[200px] truncate">{a.description}</p>
                  </div>
                  <span className="text-[10px] bg-background border px-2 py-0.5 rounded-md font-mono shrink-0">
                    Cap. {a.capacity}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Amenity Rules details */}
          {selectedAmenity && (
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 relative overflow-hidden space-y-4">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <div className="flex items-center gap-2 text-primary">
                <Info className="h-5 w-5" />
                <h3 className="font-bold text-xs uppercase tracking-wider">Reglamento y Condiciones</h3>
              </div>
              <div className="space-y-3 text-xs leading-relaxed">
                <p className="font-bold text-foreground">Aforo Máximo: {selectedAmenity.capacity} personas</p>
                <div className="p-3 bg-muted/40 rounded-xl text-muted-foreground border border-border">
                  {selectedAmenity.rules || "No hay reglas específicas asignadas para este espacio."}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Tab switcher, Booking form, list of reservations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-6">
            
            {/* Tab Controls */}
            <div className="flex gap-2 border-b border-border pb-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab("book")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider shrink-0 ${
                  activeTab === "book"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                Reservar Espacio
              </button>
              <button
                onClick={() => setActiveTab("my-reservations")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider shrink-0 ${
                  activeTab === "my-reservations"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                Mis Reservas ({reservations.filter(r => r.profile_id === currentUser.id).length})
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab("admin-panel")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider shrink-0 ${
                    activeTab === "admin-panel"
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Panel de Aprobaciones ({reservations.filter(r => r.status === "pending").length})
                </button>
              )}
            </div>

            {/* TAB CONTENT 1: BOOKING FORM */}
            {activeTab === "book" && selectedAmenity && (
              <form action={action} className="space-y-6">
                <input type="hidden" name="amenity_id" value={selectedAmenity.id} />
                
                <div className="p-4 rounded-xl bg-gradient-to-r from-card to-accent/20 border border-border flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shrink-0">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Espacio Seleccionado</span>
                    <p className="font-bold text-sm text-foreground">{selectedAmenity.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider pl-1">Fecha</label>
                    <Input 
                      type="date" 
                      name="reservation_date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      onClick={(e: any) => e.target.showPicker?.()}
                      required 
                      className="bg-background rounded-xl h-11 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider pl-1">Hora Inicio</label>
                    <Input 
                      type="time" 
                      name="start_time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      onClick={(e: any) => e.target.showPicker?.()}
                      required 
                      className="bg-background rounded-xl h-11 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider pl-1">Hora Fin</label>
                    <Input 
                      type="time" 
                      name="end_time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      onClick={(e: any) => e.target.showPicker?.()}
                      required 
                      className="bg-background rounded-xl h-11 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider pl-1">Notas / Propósito (Opcional)</label>
                  <textarea
                    name="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej. Cumpleaños infantil, cena familiar..."
                    rows={3}
                    className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                {errorMsg && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium flex gap-2 items-center">
                    <AlertTriangle className="h-4 w-4 shrink-0 animate-pulse" />
                    {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium flex gap-2 items-center">
                    <Check className="h-4 w-4 shrink-0" />
                    {successMsg}
                  </div>
                )}

                <div className="flex justify-end pt-2 border-t border-border">
                  <Button type="submit" disabled={isPending} className="min-w-[140px] rounded-xl h-11 shadow-md hover:shadow-lg font-bold">
                    {isPending ? "Procesando..." : "Confirmar Reserva"}
                  </Button>
                </div>
              </form>
            )}

            {/* TAB CONTENT 2: RESIDENT'S OWN RESERVATIONS */}
            {activeTab === "my-reservations" && (
              <div className="space-y-4">
                {reservations.filter(r => r.profile_id === currentUser.id).length > 0 ? (
                  <div className="divide-y divide-border">
                    {reservations.filter(r => r.profile_id === currentUser.id).map((r) => (
                      <div key={r.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 first:pt-0 last:pb-0">
                        <div className="space-y-1">
                          <p className="font-bold text-sm text-foreground">{r.amenities?.name}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 font-semibold text-foreground font-mono">
                              <Calendar className="h-3.5 w-3.5 text-primary" /> {r.reservation_date}
                            </span>
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="h-3.5 w-3.5 text-primary" /> {r.start_time.substring(0,5)} - {r.end_time.substring(0,5)}
                            </span>
                          </div>
                          {r.notes && <p className="text-xs text-muted-foreground italic mt-1 pl-1">"{r.notes}"</p>}
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                          {getStatusBadge(r.status)}
                          
                          {r.status === "pending" && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleStatusChange(r.id, "cancelled")}
                              className="h-8 rounded-lg text-red-500 hover:bg-red-500/10 text-xs font-bold"
                            >
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center border border-dashed border-border rounded-xl">
                    <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No tienes ninguna reserva solicitada.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 3: ADMIN APPROVALS PANEL */}
            {activeTab === "admin-panel" && isAdmin && (
              <div className="space-y-4">
                {reservations.length > 0 ? (
                  <div className="divide-y divide-border">
                    {reservations.map((r) => (
                      <div key={r.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 first:pt-0 last:pb-0">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-foreground">{r.amenities?.name}</p>
                            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold font-mono">
                              U. {r.units?.unit_number || "S/U"}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 font-semibold text-foreground font-mono">
                              <Calendar className="h-3.5 w-3.5 text-primary" /> {r.reservation_date}
                            </span>
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="h-3.5 w-3.5 text-primary" /> {r.start_time.substring(0,5)} - {r.end_time.substring(0,5)}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5 text-primary" /> {r.profiles?.full_name}
                            </span>
                          </div>
                          {r.notes && <p className="text-xs text-muted-foreground italic mt-1 pl-1">"{r.notes}"</p>}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          {r.status === "pending" ? (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleStatusChange(r.id, "approved")}
                                className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                              >
                                Aprobar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStatusChange(r.id, "rejected")}
                                className="h-8 border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-lg text-xs font-bold"
                              >
                                Rechazar
                              </Button>
                            </>
                          ) : (
                            getStatusBadge(r.status)
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center border border-dashed border-border rounded-xl">
                    <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No se registran solicitudes de reservas para auditar.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
