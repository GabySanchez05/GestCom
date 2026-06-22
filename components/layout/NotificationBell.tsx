"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Megaphone, Wallet, Wrench, Calendar, Check, X } from "lucide-react"
import Link from "next/link"
import { getNotifications, NotificationItem } from "@/app/actions/notifications"

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [readIds, setReadIds] = useState<string[]>([])
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // Load notifications and read states
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getNotifications()
        setNotifications(data)
      } catch (err) {
        console.error("Error fetching notifications:", err)
      }
    }
    
    // Load read and deleted notifications from localStorage
    const savedRead = localStorage.getItem("read_notifications")
    if (savedRead) {
      try { setReadIds(JSON.parse(savedRead)) } catch (e) {}
    }

    const savedDeleted = localStorage.getItem("deleted_notifications")
    if (savedDeleted) {
      try { setDeletedIds(JSON.parse(savedDeleted)) } catch (e) {}
    }

    loadData()
    // Poll every 30 seconds for dynamic updates
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const visibleNotifications = notifications.filter(n => !deletedIds.includes(n.id))
  const unreadNotifications = visibleNotifications.filter(n => !readIds.includes(n.id))
  const hasUnread = unreadNotifications.length > 0

  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.id)
    localStorage.setItem("read_notifications", JSON.stringify(allIds))
    setReadIds(allIds)
  }

  const handleMarkOneRead = (id: string) => {
    if (!readIds.includes(id)) {
      const newReadIds = [...readIds, id]
      localStorage.setItem("read_notifications", JSON.stringify(newReadIds))
      setReadIds(newReadIds)
    }
  }

  const handleDeleteOne = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    const newDeletedIds = [...deletedIds, id]
    localStorage.setItem("deleted_notifications", JSON.stringify(newDeletedIds))
    setDeletedIds(newDeletedIds)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return <Megaphone className="h-4 w-4 text-amber-500" />
      case "payment":
        return <Wallet className="h-4 w-4 text-emerald-500" />
      case "incident":
        return <Wrench className="h-4 w-4 text-rose-500" />
      case "reservation":
        return <Calendar className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4 text-primary" />
    }
  }

  return (
    <div className="relative font-sans" ref={containerRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all duration-200"
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5" />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background animate-pulse" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 rounded-2xl bg-card border border-border shadow-xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2.5 border-b border-border">
            <h3 className="font-semibold text-foreground text-sm">Notificaciones</h3>
            {hasUnread && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                <Check className="h-3.5 w-3.5" />
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[320px] overflow-y-auto mt-2 divide-y divide-border/60 custom-scrollbar">
            {visibleNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm">No tienes notificaciones por el momento</p>
              </div>
            ) : (
              visibleNotifications.map((n) => {
                const isRead = readIds.includes(n.id)
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 p-4 transition-colors hover:bg-muted/40 ${
                      !isRead ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5 p-2 rounded-xl bg-muted border border-border/50">
                      {getIcon(n.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0 font-sans">
                      <Link
                        href={n.link}
                        onClick={() => {
                          handleMarkOneRead(n.id)
                          setIsOpen(false)
                        }}
                        className="block"
                      >
                        <p className={`text-sm text-foreground leading-tight ${!isRead ? "font-semibold text-foreground" : "font-normal text-muted-foreground"}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed truncate">
                          {n.message}
                        </p>
                      </Link>
                      <span className="text-[10px] text-muted-foreground/70 mt-1 block">
                        {new Date(n.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 items-center justify-start mt-1">
                      <button
                        onClick={(e) => handleDeleteOne(e, n.id)}
                        className="flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                        title="Eliminar notificación"
                      >
                        <X className="h-3 w-3" />
                      </button>

                      {!isRead && (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleMarkOneRead(n.id)
                          }}
                          className="flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Marcar como leída"
                        >
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
