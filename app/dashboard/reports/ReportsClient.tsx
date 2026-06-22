"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FileText, Users, Wallet, Building2, Calendar, Wrench, Megaphone, Download, PieChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReportsClientProps {
  data: {
    profiles: any[];
    units: any[];
    payments: any[];
    expenses: any[];
    amenities: any[];
    reservations: any[];
    incidents: any[];
    announcements: any[];
  }
}

export function ReportsClient({ data }: ReportsClientProps) {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  // Helper to filter data by date range
  const filterByDate = (items: any[], dateField: string, start: string, end: string) => {
    return items.filter(item => {
      if (!item[dateField]) return true;
      const itemDate = new Date(item[dateField]).getTime();
      
      if (start) {
        const startDate = new Date(start + 'T00:00:00').getTime();
        if (itemDate < startDate) return false;
      }
      if (end) {
        const endDate = new Date(end + 'T23:59:59').getTime();
        if (itemDate > endDate) return false;
      }
      return true;
    });
  };

  // Common PDF Setup
  const setupPDF = (title: string, start: string, end: string) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(4, 9, 20); // primary/background color
    doc.rect(0, 0, doc.internal.pageSize.width, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("GestCom - Sistema de Condominio", 14, 16);
    
    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text(title, 14, 40);
    
    // Date / Timestamp
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    const dateStr = new Date().toLocaleString("es-ES", { dateStyle: "long", timeStyle: "short" });
    doc.text(`Generado el: ${dateStr}`, 14, 47);

    // Period Filter Text
    if (start || end) {
      const fromStr = start ? new Date(start + 'T12:00:00').toLocaleDateString("es-ES") : "Inicio";
      const toStr = end ? new Date(end + 'T12:00:00').toLocaleDateString("es-ES") : "Hoy";
      
      doc.setTextColor(14, 165, 233); // primary color
      doc.setFont("helvetica", "bold");
      doc.text(`Período reportado: ${fromStr} - ${toStr}`, 14, 53);
      return { doc, startY: 60 }; // return new startY
    }

    return { doc, startY: 55 }; // return default startY
  };

  const addFooter = (doc: jsPDF) => {
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `GestCom - Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }
  };

  // 1. Resumen General
  const generateSummary = (start: string, end: string) => {
    setIsGenerating("summary");
    try {
      const { doc, startY } = setupPDF("Resumen General del Condominio", start, end);

      const fProfiles = filterByDate(data.profiles, "created_at", start, end);
      const fPayments = filterByDate(data.payments, "date", start, end);
      const fIncidents = filterByDate(data.incidents, "created_at", start, end);
      const fReservations = filterByDate(data.reservations, "date", start, end);
      const fAnnouncements = filterByDate(data.announcements, "created_at", start, end);

      const residents = fProfiles.filter(p => p.role !== "admin").length;
      const totalIncome = fPayments.filter(p => p.status === "completed").reduce((acc, curr) => acc + curr.amount, 0);
      const openIncidents = fIncidents.filter(i => i.status !== "resolved" && i.status !== "closed").length;
      const activeAmenities = data.amenities.filter(a => a.status === "available").length;

      autoTable(doc, {
        startY,
        head: [["Indicador", "Valor (en el período)"]],
        body: [
          ["Nuevos Residentes Registrados", residents.toString()],
          ["Ingresos Totales (Pagos Completados)", `$${totalIncome.toFixed(2)}`],
          ["Incidencias Reportadas (Aún abiertas)", openIncidents.toString()],
          ["Nuevas Reservas", fReservations.length.toString()],
          ["Anuncios Publicados", fAnnouncements.length.toString()],
        ],
        theme: "striped",
        headStyles: { fillColor: [14, 165, 233] },
      });

      addFooter(doc);
      doc.save("GestCom_Resumen_General.pdf");
    } finally {
      setIsGenerating(null);
    }
  };

  // 2. Residentes
  const generateResidents = (start: string, end: string) => {
    setIsGenerating("residents");
    try {
      const { doc, startY } = setupPDF("Directorio de Residentes", start, end);
      const fProfiles = filterByDate(data.profiles, "created_at", start, end);

      const tableData = fProfiles
        .filter(p => p.role !== "admin")
        .map(p => [
          p.full_name || "Sin Nombre",
          p.units ? `Unidad ${p.units.unit_number}` : "Sin Unidad",
          new Date(p.created_at).toLocaleDateString("es-ES")
        ]);

      autoTable(doc, {
        startY,
        head: [["Nombre", "Unidad", "Fecha Registro"]],
        body: tableData.length ? tableData : [["No hay residentes en este período", "", ""]],
        theme: "striped",
        headStyles: { fillColor: [14, 165, 233] },
      });

      addFooter(doc);
      doc.save("GestCom_Residentes.pdf");
    } finally {
      setIsGenerating(null);
    }
  };

  // 3. Pagos
  const generatePayments = (start: string, end: string) => {
    setIsGenerating("payments");
    try {
      const { doc, startY } = setupPDF("Historial de Pagos", start, end);
      const fPayments = filterByDate(data.payments, "date", start, end);

      const tableData = fPayments.map(p => {
        const date = new Date(p.date).toLocaleDateString("es-ES");
        const statusMap: any = { pending: "Pendiente", completed: "Completado", failed: "Fallido", verified: "Verificado" };
        const status = statusMap[p.status] || p.status;
        return [
          date,
          p.profiles?.full_name || "Desconocido",
          p.units?.unit_number || "N/A",
          `$${p.amount.toFixed(2)}`,
          status
        ];
      });

      autoTable(doc, {
        startY,
        head: [["Fecha", "Residente", "Unidad", "Monto", "Estado"]],
        body: tableData.length ? tableData : [["No hay pagos en este período", "", "", "", ""]],
        theme: "striped",
        headStyles: { fillColor: [14, 165, 233] },
      });

      addFooter(doc);
      doc.save("GestCom_Pagos.pdf");
    } finally {
      setIsGenerating(null);
    }
  };

  // 4. Áreas Comunes y Reservas
  const generateAmenities = (start: string, end: string) => {
    setIsGenerating("amenities");
    try {
      const { doc, startY } = setupPDF("Áreas Comunes y Reservas", start, end);
      const fReservations = filterByDate(data.reservations, "date", start, end);

      // Amenities Table (Always show all amenities, don't filter amenities by date)
      doc.setFontSize(14);
      doc.setTextColor(0,0,0);
      doc.text("Espacios Registrados", 14, startY);
      
      const amData = data.amenities.map(a => [
        a.name,
        a.capacity.toString(),
        a.status === "available" ? "Disponible" : a.status === "maintenance" ? "En Mantenimiento" : "Inactivo"
      ]);

      autoTable(doc, {
        startY: startY + 5,
        head: [["Espacio", "Capacidad", "Estado"]],
        body: amData,
        theme: "striped",
        headStyles: { fillColor: [14, 165, 233] },
      });

      // Reservations Table
      const finalY = (doc as any).lastAutoTable.finalY || startY;
      doc.setFontSize(14);
      doc.text("Historial de Reservas (Filtrado)", 14, finalY + 15);

      const resData = fReservations.map(r => [
        new Date(r.date).toLocaleString("es-ES"),
        r.amenities?.name || "Desconocido",
        r.profiles?.full_name || "Desconocido",
        r.status
      ]);

      autoTable(doc, {
        startY: finalY + 20,
        head: [["Fecha", "Espacio", "Residente", "Estado"]],
        body: resData.length ? resData : [["No hay reservas en este período", "", "", ""]],
        theme: "striped",
        headStyles: { fillColor: [14, 165, 233] },
      });

      addFooter(doc);
      doc.save("GestCom_Areas_Comunes.pdf");
    } finally {
      setIsGenerating(null);
    }
  };

  // 5. Incidencias
  const generateIncidents = (start: string, end: string) => {
    setIsGenerating("incidents");
    try {
      const { doc, startY } = setupPDF("Reporte de Incidencias", start, end);
      const fIncidents = filterByDate(data.incidents, "created_at", start, end);

      const tableData = fIncidents.map(i => {
        const date = new Date(i.created_at).toLocaleDateString("es-ES");
        const statusMap: any = { open: "Abierto", in_progress: "En Progreso", resolved: "Resuelto", closed: "Cerrado" };
        const priorityMap: any = { low: "Baja", medium: "Media", high: "Alta", urgent: "Urgente" };
        
        return [
          i.title,
          date,
          i.profiles?.full_name || "Admin",
          priorityMap[i.priority] || i.priority,
          statusMap[i.status] || i.status
        ];
      });

      autoTable(doc, {
        startY,
        head: [["Incidencia", "Fecha", "Reportado por", "Prioridad", "Estado"]],
        body: tableData.length ? tableData : [["No hay incidencias en este período", "", "", "", ""]],
        theme: "striped",
        headStyles: { fillColor: [14, 165, 233] },
      });

      addFooter(doc);
      doc.save("GestCom_Incidencias.pdf");
    } finally {
      setIsGenerating(null);
    }
  };

  const reports = [
    {
      id: "summary",
      title: "Resumen General",
      description: "Estadísticas globales, totales por módulo e ingresos del condominio.",
      icon: PieChart,
      action: generateSummary,
    },
    {
      id: "residents",
      title: "Directorio de Residentes",
      description: "Lista completa de residentes registrados y sus unidades asignadas.",
      icon: Users,
      action: generateResidents,
    },
    {
      id: "payments",
      title: "Historial de Pagos",
      description: "Registro de todos los pagos, ingresos y estado de solvencia.",
      icon: Wallet,
      action: generatePayments,
    },
    {
      id: "amenities",
      title: "Áreas Comunes y Reservas",
      description: "Estado de las instalaciones y el historial completo de reservas.",
      icon: Calendar,
      action: generateAmenities,
    },
    {
      id: "incidents",
      title: "Gestión de Incidencias",
      description: "Listado de incidencias reportadas, prioridades y estado de resolución.",
      icon: Wrench,
      action: generateIncidents,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} isGenerating={isGenerating} />
      ))}
    </div>
  );
}

// Subcomponent to isolate the date state per card
function ReportCard({ report, isGenerating }: { report: any, isGenerating: string | null }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
          <report.icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">{report.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {report.description}
        </p>

        {/* Date Filters */}
        <div className="mb-6 space-y-3 bg-muted/30 p-3 rounded-xl border border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filtro por fecha (Opcional)</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-medium">Desde</label>
              <Input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                onClick={(e: any) => e.target.showPicker?.()}
                className="h-8 text-xs bg-background cursor-pointer" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-medium">Hasta</label>
              <Input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                onClick={(e: any) => e.target.showPicker?.()}
                className="h-8 text-xs bg-background cursor-pointer" 
                min={startDate}
              />
            </div>
          </div>
        </div>
      </div>

      <Button 
        onClick={() => report.action(startDate, endDate)} 
        disabled={isGenerating !== null}
        className="w-full flex items-center gap-2 font-bold h-11"
      >
        {isGenerating === report.id ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
            Generando...
          </span>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Descargar PDF
          </>
        )}
      </Button>
    </div>
  );
}
