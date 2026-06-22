import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Search, Building2, Users, Wallet, Calendar, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Resultados de Búsqueda | GestCom",
};

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const query = typeof (await searchParams).q === "string" ? (await searchParams).q : "";
  
  if (!query) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const searchPattern = `%${query}%`;

  // Search in amenities
  const { data: amenities } = await supabase
    .from("amenities")
    .select("*")
    .or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`)
    .limit(10);

  // Search in units
  const { data: units } = await supabase
    .from("units")
    .select("*")
    .ilike("unit_number", searchPattern)
    .limit(10);

  // Search in profiles (residents)
  const { data: residents } = await supabase
    .from("profiles")
    .select("*, units(unit_number)")
    .ilike("full_name", searchPattern)
    .limit(10);

  // Search in incidents
  const { data: incidents } = await supabase
    .from("incidents")
    .select("*, profiles(full_name)")
    .ilike("title", searchPattern)
    .limit(10);

  // Collect all results
  const hasResults = 
    (amenities && amenities.length > 0) || 
    (units && units.length > 0) || 
    (residents && residents.length > 0) || 
    (incidents && incidents.length > 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Search className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resultados de Búsqueda</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mostrando resultados para: <span className="font-semibold text-foreground">"{query}"</span>
          </p>
        </div>
      </div>

      {!hasResults ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-card rounded-2xl border border-dashed border-border">
          <div className="h-20 w-20 rounded-full bg-accent flex items-center justify-center mb-6">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Sin resultados</h2>
          <p className="text-muted-foreground max-w-md">
            No encontramos coincidencias para "{query}" en ninguna de nuestras secciones.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Amenities Results */}
          {amenities && amenities.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-500" />
                Áreas Comunes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {amenities.map(a => (
                  <Link href="/dashboard/amenities" key={a.id} className="block group">
                    <div className="bg-card p-4 rounded-xl border border-border group-hover:border-primary/50 group-hover:shadow-md transition-all">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{a.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">{a.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Units Results */}
          {units && units.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                Unidades
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {units.map(u => (
                  <Link href={`/dashboard/units/${u.id}`} key={u.id} className="block group">
                    <div className="bg-card p-4 rounded-xl border border-border group-hover:border-primary/50 group-hover:shadow-md transition-all flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">Unidad {u.unit_number}</h4>
                        <p className="text-sm text-muted-foreground">Piso {u.floor_number}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Residents Results */}
          {residents && residents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" />
                Residentes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {residents.map(r => (
                  <Link href="/dashboard/residents" key={r.id} className="block group">
                    <div className="bg-card p-4 rounded-xl border border-border group-hover:border-primary/50 group-hover:shadow-md transition-all">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{r.full_name || "Sin nombre"}</h4>
                      <p className="text-sm text-muted-foreground">Unidad: {(r as any).units?.unit_number || "No asignada"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Incidents Results */}
          {incidents && incidents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Incidencias
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {incidents.map(i => (
                  <Link href="/dashboard/incidents" key={i.id} className="block group">
                    <div className="bg-card p-4 rounded-xl border border-border group-hover:border-primary/50 group-hover:shadow-md transition-all">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{i.title}</h4>
                      <p className="text-sm text-muted-foreground">Reportado por: {(i as any).profiles?.full_name || "Usuario"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
