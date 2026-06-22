import Link from "next/link";
import { Building2, Shield, CreditCard, BellRing, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "GestCom | Gestión Inteligente de Condominios",
  description: "Plataforma de transparencia financiera y comunicación para condominios modernos.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Decorative Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              GestCom
            </span>
          </div>
          <Button asChild variant="outline" className="border-primary/20 hover:bg-primary/10 hover:text-primary transition-all">
            <Link href="/dashboard">
              Acceder
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl w-full text-center space-y-8 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
            <Shield className="h-3.5 w-3.5" /> Portal Residencial Transparente
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            La administración de tu edificio, <br />
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              ahora es 100% digital
            </span>
          </h1>

          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Reporta tus transferencias con un click, consulta tus estados de cuenta al instante y mantente al día con los comunicados de tu comunidad.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button asChild size="lg" className="h-13 px-8 rounded-xl font-semibold shadow-lg hover:shadow-primary/25 transition-all text-base w-full sm:w-auto">
              <Link href="/dashboard" className="flex items-center gap-2">
                Ingresar al Sistema <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
            <div className="p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-colors shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg">Pagos Rápidos</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Registra tus transferencias y sube el comprobante de pago directo desde tu teléfono en segundos.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-colors shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg">Finanzas Claras</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Visualiza el balance de tu unidad y del condominio de manera 100% transparente y matemática.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-colors shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <BellRing className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg">Comunicados</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Tablón de anuncios comunitarios interactivo para enterarte de mantenimientos, reuniones y alertas.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 bg-card/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} GestCom. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <span className="hover:text-primary transition-colors cursor-pointer">Términos de Servicio</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Privacidad</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
