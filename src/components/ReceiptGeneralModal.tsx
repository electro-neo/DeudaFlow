import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Client, Transaction } from "@/types/client";
import { useState } from "react";
import { useCurrency } from "../context/CurrencyContext";

interface ReceiptGeneralModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  transactions: Transaction[];
}

export const ReceiptGeneralModal = ({ open, onOpenChange, clients, transactions }: ReceiptGeneralModalProps) => {
  const { rate } = useCurrency();

  const clientTotals = clients.map(client => {
    let total = typeof client.balance === 'number'
      ? client.balance
      : transactions
          .filter(t => t.clientId === client.id)
          .reduce((sum, t) => sum + (t.type === "debt" ? t.amount : -t.amount), 0);
    return {
      id: client.id,
      name: client.name,
      total,
      totalUSD: rate > 0 ? total / rate : 0,
    };
  });
  const totalGeneral = clientTotals.reduce((sum, c) => sum + c.total, 0);
  const totalGeneralUSD = clientTotals.reduce((sum, c) => sum + c.totalUSD, 0);

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    doc.setFontSize(16);
    doc.text("Recibo General de Clientes", 40, 40);
    autoTable(doc, {
      startY: 70,
      head: [["Nombre", "ID", "Saldo", "USD"]],
      body: clientTotals.map(c => [
        c.name,
        c.id,
        c.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        c.totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      ]),
      foot: [[
        { content: "Total General", colSpan: 2, styles: { halign: "right", fontStyle: "bold" } },
        totalGeneral.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        totalGeneralUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      ]],
      styles: { fontSize: 12, cellPadding: 6 },
      headStyles: {
        fillColor: [255, 255, 255], // fondo blanco
        textColor: [0, 0, 0], // texto negro
        fontStyle: "bold",
        fontWeight: "bold"
      },
      footStyles: { fontStyle: "bold" },
      margin: { left: 40, right: 40 },
    });
    doc.save("recibo-general-clientes.pdf");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Recibo General de Clientes</DialogTitle>
        </DialogHeader>
        <div className="mb-4 space-y-4">
          {clientTotals.map(c => (
            <div key={c.id} className="border rounded p-3 bg-white shadow-sm">
              <div className="font-bold text-base mb-1">{c.name}</div>
              <div className="text-xs text-muted-foreground mb-2">ID: {c.id}</div>
              <table className="min-w-[200px] text-sm border mb-0">
                <thead>
                  <tr className="bg-muted">
                    <th className="border px-2 py-1">Saldo</th>
                    <th className="border px-2 py-1">{clientTotals.length > 0 ? 'Monto' : ''}</th>
                    <th className="border px-2 py-1">USD</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-2 py-1 font-medium">Saldo</td>
                    <td className="border px-2 py-1 text-right">{c.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="border px-2 py-1 text-right">{c.totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
          <div className="border-t pt-4 mt-4 text-right font-bold text-lg">
            Total General: {totalGeneral.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | USD: {totalGeneralUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleExportPDF} variant="outline" color="secondary">Exportar PDF</Button>
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
