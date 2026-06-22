"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createExpense(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const total_amount = parseFloat(formData.get("total_amount") as string)
  const category = formData.get("category") as string
  const expense_date = formData.get("expense_date") as string
  const period = formData.get("period") as string
  
  if (!title || isNaN(total_amount) || !expense_date || !period) {
    return { error: "Por favor, completa los campos requeridos correctamente." }
  }

  const newExpense = {
    title,
    description: description || null,
    total_amount,
    currency: "USD",
    category: category || "maintenance",
    expense_date,
    period,
    is_distributed: false,
  }

  const { error } = await supabase.from("common_expenses").insert(newExpense as any)

  if (error) {
    console.error("Error creating expense:", error)
    return { error: "Ocurrió un error al registrar el gasto común." }
  }

  revalidatePath("/dashboard/expenses")
  redirect("/dashboard/expenses")
}

export async function distributeExpense(expenseId: string) {
  const supabase = await createClient()

  // Call the Postgres function `distribute_expense`
  const { error } = await supabase.rpc('distribute_expense', { p_expense_id: expenseId } as any)

  if (error) {
    console.error("Error distributing expense:", error)
    throw new Error("No se pudo distribuir el gasto. Asegúrate de que las alícuotas de las unidades activas sumen 100%.")
  }

  revalidatePath("/dashboard/expenses")
}
