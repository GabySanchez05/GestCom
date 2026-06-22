"use client"

import { useState, useRef, useEffect } from "react"
import { LogOut, User } from "lucide-react"
import { logout } from "@/app/actions/auth"
import Link from "next/link"

export function UserNav({ userInitials, userName, userEmail }: { userInitials: string, userName: string, userEmail: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <div 
        className="h-8 w-8 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center cursor-pointer hover:bg-primary/30 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-semibold text-primary">{userInitials}</span>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-lg py-2 z-50 animate-fade-in">
          <div className="px-4 py-2 border-b border-border">
            <p className="text-sm font-medium text-foreground truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
          
          <div className="px-2 py-2">
            <Link 
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              <User className="h-4 w-4" />
              Perfil
            </Link>
          </div>
          
          <div className="border-t border-border px-2 py-2">
            <form action={logout}>
              <button 
                type="submit"
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg text-red-500 hover:bg-red-500/10 transition-colors font-medium"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
