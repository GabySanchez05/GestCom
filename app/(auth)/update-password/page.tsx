"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, Eye, EyeOff, Save, ShieldAlert } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  // Inicializamos el cliente de Supabase solo en el cliente para evitar problemas de SSR
  const [supabase, setSupabase] = useState<any>(null)

  // Información de diagnóstico
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [diagnostics, setDiagnostics] = useState<{
    url: string
    hasHash: boolean
    hasCode: boolean
    sessionUser: string | null
    authEvent: string
  }>({
    url: "",
    hasHash: false,
    hasCode: false,
    sessionUser: null,
    authEvent: "Ninguno",
  })

  // Instanciar supabase solo en el cliente (navegador)
  useEffect(() => {
    setSupabase(createClient())
  }, [])

  useEffect(() => {
    if (!supabase || typeof window === "undefined") return

    const handleSessionAndParams = async () => {
      const currentUrl = window.location.href
      const hasHash = window.location.hash.includes("access_token")
      
      const searchParams = new URLSearchParams(window.location.search)
      const code = searchParams.get("code")
      const hasCode = !!code

      setDiagnostics(prev => ({
        ...prev,
        url: currentUrl,
        hasHash,
        hasCode,
      }))

      try {
        // Caso 1: Si viene un código PKCE (?code=...), lo intercambiamos
        if (code) {
          console.log("Código detectado en URL, intercambiando por sesión...")
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.error("Error al intercambiar código:", exchangeError)
            setError(`Error de autenticación: ${exchangeError.message}. Intenta solicitar otro correo.`)
          } else {
            console.log("Sesión establecida mediante código con éxito")
            setDiagnostics(prev => ({
              ...prev,
              sessionUser: data.session?.user?.email || null,
            }))
          }
        } 
        // Caso 2: Si viene en el hash (#access_token=...), lo establecemos manualmente
        else if (hasHash) {
          console.log("Detectado hash de sesión, estableciendo sesión manualmente...")
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const accessToken = hashParams.get("access_token")
          const refreshToken = hashParams.get("refresh_token")

          if (accessToken && refreshToken) {
            const { data, error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })

            if (setSessionError) {
              console.error("Error al establecer la sesión manual:", setSessionError)
              setError(`Error al validar sesión: ${setSessionError.message}`)
            } else {
              console.log("Sesión establecida manualmente con éxito")
              setDiagnostics(prev => ({
                ...prev,
                sessionUser: data.session?.user?.email || null,
              }))
            }
          }
        } 
        // Caso 3: No hay parámetros en la URL, verificamos sesión existente
        else {
          const { data: { session } } = await supabase.auth.getSession()
          setDiagnostics(prev => ({
            ...prev,
            sessionUser: session?.user?.email || null,
          }))
        }
      } catch (err: any) {
        console.error("Error durante validación de parámetros de sesión:", err)
        setError("Ocurrió un error al procesar el enlace de recuperación.")
      } finally {
        setIsCheckingSession(false)
      }
    }

    handleSessionAndParams()

    // Escuchamos los cambios del estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event detectado:", event)
      setDiagnostics(prev => ({
        ...prev,
        authEvent: event,
        sessionUser: session?.user?.email || null,
      }))
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setError(null)
    setIsPending(true)

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      setIsPending(false)
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      setIsPending(false)
      return
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        console.error("Update password error:", updateError)
        setError(updateError.message || "Ocurrió un error al actualizar la contraseña.")
        setIsPending(false)
        return
      }

      // Redirigir al panel principal de la aplicación tras actualizar
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Unexpected error:", err)
      setError("Ocurrió un error inesperado al actualizar la contraseña.")
      setIsPending(false)
    }
  }

  const isFormDisabled = !supabase || isCheckingSession

  return (
    <div className="animate-slide-up w-full rounded-2xl glass p-8 shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col items-center space-y-2 mb-8">
        <div className="mb-4 flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 shadow-sm border border-primary/20">
          <Building2 className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Crear nueva contraseña</h1>
        <p className="text-sm text-muted-foreground text-center">
          Ingresa tu nueva contraseña para acceder a GestCom
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground/80 pl-1">
              Nueva Contraseña
            </label>
            <div className="relative flex items-center">
              <Input
                id="update-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="pr-10 w-full"
                disabled={isFormDisabled}
              />
              <button
                type="button"
                className="absolute right-3 flex items-center text-muted-foreground hover:text-foreground z-10 cursor-pointer p-1"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground/80 pl-1">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative flex items-center">
              <Input
                id="update-confirm-password"
                name="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repite tu contraseña"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="pr-10 w-full"
                disabled={isFormDisabled}
              />
              <button
                type="button"
                className="absolute right-3 flex items-center text-muted-foreground hover:text-foreground z-10 cursor-pointer p-1"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-500 font-medium text-center bg-red-500/10 py-2 rounded-lg">
            {error}
          </div>
        )}

        <Button className="w-full h-12 text-base" type="submit" disabled={isPending || isFormDisabled}>
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Actualizando...
            </span>
          ) : isFormDisabled ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Verificando sesión...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Guardar y continuar
            </span>
          )}
        </Button>
      </form>

      {/* Panel de Diagnóstico */}
      <div className="mt-8 border-t border-muted/30 pt-4">
        <button
          type="button"
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer w-full text-left justify-center"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          {showDiagnostics ? "Ocultar Diagnóstico de Autenticación" : "Mostrar Diagnóstico de Autenticación"}
        </button>
        
        {showDiagnostics && (
          <div className="mt-3 p-3 bg-muted/40 rounded-lg text-[11px] font-mono text-muted-foreground space-y-2 border border-muted/20 animate-fade-in">
            <div>
              <span className="text-foreground font-semibold">URL del navegador:</span>{" "}
              <span className="break-all">{diagnostics.url}</span>
            </div>
            <div>
              <span className="text-foreground font-semibold">¿Tiene token hash (#access_token)?</span>{" "}
              {diagnostics.hasHash ? "✅ Sí" : "❌ No"}
            </div>
            <div>
              <span className="text-foreground font-semibold">¿Tiene parámetro code (?code)?</span>{" "}
              {diagnostics.hasCode ? "✅ Sí" : "❌ No"}
            </div>
            <div>
              <span className="text-foreground font-semibold">Usuario de Sesión Activa:</span>{" "}
              {diagnostics.sessionUser ? (
                <span className="text-emerald-500 font-bold">{diagnostics.sessionUser}</span>
              ) : (
                <span className="text-rose-500">❌ Ninguno (No autenticado)</span>
              )}
            </div>
            <div>
              <span className="text-foreground font-semibold">Último Evento Auth:</span>{" "}
              <span className="text-amber-500 font-bold">{diagnostics.authEvent}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
