"use server"

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "No autorizado. Inicia sesión de nuevo." };
  }

  const fullName = formData.get("full_name") as string;
  const unitId = formData.get("unit_id") as string;

  if (!fullName || fullName.trim() === "") {
    return { error: "El nombre completo no puede estar vacío." };
  }

  const finalUnitId = (unitId && unitId !== "none" && unitId !== "") ? unitId : null;

  const { error } = await (supabase
    .from("profiles") as any)
    .update({
      full_name: fullName,
      unit_id: finalUnitId,
      updated_at: new Date().toISOString()
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    return { error: "No se pudo actualizar el perfil. Por favor intenta de nuevo." };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true, message: "Perfil actualizado con éxito." };
}

export async function updatePassword(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "No autorizado. Inicia sesión de nuevo." };
  }

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!password || password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." };
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    console.error("Error updating password:", error);
    return { error: error.message || "Fallo al cambiar la contraseña." };
  }

  return { success: true, message: "Contraseña actualizada de forma segura." };
}

export async function updateCondoSettings(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "No autorizado." };
  }

  // Verify Admin Role
  const { data: profile } = await (supabase
    .from("profiles") as any)
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "No tienes permisos para cambiar la configuración global." };
  }

  const name = formData.get("name") as string;
  const taxId = formData.get("tax_id") as string;
  const bankName = formData.get("bank_name") as string;
  const bankAccountNumber = formData.get("bank_account_number") as string;
  const bankAccountHolder = formData.get("bank_account_holder") as string;
  const bankAccountEmail = formData.get("bank_account_email") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;

  if (!name || name.trim() === "") {
    return { error: "El nombre del condominio es obligatorio." };
  }

  const { error } = await (supabase
    .from("condo_settings") as any)
    .update({
      name,
      tax_id: taxId,
      bank_name: bankName,
      bank_account_number: bankAccountNumber,
      bank_account_holder: bankAccountHolder,
      bank_account_email: bankAccountEmail,
      phone,
      address,
      updated_at: new Date().toISOString()
    })
    .eq("id", "singleton");

  if (error) {
    console.error("Error updating condo settings:", error);
    return { error: "No se pudieron actualizar los ajustes. Por favor verifica los permisos." };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/payments/new");
  return { success: true, message: "Ajustes del condominio actualizados con éxito." };
}
