"use server"

import { createClient } from "@/lib/supabase/server"

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: "announcement" | "payment" | "incident" | "reservation"
  link: string
  createdAt: string
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await (supabase
    .from("profiles") as any)
    .select("role, unit_id")
    .eq("id", user.id)
    .single()

  if (!profile) return []

  const notifications: NotificationItem[] = []

  // If Admin
  if (profile.role === "admin") {
    // 1. Pending Payments
    const { data: pendingPayments } = await (supabase
      .from("payments") as any)
      .select("id, amount, created_at, units (unit_number)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5)

    if (pendingPayments) {
      pendingPayments.forEach((p: any) => {
        const unitNum = p.units?.unit_number ? `de Unidad ${p.units.unit_number}` : "";
        notifications.push({
          id: `pay-${p.id}`,
          title: "Pago por verificar",
          message: `Nuevo pago de $${p.amount} ${unitNum} requiere verificación.`,
          type: "payment",
          link: "/dashboard/payments",
          createdAt: p.created_at
        })
      })
    }

    // 2. Reported Incidents
    const { data: reportedIncidents } = await (supabase
      .from("incidents") as any)
      .select("id, title, created_at")
      .eq("status", "reported")
      .order("created_at", { ascending: false })
      .limit(5)

    if (reportedIncidents) {
      reportedIncidents.forEach((i: any) => {
        notifications.push({
          id: `inc-${i.id}`,
          title: "Incidencia reportada",
          message: `Nueva incidencia: "${i.title}"`,
          type: "incident",
          link: "/dashboard/incidents",
          createdAt: i.created_at
        })
      })
    }

    // 3. Pending Reservations
    const { data: pendingReservations } = await (supabase
      .from("reservations") as any)
      .select("id, reservation_date, created_at, amenities (name), units (unit_number)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5)

    if (pendingReservations) {
      pendingReservations.forEach((r: any) => {
        const amenityName = r.amenities?.name || "Instalación";
        const unitNum = r.units?.unit_number ? `Unidad ${r.units.unit_number}` : "Residente";
        notifications.push({
          id: `res-${r.id}`,
          title: "Reserva pendiente",
          message: `${unitNum} solicitó el ${amenityName} para el ${r.reservation_date}.`,
          type: "reservation",
          link: "/dashboard/amenities",
          createdAt: r.created_at
        })
      })
    }

  } else {
    // If Resident
    // 1. Announcements in last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const { data: recentAnnouncements } = await (supabase
      .from("announcements") as any)
      .select("id, title, created_at")
      .gte("created_at", oneWeekAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(5)

    if (recentAnnouncements) {
      recentAnnouncements.forEach((a: any) => {
        notifications.push({
          id: `ann-${a.id}`,
          title: "Anuncio publicado",
          message: `Se ha publicado un nuevo anuncio: "${a.title}"`,
          type: "announcement",
          link: "/dashboard/announcements",
          createdAt: a.created_at
        })
      })
    }

    // 2. User's payments in last 7 days or status changes
    const { data: userPayments } = await (supabase
      .from("payments") as any)
      .select("id, amount, status, updated_at, period")
      .eq("profile_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5)

    if (userPayments) {
      userPayments.forEach((p: any) => {
        // We only notify if verified or rejected (not pending)
        if (p.status !== "pending") {
          const statusText = p.status === "verified" ? "APROBADO" : "RECHAZADO";
          notifications.push({
            id: `pay-${p.id}-${p.status}`,
            title: `Pago ${statusText}`,
            message: `Tu pago de $${p.amount} para el período ${p.period} fue ${statusText.toLowerCase()}.`,
            type: "payment",
            link: "/dashboard/payments",
            createdAt: p.updated_at
          })
        }
      })
    }

    // 3. User's incidents status changes
    const { data: userIncidents } = await (supabase
      .from("incidents") as any)
      .select("id, title, status, updated_at")
      .eq("profile_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5)

    if (userIncidents) {
      userIncidents.forEach((i: any) => {
        if (i.status !== "reported") {
          const statusText = i.status === "in_progress" ? "en progreso" : "resuelto";
          notifications.push({
            id: `inc-${i.id}-${i.status}`,
            title: `Incidencia en estado: ${statusText.toUpperCase()}`,
            message: `Tu reporte "${i.title}" está ahora ${statusText}.`,
            type: "incident",
            link: "/dashboard/incidents",
            createdAt: i.updated_at
          })
        }
      })
    }

    // 4. User's reservations updates
    const { data: userReservations } = await (supabase
      .from("reservations") as any)
      .select("id, reservation_date, status, created_at, updated_at, amenities (name)")
      .eq("profile_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5)

    if (userReservations) {
      userReservations.forEach((r: any) => {
        if (r.status !== "pending") {
          const statusText = r.status === "approved" ? "APROBADA" : r.status === "rejected" ? "RECHAZADA" : "CANCELADA";
          const amenityName = r.amenities?.name || "Instalación";
          notifications.push({
            id: `res-${r.id}-${r.status}`,
            title: `Reserva ${statusText}`,
            message: `Tu reserva de ${amenityName} para el ${r.reservation_date} fue ${statusText.toLowerCase()}.`,
            type: "reservation",
            link: "/dashboard/amenities",
            createdAt: r.updated_at || r.created_at
          })
        }
      })
    }
  }

  // Sort combined notifications by createdAt descending
  return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
