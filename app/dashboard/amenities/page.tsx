import { createClient } from "@/lib/supabase/server";
import { getAmenities } from "@/app/actions/amenities";
import { AmenitiesManager } from "./AmenitiesManager";

export const metadata = {
  title: "Áreas Comunes | GestCom",
  description: "Gestión de amenities y áreas comunes del condominio",
};

export default async function AmenitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Obtener rol del usuario
  const { data: profile } = await (supabase
    .from("profiles") as any)
    .select("role")
    .eq("id", user.id)
    .single();
  const isAdmin = profile?.role === "admin";

  // Cargar amenities
  const amenities = await getAmenities();

  return (
    <div className="p-6">
      <AmenitiesManager initialAmenities={amenities || []} isAdmin={isAdmin} />
    </div>
  );
}
