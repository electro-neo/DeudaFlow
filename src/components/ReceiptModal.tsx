import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Client, Transaction } from "@/types/client";
import jsPDF from "jspdf";
import { useState } from "react";
import { Directory } from "@capacitor/filesystem";
import { useCurrency } from "../context/CurrencyContext";

// Detecta si la app corre en Android nativo O si la pantalla es pequeña (móvil)
const isMobileOrAndroid = () => {
  if (
    typeof window !== "undefined" &&
    (window as any).Capacitor &&
    typeof (window as any).Capacitor.getPlatform === "function"
  ) {
    const platform = (window as any).Capacitor.getPlatform();
    if (platform === "android" && window.location.protocol === "file:") return true;
  }
  if (typeof window !== "undefined" && window.innerWidth < 700) return true;
  return /android/i.test(navigator.userAgent) && window.location.protocol === "file:";
};

interface ReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
  transactions: Transaction[];
}

export const ReceiptModal = ({ open, onOpenChange, client, transactions }: ReceiptModalProps) => {
  const { rate } = useCurrency();
  // Estados para el filtro de fechas
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Utilidad para normalizar cualquier fecha a medianoche local
  function normalizeToLocalMidnight(date: Date | string | number | null | undefined): number | null {
    if (!date) return null;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  // Filtrar transacciones por rango de fecha (inclusivo)
  const filteredTransactions = transactions.filter((t) => {
    const tTime = normalizeToLocalMidnight(t.date);
    const startTime = normalizeToLocalMidnight(startDate);
    const endTime = normalizeToLocalMidnight(endDate);
    if (startTime !== null && tTime !== null && tTime < startTime) return false;
    if (endTime !== null && tTime !== null && tTime > endTime) return false;
    return true;
  });
  const total = filteredTransactions.reduce((sum, t) => sum + (t.type === "debt" ? t.amount : -t.amount), 0);
  const isDebt = total > 0;

  const handlePrint = () => {
    window.print();
  };

  // handleNativePrint y plugin capacitorjs-printer eliminados

  // Exportar PDF (web y móvil): en móvil descarga el PDF normalmente (no usa @capacitor/browser)
  const handleExportPDFTable = async () => {
    const jsPDFModule = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const jsPDF = jsPDFModule.default;
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    doc.setFontSize(16);
    doc.text("Recibo de Movimientos", 40, 40);
    doc.setFontSize(12);
    doc.text(`Cliente: ${client.name} (ID: ${client.id || 'N/A'})`, 40, 65);
    doc.text(`Tel: ${client.phone || "N/A"} | Email: ${client.email || "N/A"}`, 40, 85);

    const saldoLabel = `${isDebt ? "Deuda total: " : "Saldo Positivo: "}`;
    const saldoValue = Math.abs(total).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const saldoText = saldoLabel + saldoValue;

    autoTable(doc, {
      startY: 110,
      head: [["Fecha", "Descripción", "Tipo", "Valor", "USD"]],
      body: filteredTransactions.map((t) => [
        // Mostrar la fecha local correctamente aunque venga como string YYYY-MM-DD
        typeof t.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(t.date)
          ? t.date.split("-").reverse().join("/") // dd/mm/yyyy
          : new Date(t.date).toLocaleDateString("es-MX"),
        t.description || (t.type === "debt" ? "Deuda registrada" : "Abono registrado"),
        t.type === "debt" ? "Deuda" : "Abono",
        t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        rate > 0 ? (t.amount / rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"
      ]),
      foot: [
        [
          {
            content: saldoText,
            colSpan: 4,
            styles: { halign: "right", fontStyle: "bold", fontSize: 13 },
          },
        ],
      ],
      styles: {
        fontSize: 11,
        cellPadding: 6,
        valign: "middle",
        textColor: [33, 37, 41],
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [243, 244, 246],
        textColor: [33, 37, 41],
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
      },
      bodyStyles: {
        halign: "left",
        valign: "middle",
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
      },
      footStyles: {
        fillColor: [255, 255, 255],
        textColor: [33, 37, 41],
        fontStyle: "bold",
        halign: "right",
        valign: "middle",
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      margin: { left: 40, right: 40 },
      tableLineWidth: 0.5,
      tableLineColor: [200, 200, 200],
      didDrawPage: (data) => {
        doc.setFontSize(16);
        doc.text("Recibo de Movimientos", 40, 40);
        doc.setFontSize(12);
        doc.text(`Cliente: ${client.name}`, 40, 65);
        doc.text(`Tel: ${client.phone || "N/A"} | Email: ${client.email || "N/A"}`, 40, 85);
      },
      showHead: "everyPage",
      showFoot: "lastPage",
      pageBreak: "auto",
    });

    const fileName = `recibo-profesional-${client.name}-${client.id || 'N/A'}.pdf`;

    if (isMobileOrAndroid()) {
      const pdfBlob = doc.output("blob");
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result?.toString().split(",")[1];
        if (base64data) {
          const { Filesystem } = await import("@capacitor/filesystem");
          const { Share } = await import("@capacitor/share");
          // Guarda el archivo en el directorio Documents
          const saved = await Filesystem.writeFile({
            path: fileName,
            data: base64data,
            directory: Directory.Documents,
            recursive: true,
          });
          // Comparte usando la ruta nativa
          await Share.share({
            title: fileName,
            text: "Te comparto tu recibo en PDF.",
            url: saved.uri,
            dialogTitle: "Compartir recibo PDF",
          });
        }
      };
      reader.readAsDataURL(pdfBlob);
    } else {
      doc.save(fileName);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Recibo de Movimientos</DialogTitle>
        </DialogHeader>
        <div className="mb-2 flex flex-col md:flex-row gap-2 items-start md:items-center">
          <label className="text-sm font-medium">Desde:
            <input type="date" className="ml-2 border rounded px-2 py-1" value={startDate} onChange={e => setStartDate(e.target.value)} max={endDate || undefined} />
          </label>
          <label className="text-sm font-medium">Hasta:
            <input type="date" className="ml-2 border rounded px-2 py-1" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate || undefined} />
          </label>
        </div>
        <div id="recibo-content" className="mb-4 overflow-x-auto">
          <div className="font-bold">Cliente: {client.name}</div>
          <div className="text-xs text-muted-foreground mb-1">ID: {client.id || 'N/A'}</div>
          <div className="text-sm text-muted-foreground mb-2">
            Tel: {client.phone || "N/A"} | Email: {client.email || "N/A"}
          </div>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-muted">
                  <th className="px-2 py-1 border">Fecha</th>
                  <th className="px-2 py-1 border">Descripción</th>
                  <th className="px-2 py-1 border">Tipo</th>
                  <th className="px-2 py-1 border">Valor</th>
                  <th className="px-2 py-1 border">USD</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr key={t.id}>
                    <td className="border px-2 py-1">
                      {typeof t.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(t.date)
                        ? t.date.split("-").reverse().join("/") // dd/mm/yyyy
                        : new Date(t.date).toLocaleDateString("es-MX")}
                    </td>
                    <td className="border px-2 py-1">
                      {t.description || (t.type === "debt" ? "Deuda registrada" : "Abono registrado")}
                    </td>
                    <td className="border px-2 py-1">{t.type === "debt" ? "Deuda" : "Abono"}</td>
                    <td className="border px-2 py-1 text-right">
                      {t.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="border px-2 py-1 text-right">
                      {rate > 0 ? (t.amount / rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="font-bold text-lg text-right mb-2">
            {isDebt ? "Deuda total: " : "Saldo Positivo: "}
            {Math.abs(total).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
        <DialogFooter className="print:hidden">

          {/* El botón Imprimir solo aparece en escritorio/web */}
          {!isMobileOrAndroid() && (
            <Button onClick={handlePrint} variant="outline">
              Imprimir
            </Button>
          )}
          <Button onClick={handleExportPDFTable} variant="outline" color="secondary">
            Exportar PDF
          </Button>
          {/* Botón Imprimir (Android/iOS) eliminado */}
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
