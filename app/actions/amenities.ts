"use server";

import { createClient } from "@/lib/supabase/server";

// ------------------------------------------------------------------
// Amenities actions – only admins can create / update / delete (RLS enforces).
// ------------------------------------------------------------------
export async function getAmenities() {
  const supabase = await createClient();
  const { data, error } = await (supabase.from("amenities") as any).select("*");
  if (error) throw new Error(error.message);
  return data;
}

export type Amenity = {
  id?: string;
  name: string;
  description?: string;
  capacity: number;
  rules?: string;
  image_url?: string;
  status?: "available" | "maintenance" | "inactive";
};

export async function upsertAmenity(amenity: Amenity) {
  const supabase = await createClient();

  if (amenity.id) {
    // UPDATE: exclude id from the body to avoid constraint conflicts
    const { id, ...body } = amenity;
    const { data, error } = await (supabase.from("amenities") as any)
      .update(body)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  } else {
    // INSERT: use .select() so Supabase returns the new row with its real UUID
    const { data, error } = await (supabase.from("amenities") as any)
      .insert(amenity)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
}

export async function deleteAmenity(id: string) {
  const supabase = await createClient();
  const { error } = await (supabase.from("amenities") as any).delete().eq("id", id);
  if (error) throw new Error(error.message);
}
