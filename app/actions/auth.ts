"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import nodemailer from "nodemailer"

export async function login(prevState: any, formData: FormData) {
  const email = (formData.get("email") as string)?.trim()
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Por favor, ingresa tu correo y contraseña." }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Login error:", error)
    return { error: error.message || "Credenciales inválidas." }
  }

  redirect("/dashboard")
}


export async function register(prevState: any, formData: FormData) {
  const email = (formData.get("email") as string)?.trim()
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirm_password") as string
  const fullName = (formData.get("full_name") as string)?.trim()

  if (!email || !password || !confirmPassword || !fullName) {
    return { error: "Por favor, completa todos los campos." }
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." }
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." }
  }

  // Bypass Rate Limits usando el Service Role Key (Admin API)
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirmar para saltar el envío de correos
    user_metadata: {
      full_name: fullName,
    },
  })

  if (createError) {
    console.error("Admin Signup error:", createError)
    return { error: createError.message || "Ocurrió un error al crear la cuenta en el sistema." }
  }

  // Ahora que la cuenta está creada y confirmada, iniciamos sesión para obtener la cookie
  const supabase = await createClient()
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (loginError) {
    console.error("Auto-login error:", loginError)
    return { error: "Cuenta creada con éxito, pero ocurrió un error al iniciar sesión automáticamente. Intenta iniciar sesión manualmente." }
  }

  // Auto-login o redirigir
  redirect("/dashboard")
}

export async function resetPassword(prevState: any, formData: FormData) {
  const email = (formData.get("email") as string)?.trim()

  if (!email) {
    return { error: "Por favor, ingresa tu correo electrónico." }
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Generate the recovery link via Admin API (bypasses Supabase email sending)
  const { data, error: generateError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/update-password`,
    }
  })

  if (generateError) {
    console.error("Generate link error:", generateError)
    // Para no revelar qué correos existen en la base de datos
    return { success: "Si el correo está registrado, recibirás un enlace de recuperación." }
  }

  const actionLink = data?.properties?.action_link

  if (!actionLink) {
    return { success: "Si el correo está registrado, recibirás un enlace de recuperación." }
  }

  // 2. Send the email using Nodemailer
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const mailOptions = {
      from: process.env.SMTP_FROM || '"GestCom" <noreply@gestcom.com>',
      to: email,
      subject: "Recuperación de Contraseña - GestCom",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 10px;">
          <h2 style="color: #333;">Recuperación de Contraseña</h2>
          <p style="color: #555; line-height: 1.5;">Hola,</p>
          <p style="color: #555; line-height: 1.5;">Hemos recibido una solicitud para restablecer tu contraseña en GestCom. Si no fuiste tú, puedes ignorar este correo.</p>
          <p style="color: #555; line-height: 1.5;">Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionLink}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Restablecer Contraseña</a>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
            Este enlace expirará en 24 horas.<br>
            GestCom - Sistema de Gestión de Condominios
          </p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    
  } catch (emailError: any) {
    console.error("Nodemailer error:", emailError)
    return { error: "Ocurrió un error de conexión al enviar el correo (Revisa tus credenciales SMTP en .env.local)." }
  }

  return { success: "Si el correo está registrado, recibirás un enlace de recuperación." }
}

export async function updatePassword(prevState: any, formData: FormData) {
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirm_password") as string

  if (!password || !confirmPassword) {
    return { error: "Por favor, completa todos los campos." }
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." }
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    console.error("Update password error:", error)
    return { error: error.message || "Ocurrió un error al actualizar la contraseña." }
  }

  redirect("/dashboard")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function loginWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback?next=/dashboard`,
    },
  })

  if (error) {
    console.error("Google OAuth error:", error)
    return { error: "No se pudo iniciar sesión con Google. Intenta de nuevo." }
  }

  if (data.url) {
    redirect(data.url)
  }
}
