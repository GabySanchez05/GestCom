import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";
import { UserNav } from "./UserNav";
import { NotificationBell } from "./NotificationBell";
import { GlobalSearch } from "./GlobalSearch";

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const userName = user?.user_metadata?.full_name || "Usuario";
  const userEmail = user?.email || "";
  const userInitials = userName.substring(0, 2).toUpperCase();

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-border">
      <div className="flex items-center lg:hidden">
        <Button variant="ghost" size="icon" className="mr-2">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="hidden lg:flex flex-1 max-w-md">
        <GlobalSearch />
      </div>

      <div className="flex items-center space-x-4 ml-auto">
        <NotificationBell />
        <UserNav userInitials={userInitials} userName={userName} userEmail={userEmail} />
      </div>
    </header>
  );
}
