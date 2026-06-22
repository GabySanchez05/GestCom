"use client";

import { useState } from "react";
import {
  Users, Building2, UserCheck, UserX, Pencil, Search, X, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateResident } from "@/app/actions/residents";

interface Unit {
  id: string;
  unit_number: string;
  floor_number: number | null;
}

interface Resident {
  id: string;
  full_name: string | null;
  role: string;
  unit_id: string | null;
  created_at: string;
  units: { unit_number: string; floor_number: number | null } | null;
}

interface ResidentsTableProps {
  residents: Resident[];
  units: Unit[];
}

export function ResidentsTable({ residents, units }: ResidentsTableProps) {
  const [query, setQuery] = useState("");

  const filtered = residents
    .filter((r) => r.role !== "admin")
    .filter((r) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase().trim();
      const name = r.full_name?.toLowerCase() ?? "";
      const unitNum = r.units?.unit_number?.toLowerCase() ?? "";
      return name.includes(q) || unitNum.includes(q);
    });

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Table header */}
      <div className="p-5 border-b border-border flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          Lista de Residentes
        </h2>

        {/* Search Input */}
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="resident-search"
            placeholder="Buscar residente…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-9 h-9 rounded-xl bg-background border-border text-sm"
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
      </div>

      {filtered.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left font-medium">Residente</th>
                <th className="px-6 py-4 text-left font-medium">Unidad Asignada</th>
                <th className="px-6 py-4 text-left font-medium">Registrado</th>
                <th className="px-6 py-4 text-left font-medium">Estado</th>
                <th className="px-6 py-4 text-right font-medium">Editar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((resident) => (
                <ResidentRow key={resident.id} resident={resident} units={units} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center mb-4">
            {query ? (
              <Search className="h-8 w-8 text-muted-foreground" />
            ) : (
              <Users className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-xl font-bold mb-2">
            {query ? "Sin resultados" : "Sin residentes registrados"}
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            {query
              ? `No se encontró ningún residente que coincida con "${query}".`
              : "Cuando los usuarios se registren, aparecerán aquí para que puedas gestionar sus perfiles."}
          </p>
          {query && (
            <button
              onClick={() => setQuery("")}
              className="mt-4 text-sm text-primary hover:underline cursor-pointer"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Inline editable row ─────────────────────────────────────────────────── */
function ResidentRow({ resident, units }: { resident: Resident; units: Unit[] }) {
  const assignedUnit = resident.units;
  const joinDate = new Date(resident.created_at).toLocaleDateString("es-ES", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <tr className="hover:bg-muted/30 transition-colors group">
      {/* Name */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary shrink-0">
            {resident.full_name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="font-semibold text-foreground leading-tight">
              {resident.full_name || <span className="text-muted-foreground italic">Sin nombre</span>}
            </p>
          </div>
        </div>
      </td>

      {/* Unit */}
      <td className="px-6 py-4">
        {assignedUnit ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <Building2 className="h-3.5 w-3.5" />
            Unidad {assignedUnit.unit_number}
            {assignedUnit.floor_number !== null ? ` · Piso ${assignedUnit.floor_number}` : " · PB"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
            <UserX className="h-3.5 w-3.5" />
            Sin asignar
          </span>
        )}
      </td>

      {/* Join date */}
      <td className="px-6 py-4 text-xs text-muted-foreground">{joinDate}</td>

      {/* Status badge */}
      <td className="px-6 py-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          <Check className="h-3.5 w-3.5" />
          Activo
        </span>
      </td>

      {/* Edit form */}
      <td className="px-6 py-4 text-right">
        <form action={updateResident} className="flex items-center justify-end gap-2 flex-wrap">
          <input type="hidden" name="resident_id" value={resident.id} />

          <Input
            name="full_name"
            defaultValue={resident.full_name || ""}
            placeholder="Nombre"
            className="h-8 rounded-lg text-xs w-36 bg-background border-border"
            required
          />

          <select
            name="unit_id"
            defaultValue={resident.unit_id || "none"}
            className="h-8 rounded-lg border border-border bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="none">Sin unidad</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                Unidad {u.unit_number}{u.floor_number !== null ? ` (P${u.floor_number})` : " (PB)"}
              </option>
            ))}
          </select>

          <Button
            type="submit"
            size="sm"
            className="h-8 px-3 rounded-lg text-xs font-semibold"
          >
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Guardar
          </Button>
        </form>
      </td>
    </tr>
  );
}
