"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, ShieldAlert, Sparkles, Building, AlertTriangle, Check, X, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertAmenity, deleteAmenity, Amenity } from "@/app/actions/amenities";

interface AmenitiesManagerProps {
  initialAmenities: any[];
  isAdmin: boolean;
}

export function AmenitiesManager({ initialAmenities, isAdmin }: AmenitiesManagerProps) {
  const [amenities, setAmenities] = useState<any[]>(initialAmenities);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Partial<Amenity> | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState(10);
  const [rules, setRules] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<"available" | "maintenance" | "inactive">("available");
  const [errorMsg, setErrorMsg] = useState("");

  const openCreateModal = () => {
    setEditingAmenity(null);
    setName("");
    setDescription("");
    setCapacity(10);
    setRules("");
    setImageUrl("");
    setStatus("available");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (amenity: any) => {
    setEditingAmenity(amenity);
    setName(amenity.name || "");
    setDescription(amenity.description || "");
    setCapacity(amenity.capacity || 10);
    setRules(amenity.rules || "");
    setImageUrl(amenity.image_url || "");
    setStatus(amenity.status || "available");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("El nombre es obligatorio.");
      return;
    }
    if (capacity <= 0) {
      setErrorMsg("La capacidad debe ser mayor a 0.");
      return;
    }

    startTransition(async () => {
      try {
        const payload: Amenity = {
          id: editingAmenity?.id,
          name,
          description: description || undefined,
          capacity,
          rules: rules || undefined,
          image_url: imageUrl || undefined,
          status,
        };

        const result = await upsertAmenity(payload);
        
        // Update local state and close modal
        if (editingAmenity?.id) {
          // UPDATE: replace the old item with the freshly updated data from server
          setAmenities(prev =>
            prev.map(a => (a.id === editingAmenity.id ? result : a))
          );
        } else {
          // INSERT: use the real row returned by the server (with its actual UUID)
          setAmenities(prev => [...prev, result]);
        }

        setIsModalOpen(false);
      } catch (err: any) {
        setErrorMsg(err.message || "Error al guardar el espacio común.");
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el espacio común "${name}"?`)) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteAmenity(id);
        setAmenities(prev => prev.filter(a => a.id !== id));
      } catch (err: any) {
        alert(err.message || "Error al eliminar el espacio.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Áreas Comunes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Administración de espacios físicos y amenities del condominio
            </p>
          </div>
        </div>
        {isAdmin && (
          <Button onClick={openCreateModal} className="flex items-center gap-2 rounded-xl h-11 shadow-md hover:shadow-lg font-bold">
            <Plus className="h-4 w-4" />
            Nuevo Espacio
          </Button>
        )}
      </div>

      {/* Grid of Amenities */}
      {amenities.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {amenities.map((a) => (
            <div key={a.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-foreground">{a.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    a.status === "available" 
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
                      : a.status === "maintenance"
                      ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      : "bg-red-500/10 text-red-600 border border-red-500/20"
                  }`}>
                    {a.status === "available" ? "Disponible" : a.status === "maintenance" ? "Mantenimiento" : "Inactivo"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Aforo Máximo: <strong className="text-foreground font-mono">{a.capacity}</strong> personas</span>
                </div>

                {a.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {a.description}
                  </p>
                )}

                {a.rules && (
                  <div className="pt-3 border-t border-border space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Reglas básicas</span>
                    <p className="text-xs text-muted-foreground italic line-clamp-2">
                      "{a.rules}"
                    </p>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="px-6 py-4 bg-muted/40 border-t border-border flex justify-end gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => openEditModal(a)} className="rounded-lg h-9 text-xs font-bold">
                    <Edit2 className="h-3 w-3 mr-1.5" /> Editar
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(a.id, a.name)} className="rounded-lg h-9 text-xs font-bold">
                    <Trash2 className="h-3 w-3 mr-1.5" /> Eliminar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center border border-dashed border-border bg-card rounded-2xl">
          <Building className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No hay espacios comunes registrados en el condominio.</p>
        </div>
      )}

      {/* Modern Creation / Edition Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-border">
              <h3 className="font-bold text-base uppercase tracking-wider">
                {editingAmenity ? "Editar Espacio Común" : "Crear Espacio Común"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider pl-1">Nombre</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Piscina Olímpica, Salón de Fiestas..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider pl-1">Capacidad Máxima</label>
                  <Input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    min={1}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider pl-1">Estado</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full h-12 rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="available">Disponible</option>
                    <option value="maintenance">En Mantenimiento</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider pl-1">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe las facilidades y características..."
                  rows={2}
                  className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider pl-1">Reglamento / Normas</label>
                <textarea
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  placeholder="Ej. Uso obligatorio de traje de baño, prohibido mascotas..."
                  rows={2}
                  className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl h-11 px-5">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending} className="rounded-xl h-11 px-6 shadow-md font-bold min-w-[100px]">
                  {isPending ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
