// app/actions/reservations.ts
"use server";
import { createClient } from "@/lib/supabase/server";

/** Obtener todas las reservas con datos relacionados */
export async function getReservations() {
  const supabase = await createClient();
  const { data, error } = await (supabase.from("reservations") as any)
    .select(`
      *,
      amenities (name, image_url),
      units (unit_number),
      profiles (full_name)
    `)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

/** Crear una reserva (solo residentes) */
export async function createReservation(reservation: {
  amenity_id: string;
  unit_id: string;
  reservation_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data, error } = await (supabase.from("reservations") as any)
    .insert({ ...reservation, profile_id: user.id, status: "pending" })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/** Cambiar el estado de una reserva (admin o propietario) */
export async function updateReservationStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await (supabase.from("reservations") as any)
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
