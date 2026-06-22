"use client"

import { useActionState, useState } from "react"
import { login, register, resetPassword, loginWithGoogle } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { Building2, LogIn, UserPlus, Eye, EyeOff } from "lucide-react"

type View = "login" | "register" | "forgot_password"

export default function LoginPage() {
  const [view, setView] = useState<View>("login")

  // Password visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loginState, loginAction, isLoginPending] = useActionState(login, null)
  const [registerState, registerAction, isRegisterPending] = useActionState(register, null)
  const [resetState, resetAction, isResetPending] = useActionState(resetPassword, null)

  const subtitles: Record<View, string> = {
    login: "Ingresa al portal de tu condominio",
    register: "Crea tu cuenta de residente",
    forgot_password: "Ingresa tu correo y te enviaremos las instrucciones",
  }

  return (
    <div className="animate-slide-up w-full rounded-2xl glass p-8 shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col items-center space-y-2 mb-8">
        <div className="mb-4 flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 shadow-sm border border-primary/20">
          <Building2 className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">GestCom</h1>
        <p className="text-sm text-muted-foreground text-center">
          {subtitles[view]}
        </p>
      </div>

      {/* LOGIN FORM */}
      {view === "login" && (
        <form action={loginAction} className="space-y-6 animate-fade-in">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground/80 pl-1">
                Correo Electrónico
              </label>
              <Input
                id="login-email"
                name="email"
                type="email"
                placeholder="tu@correo.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <label className="text-sm font-medium text-foreground/80">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setView("forgot_password")}
                  className="text-xs text-primary hover:underline focus:outline-none cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative flex items-center">
                <Input
                  id="login-password"
                  name="password"
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="pr-10 w-full"
                />
                <button
                  type="button"
                  className="absolute right-3 flex items-center text-muted-foreground hover:text-foreground z-10 cursor-pointer p-1"
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                  aria-label={showLoginPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {loginState?.error && (
            <div className="text-sm text-red-500 font-medium text-center bg-red-500/10 py-2 rounded-lg">
              {loginState.error}
            </div>
          )}

          <Button className="w-full h-12 text-base" type="submit" disabled={isLoginPending}>
            {isLoginPending ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Ingresando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Ingresar a mi cuenta
              </span>
            )}
          </Button>
        </form>
      )}

      {/* REGISTER FORM */}
      {view === "register" && (
        <form action={registerAction} className="space-y-6 animate-fade-in">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground/80 pl-1">
                Nombre Completo
              </label>
              <Input
                id="register-name"
                name="full_name"
                type="text"
                placeholder="Ej. Juan Pérez"
                required
                autoComplete="name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground/80 pl-1">
                Correo Electrónico
              </label>
              <Input
                id="register-email"
                name="email"
                type="email"
                placeholder="tu@correo.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground/80 pl-1">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <Input
                  id="register-password"
                  name="password"
                  type={showRegisterPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="pr-10 w-full"
                />
                <button
                  type="button"
                  className="absolute right-3 flex items-center text-muted-foreground hover:text-foreground z-10 cursor-pointer p-1"
                  onClick={() => setShowRegisterPassword((prev) => !prev)}
                  aria-label={showRegisterPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showRegisterPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground/80 pl-1">
                Confirmar Contraseña
              </label>
              <div className="relative flex items-center">
                <Input
                  id="register-confirm-password"
                  name="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="pr-10 w-full"
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

          {registerState?.error && (
            <div className="text-sm text-red-500 font-medium text-center bg-red-500/10 py-2 rounded-lg">
              {registerState.error}
            </div>
          )}

          <Button className="w-full h-12 text-base" type="submit" disabled={isRegisterPending}>
            {isRegisterPending ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Registrando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Crear cuenta
              </span>
            )}
          </Button>
        </form>
      )}

      {/* FORGOT PASSWORD FORM */}
      {view === "forgot_password" && (
        <form action={resetAction} className="space-y-6 animate-fade-in">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground/80 pl-1">
                Correo Electrónico
              </label>
              <Input
                id="reset-email"
                name="email"
                type="email"
                placeholder="tu@correo.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {resetState?.error && (
            <div className="text-sm text-red-500 font-medium text-center bg-red-500/10 py-2 rounded-lg">
              {resetState.error}
            </div>
          )}

          {resetState?.success && (
            <div className="text-sm text-green-600 font-medium text-center bg-green-500/10 py-2 rounded-lg">
              {resetState.success}
            </div>
          )}

          <Button className="w-full h-12 text-base" type="submit" disabled={isResetPending}>
            {isResetPending ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Enviando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 flex items-center justify-center">✉️</span>
                Enviar instrucciones
              </span>
            )}
          </Button>

          <button
            type="button"
            onClick={() => setView("login")}
            className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-2 cursor-pointer"
          >
            <span className="h-4 w-4 flex items-center justify-center">←</span>
            Volver a iniciar sesión
          </button>
        </form>
      )}

      {/* GOOGLE OAUTH - Solo visible en login y registro */}
      {view !== "forgot_password" && (
        <div className="mt-6 space-y-4 animate-fade-in">
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">o continúa con</span>
            <div className="flex-1 h-px bg-border/60" />
          </div>
          <form action={async () => { await loginWithGoogle() }}>
            <button
              id="google-login-btn"
              type="submit"
              className="w-full flex items-center justify-center gap-3 h-12 px-4 rounded-lg border border-border/60 bg-background/50 hover:bg-muted/60 transition-all duration-200 text-sm font-medium text-foreground cursor-pointer group"
            >
              {/* Ícono oficial de Google */}
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continuar con Google</span>
            </button>
          </form>
        </div>
      )}

      {/* FOOTER LINKS */}
      {view !== "forgot_password" && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          {view === "login" ? (
            <>
              ¿No tienes una cuenta?{" "}
              <button
                type="button"
                onClick={() => setView("register")}
                className="font-medium text-primary hover:underline focus:outline-none cursor-pointer"
              >
                Regístrate aquí
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes una cuenta?{" "}
              <button
                type="button"
                onClick={() => setView("login")}
                className="font-medium text-primary hover:underline focus:outline-none cursor-pointer"
              >
                Inicia sesión
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
