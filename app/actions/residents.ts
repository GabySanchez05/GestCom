"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/** Verify the caller is admin, throw if not */
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado.")
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("role")
    .eq("id", user.id)
    .single()
  if (profile?.role !== "admin") throw new Error("Acceso denegado.")
  return supabase
}

/** Update a resident's profile (name + unit assignment) */
export async function updateResident(formData: FormData) {
  try {
    const supabase = await requireAdmin()

    const resident_id = formData.get("resident_id") as string
    const full_name   = formData.get("full_name")   as string
    const unit_id     = formData.get("unit_id")     as string

    if (!resident_id || !full_name) {
      return
    }

    const update: any = { full_name }
    update.unit_id = unit_id && unit_id !== "none" ? unit_id : null

    const { error } = await (supabase.from("profiles") as any)
      .update(update)
      .eq("id", resident_id)

    if (error) {
      console.error("updateResident error:", error)
      return
    }

    revalidatePath("/dashboard/residents")
  } catch (e: any) {
    console.error("updateResident exception:", e)
  }
}
