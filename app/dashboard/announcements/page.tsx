import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Megaphone, Plus, Pin, Clock, AlertCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { deleteAnnouncement } from "@/app/actions/announcements";

export const metadata = {
  title: "Anuncios | GestCom",
  description: "Tablón de anuncios del condominio",
};

export default async function AnnouncementsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: callerProfile } = await (supabase.from("profiles") as any)
    .select("role").eq("id", user.id).single();
  const isAdmin = callerProfile?.role === "admin";

  const { data, error } = await supabase
    .from("announcements")
    .select(`
      *,
      profiles ( full_name )
    `)
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false });

  const announcements = data as any[];

  if (error) {
    console.error("Error fetching announcements:", error);
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'low': default: return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': default: return 'Baja';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Megaphone className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Anuncios y Comunicados</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Mantén informada a la comunidad sobre novedades e incidencias
            </p>
          </div>
        </div>
        {isAdmin && (
          <Button asChild className="shrink-0 h-11 px-6 rounded-xl shadow-md hover:shadow-lg transition-all">
            <Link href="/dashboard/announcements/new">
              <Plus className="h-5 w-5 mr-2" />
              Publicar Anuncio
            </Link>
          </Button>
        )}
      </div>

      {/* Announcements Feed */}
      <div className="max-w-4xl space-y-6">
        {announcements && announcements.length > 0 ? (
          announcements.map((announcement: any) => (
            <div 
              key={announcement.id} 
              className={`relative bg-card rounded-2xl border shadow-sm p-6 overflow-hidden ${
                announcement.is_pinned ? 'border-purple-500/40 shadow-purple-500/10' : 'border-border'
              }`}
            >
              {announcement.is_pinned && (
                <div className="absolute top-0 right-0 bg-purple-500 text-white px-4 py-1 rounded-bl-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                  <Pin className="h-3 w-3" />
                  Fijado
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-bold">{announcement.title}</h2>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(announcement.priority)}`}>
                    {getPriorityLabel(announcement.priority)}
                  </span>
                </div>
              </div>
              
              <div className="prose prose-sm dark:prose-invert max-w-none mb-6 text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {announcement.content}
              </div>
              
              <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center font-bold text-[10px] text-primary">
                      {announcement.profiles?.full_name?.charAt(0) || 'A'}
                    </div>
                    <span>{announcement.profiles?.full_name || 'Admin'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{new Date(announcement.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Admin Only Actions - Para este MVP, asumimos que estamos como admin si vemos el botón */}
                {isAdmin && (
                  <form action={async () => {
                    "use server"
                    await deleteAnnouncement(announcement.id)
                  }}>
                    <Button type="submit" variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-card rounded-2xl border border-dashed border-border">
            <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center mb-4">
              <Megaphone className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No hay anuncios publicados</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              El tablón de anuncios está vacío. Publica el primer comunicado para informar a la comunidad.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
