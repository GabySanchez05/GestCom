"use server"

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createIncident(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No estás autenticado." };

  // Get profile to link unit_id
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("id, unit_id")
    .eq("id", user.id)
    .single();

  const title       = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const area        = (formData.get("area") as string)?.trim();
  const priority    = (formData.get("priority") as string) || "medium";
  const file        = formData.get("evidence") as File | null;

  if (!title || !description || !area) {
    return { error: "Título, descripción y área son obligatorios." };
  }

  // Upload evidence photo if provided
  let evidence_url: string | null = null;
  if (file && file.size > 0) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("tickets")
      .upload(path, file, { upsert: true });

    if (!uploadError && uploadData) {
      const { data: publicUrl } = supabase.storage
        .from("tickets")
        .getPublicUrl(uploadData.path);
      evidence_url = publicUrl.publicUrl;
    }
  }

  const { error } = await (supabase.from("incidents") as any).insert({
    title,
    description,
    area,
    priority,
    evidence_url,
    profile_id: user.id,
    unit_id: profile?.unit_id ?? null,
    status: "reported",
  });

  if (error) {
    console.error("Error creating incident:", error);
    return { error: "No se pudo guardar el reporte. Inténtalo de nuevo." };
  }

  revalidatePath("/dashboard/incidents");
  return { success: true, message: "Reporte enviado exitosamente. La administración lo revisará pronto." };
}

export async function updateIncidentStatus(
  id: string,
  status: "reported" | "in_progress" | "resolved",
  adminNotes?: string
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado.");

  const { data: profile } = await (supabase.from("profiles") as any)
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Solo los administradores pueden cambiar el estado.");

  const patch: Record<string, any> = { status };
  if (adminNotes !== undefined) patch.admin_notes = adminNotes;

  const { error } = await (supabase.from("incidents") as any)
    .update(patch)
    .eq("id", id);

  if (error) {
    console.error("Error updating incident:", error);
    throw new Error("No se pudo actualizar el estado.");
  }

  revalidatePath("/dashboard/incidents");
}
