"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createPayment(prevState: any, formData: FormData) {
  const supabase = await createClient()

  // In a real app, we would get the current user's profile to extract unit_id and profile_id
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "No estás autenticado." }
  }

  // Get user profile
  const { data } = await (supabase
    .from("profiles") as any)
    .select("id, unit_id")
    .eq("id", user.id)
    .single()

  const profile = data as any;

  if (!profile || !profile.unit_id) {
    return { error: "Tu perfil no está asociado a ninguna unidad." }
  }

  const amount = parseFloat(formData.get("amount") as string)
  const payment_date = formData.get("payment_date") as string
  const reference_number = formData.get("reference_number") as string
  const period = formData.get("period") as string
  const notes = formData.get("notes") as string
  
  if (isNaN(amount) || !payment_date || !period) {
    return { error: "Por favor, completa los campos requeridos correctamente." }
  }

  let receipt_url = null;
  const receipt_file = formData.get("receipt_file") as File | null;

  if (receipt_file && receipt_file.size > 0) {
    if (receipt_file.size > 5 * 1024 * 1024) {
      return { error: "El archivo excede el tamaño máximo de 5MB." };
    }

    const fileExt = receipt_file.name.split('.').pop();
    const fileName = `${profile.id}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, receipt_file);

    if (uploadError) {
      console.error("Error uploading receipt:", uploadError);
      return { error: "Error al subir el comprobante. Por favor intenta de nuevo." };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);

    receipt_url = publicUrl;
  }

  const newPayment = {
    unit_id: profile.unit_id,
    profile_id: profile.id,
    amount,
    currency: "USD",
    status: "pending",
    payment_date,
    reference_number: reference_number || null,
    period,
    notes: notes || null,
    receipt_url: receipt_url,
  }

  const { error } = await supabase.from("payments").insert(newPayment as any)

  if (error) {
    console.error("Error creating payment:", error)
    return { error: "Ocurrió un error al registrar el pago." }
  }

  revalidatePath("/dashboard/payments")
  redirect("/dashboard/payments")
}

export async function updatePaymentStatus(paymentId: string, status: 'verified' | 'rejected') {
  const supabase = await createClient()

  const { error } = await supabase
    .from("payments")
    // @ts-ignore
    .update({ status })
    .eq("id", paymentId)

  if (error) {
    console.error("Error updating payment status:", error)
    throw new Error("No se pudo actualizar el estado del pago")
  }

  revalidatePath("/dashboard/payments")
}
