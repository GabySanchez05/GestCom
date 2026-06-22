import { createClient } from "@/lib/supabase/server";
import { getReservations } from "@/app/actions/reservations";
import { getAmenities } from "@/app/actions/amenities";
import { AmenitiesClient } from "@/app/dashboard/amenities/AmenitiesClient";

export const metadata = {
  title: "Reservas | GestCom",
  description: "Gestión de reservas de áreas comunes",
};

export default async function ReservationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Obtener profile completo del usuario
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("*, units(*)")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const amenities = await getAmenities();
  const reservations = await getReservations();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reservas y Áreas Comunes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Reserva espacios comunes y gestiona las solicitudes
          </p>
        </div>
      </div>
      <AmenitiesClient
        initialAmenities={amenities || []}
        initialReservations={reservations || []}
        currentUser={profile}
        isAdmin={isAdmin}
        needsMigration={false}
      />
    </div>
  );
}
