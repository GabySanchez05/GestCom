"use client";

import { useState } from "react";
import { Building2, Home, MapPin, CheckCircle2, XCircle, Search, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const UNIT_TYPE_LABELS: Record<string, string> = {
  apartment: "Apartamento",
  house: "Casa",
  local: "Local Comercial",
};

interface Unit {
  id: string;
  unit_number: string;
  unit_type: string;
  aliquot_percentage: number;
  floor_number: number | null;
  status: string;
  current_debt: number;
}

export function UnitsGrid({ units }: { units: Unit[] }) {
  const [query, setQuery] = useState("");

  const filtered = units.filter((unit) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    const number = unit.unit_number.toLowerCase();
    const type = (UNIT_TYPE_LABELS[unit.unit_type] ?? unit.unit_type).toLowerCase();
    const floor = unit.floor_number?.toString() ?? "";
    return number.includes(q) || type.includes(q) || floor.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          id="units-search"
          placeholder="Buscar por número, tipo o piso…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-9 h-10 rounded-xl bg-card border-border"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((unit) => (
            <div
              key={unit.id}
              className="group bg-card rounded-2xl border border-border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-border bg-gradient-to-br from-card to-accent/20">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-background border shadow-sm flex items-center justify-center">
                      <Home className="h-5 w-5 text-foreground/80" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Unidad {unit.unit_number}</h3>
                      <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Piso {unit.floor_number ?? "N/A"} • {UNIT_TYPE_LABELS[unit.unit_type] ?? unit.unit_type}
                      </p>
                    </div>
                  </div>
                  {unit.status === "active" ? (
                    <span className="flex items-center gap-1 text-xs font-medium bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Activo
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium bg-red-500/10 text-red-600 px-2.5 py-1 rounded-full">
                      <XCircle className="h-3.5 w-3.5" />
                      Inactivo
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Alícuota</p>
                    <p className="font-semibold text-lg">{unit.aliquot_percentage}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Deuda Actual</p>
                    <p className={`font-semibold text-lg ${unit.current_debt > 0 ? "text-red-500" : "text-emerald-500"}`}>
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(unit.current_debt)}
                    </p>
                  </div>
                </div>
                <div className="mt-auto flex justify-end gap-2">
                  <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 hover:text-primary transition-colors">
                    <Link href={`/dashboard/units/${unit.id}`}>Ver Detalles</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-card rounded-2xl border border-dashed border-border">
          <div className="h-20 w-20 rounded-full bg-accent flex items-center justify-center mb-6">
            {query ? <Search className="h-10 w-10 text-muted-foreground" /> : <Building2 className="h-10 w-10 text-muted-foreground" />}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {query ? "Sin resultados" : "No hay unidades registradas"}
          </h2>
          <p className="text-muted-foreground max-w-md mb-8">
            {query
              ? `No se encontró ninguna unidad que coincida con "${query}".`
              : "Comienza a gestionar tu condominio agregando la primera unidad."}
          </p>
          {query && (
            <button onClick={() => setQuery("")} className="text-sm text-primary hover:underline">
              Limpiar búsqueda
            </button>
          )}
        </div>
      )}
    </div>
  );
}
