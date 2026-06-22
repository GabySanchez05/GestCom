"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createAnnouncement(prevState: any, formData: FormData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "No estás autenticado." }
  }

  // Get user profile
  const { data } = await (supabase
    .from("profiles") as any)
    .select("id, role")
    .eq("id", user.id)
    .single()

  const profile = data as any;

  if (!profile || profile.role !== 'admin') {
    return { error: "No tienes permisos para crear anuncios." }
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const priority = formData.get("priority") as string
  const is_pinned = formData.get("is_pinned") === "on"
  
  if (!title || !content) {
    return { error: "Por favor, completa el título y el contenido." }
  }

  const newAnnouncement = {
    author_id: profile.id,
    title,
    content,
    priority: priority || "low",
    is_pinned,
  }

  const { error } = await supabase.from("announcements").insert(newAnnouncement as any)

  if (error) {
    console.error("Error creating announcement:", error)
    return { error: "Ocurrió un error al publicar el anuncio." }
  }

  revalidatePath("/dashboard/announcements")
  redirect("/dashboard/announcements")
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("announcements").delete().eq("id", id)

  if (error) {
    console.error("Error deleting announcement:", error)
    throw new Error("No se pudo eliminar el anuncio.")
  }

  revalidatePath("/dashboard/announcements")
}
