"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createUnit(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const unit_number = formData.get("unit_number") as string
  const unit_type = formData.get("unit_type") as string
  const floor_number_str = formData.get("floor_number") as string
  const status = formData.get("status") as string

  if (!unit_number) {
    return { error: "Por favor, completa los campos requeridos correctamente." }
  }

  // aliquot_percentage is set automatically by the DB trigger.
  // We insert 1 as a placeholder; the trigger will immediately recalculate.
  const newUnit: any = {
    unit_number,
    unit_type: unit_type || "apartment",
    aliquot_percentage: 1, // Placeholder — trigger will overwrite this instantly
    status: status || "active",
  }

  if (floor_number_str) {
    newUnit.floor_number = parseInt(floor_number_str, 10)
  }

  const { error } = await (supabase.from("units") as any).insert(newUnit)

  if (error) {
    console.error("Error creating unit:", error)
    if (error.code === '23505') {
      return { error: "El número de unidad ya existe." }
    }
    return { error: "Ocurrió un error al crear la unidad." }
  }

  revalidatePath("/dashboard/units")
  redirect("/dashboard/units")
}

export async function updateUnit(id: string, prevState: any, formData: FormData) {
  const supabase = await createClient()

  // Verify Admin Role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "No autorizado." };
  }
  const { data: profile } = await (supabase
    .from("profiles") as any)
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "No tienes permisos para cambiar unidades." };
  }

  const unit_number = formData.get("unit_number") as string
  const unit_type = formData.get("unit_type") as string
  const floor_number_str = formData.get("floor_number") as string
  const status = formData.get("status") as string

  if (!unit_number) {
    return { error: "Por favor, completa los campos requeridos correctamente." }
  }

  // aliquot_percentage is NOT updated here — the trigger handles it automatically.
  const updatedUnit: any = {
    unit_number,
    unit_type: unit_type || "apartment",
    status: status || "active",
  }

  if (floor_number_str) {
    updatedUnit.floor_number = parseInt(floor_number_str, 10)
  } else {
    updatedUnit.floor_number = null
  }

  const { error } = await (supabase.from("units") as any)
    .update(updatedUnit)
    .eq("id", id)

  if (error) {
    console.error("Error updating unit:", error)
    if (error.code === '23505') {
      return { error: "El número de unidad ya existe." }
    }
    return { error: "Ocurrió un error al actualizar la unidad." }
  }

  revalidatePath("/dashboard/units")
  revalidatePath(`/dashboard/units/${id}`)
  return { success: true, message: "Unidad actualizada con éxito." }
}
