"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./Sidebar";
import { usePathname } from "next/navigation";

export function MobileSidebar({ role }: { role: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Cerrar el menú automáticamente cuando se cambia de página
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevenir scroll en el body cuando el menú está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="mr-2 lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Overlay oscuro */}
      {open && (
        <div 
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden transition-opacity" 
          onClick={() => setOpen(false)}
        />
      )}

      {/* Contenedor del Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-[70] w-72 bg-card transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Botón de cerrar */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-4 top-3 z-[80] h-10 w-10 bg-background/50 backdrop-blur-md border border-border" 
          onClick={() => setOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
        
        {/* Renderizamos el Sidebar original pasándole el rol */}
        <Sidebar role={role} />
      </div>
    </>
  );
}
