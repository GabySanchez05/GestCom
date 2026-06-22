"use client"

import { useActionState, useState } from "react";
import { User, Building, ShieldCheck, KeyRound, Save, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfile, updatePassword, updateCondoSettings } from "@/app/actions/settings";

interface SettingsTabsProps {
  profile: any;
  email?: string;
  condoSettings: any;
  isAdmin: boolean;
  units: any[];
}

export function SettingsTabs({ profile, email, condoSettings, isAdmin, units = [] }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "condo">("profile");

  const [profileState, profileAction, isProfilePending] = useActionState(updateProfile, null);
  const [pwdState, pwdAction, isPwdPending] = useActionState(updatePassword, null);
  const [condoState, condoAction, isCondoPending] = useActionState(updateCondoSettings, null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Navigation Menu */}
      <div className="lg:col-span-1 space-y-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
            activeTab === "profile"
              ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          <User className="h-5 w-5" />
          Mi Perfil
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab("condo")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
              activeTab === "condo"
                ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <Building className="h-5 w-5" />
            Ajustes Condominio
          </button>
        )}
      </div>

      {/* Tabs Content */}
      <div className="lg:col-span-3 space-y-8">
        {activeTab === "profile" && (
          <div className="space-y-8">
            {/* PROFILE FORM */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Detalles de la Cuenta</h2>
              </div>

              <form action={profileAction} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground pl-1">
                      Nombre Completo
                    </label>
                    <Input
                      name="full_name"
                      defaultValue={profile?.full_name || ""}
                      placeholder="Ej. Juan Pérez"
                      className="bg-background rounded-xl border-border h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground pl-1">
                      Correo Electrónico (Solo Lectura)
                    </label>
                    <Input
                      defaultValue={email || ""}
                      className="bg-muted/50 rounded-xl border-border h-11 text-muted-foreground cursor-not-allowed"
                      disabled
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground pl-1">
                      Mi Departamento / Unidad
                    </label>
                    <select
                      name="unit_id"
                      defaultValue={profile?.unit_id || "none"}
                      className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="none">Ninguno (Sin asignar)</option>
                      {units && units.map((u: any) => (
                        <option key={u.id} value={u.id}>
                          Unidad {u.unit_number} {u.floor_number !== null ? `(Piso ${u.floor_number})` : "(PB)"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {profileState?.error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                    {profileState.error}
                  </div>
                )}

                {profileState?.success && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium">
                    {profileState.message}
                  </div>
                )}

                <div className="flex justify-end pt-2 border-t border-border">
                  <Button type="submit" disabled={isProfilePending} className="min-w-[140px] rounded-xl h-11 shadow-md hover:shadow-lg transition-all font-semibold">
                    {isProfilePending ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </form>
            </div>

            {/* PASSWORD SECURITY FORM */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <KeyRound className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Seguridad y Contraseña</h2>
              </div>

              <form action={pwdAction} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground pl-1">
                      Nueva Contraseña
                    </label>
                    <Input
                      name="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      className="bg-background rounded-xl border-border h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground pl-1">
                      Confirmar Contraseña
                    </label>
                    <Input
                      name="confirm_password"
                      type="password"
                      placeholder="Repite tu contraseña"
                      className="bg-background rounded-xl border-border h-11"
                      required
                    />
                  </div>
                </div>

                {pwdState?.error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                    {pwdState.error}
                  </div>
                )}

                {pwdState?.success && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium">
                    {pwdState.message}
                  </div>
                )}

                <div className="flex justify-end pt-2 border-t border-border">
                  <Button type="submit" disabled={isPwdPending} className="min-w-[140px] rounded-xl h-11 shadow-md hover:shadow-lg transition-all font-semibold">
                    {isPwdPending ? "Actualizando..." : "Cambiar Contraseña"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "condo" && isAdmin && (
          <div className="space-y-8">
            {/* CONDOMINIUM SETTINGS FORM */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <Building className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Datos Operativos de la Residencia</h2>
              </div>

              {!condoSettings ? (
                <div className="p-6 text-center border border-dashed border-border rounded-xl space-y-3">
                  <HelpCircle className="h-10 w-10 text-amber-500 mx-auto animate-pulse" />
                  <p className="font-semibold text-amber-500 text-sm">Falta la tabla de Base de Datos</p>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Asegúrate de ejecutar la migración SQL recomendada en el panel de Supabase para poder configurar los datos del condominio.
                  </p>
                </div>
              ) : (
                <form action={condoAction} className="space-y-6">
                  {/* Basic Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground pl-1">
                        Nombre del Condominio
                      </label>
                      <Input
                        name="name"
                        defaultValue={condoSettings.name || ""}
                        className="bg-background rounded-xl border-border h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground pl-1">
                        Identificación Fiscal (RIF / NIT / RUT)
                      </label>
                      <Input
                        name="tax_id"
                        defaultValue={condoSettings.tax_id || ""}
                        className="bg-background rounded-xl border-border h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground pl-1">
                        Teléfono Administrativo
                      </label>
                      <Input
                        name="phone"
                        defaultValue={condoSettings.phone || ""}
                        className="bg-background rounded-xl border-border h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground pl-1">
                        Dirección Física
                      </label>
                      <Input
                        name="address"
                        defaultValue={condoSettings.address || ""}
                        className="bg-background rounded-xl border-border h-11"
                      />
                    </div>
                  </div>

                  {/* Bank Account Details */}
                  <div className="border-t border-border pt-6 space-y-4">
                    <h3 className="font-semibold text-primary flex items-center gap-2 text-sm pl-1 uppercase tracking-wider">
                      Datos de Cuentas para Recaudación
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-1">
                      Los datos configurados aquí se mostrarán automáticamente en el módulo de "Reportar Pago" de los residentes para facilitarles la transferencia.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground pl-1">
                          Banco Receptor
                        </label>
                        <Input
                          name="bank_name"
                          defaultValue={condoSettings.bank_name || ""}
                          placeholder="Ej. Banco de Pruebas"
                          className="bg-background rounded-xl border-border h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground pl-1">
                          Titular de la Cuenta
                        </label>
                        <Input
                          name="bank_account_holder"
                          defaultValue={condoSettings.bank_account_holder || ""}
                          placeholder="Ej. Junta de Condominio GestCom"
                          className="bg-background rounded-xl border-border h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground pl-1">
                          Número de Cuenta Bancaria
                        </label>
                        <Input
                          name="bank_account_number"
                          defaultValue={condoSettings.bank_account_number || ""}
                          placeholder="Ej. 0102-0000-00-0000000000"
                          className="bg-background rounded-xl border-border h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground pl-1">
                          Correo Electrónico para Soporte
                        </label>
                        <Input
                          name="bank_account_email"
                          defaultValue={condoSettings.bank_account_email || ""}
                          placeholder="Ej. pagos@mi-edificio.com"
                          className="bg-background rounded-xl border-border h-11"
                        />
                      </div>
                    </div>
                  </div>

                  {condoState?.error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                      {condoState.error}
                    </div>
                  )}

                  {condoState?.success && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium">
                      {condoState.message}
                    </div>
                  )}

                  <div className="flex justify-end pt-2 border-t border-border">
                    <Button type="submit" disabled={isCondoPending} className="min-w-[140px] rounded-xl h-11 shadow-md hover:shadow-lg transition-all font-semibold flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {isCondoPending ? "Guardando..." : "Guardar Ajustes"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
