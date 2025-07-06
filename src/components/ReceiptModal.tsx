import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Client, Transaction } from "@/types/client";

interface ReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
  transactions: Transaction[];
}

export const ReceiptModal = ({ open, onOpenChange, client, transactions }: ReceiptModalProps) => {
  const total = transactions.reduce((sum, t) => sum + (t.type === 'debt' ? t.amount : -t.amount), 0);
  const isDebt = total > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Recibo de Movimientos</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <div className="font-bold">Cliente: {client.name}</div>
          <div className="text-sm text-muted-foreground mb-2">Tel: {client.phone || 'N/A'} | Email: {client.email || 'N/A'}</div>
        </div>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-muted">
                <th className="px-2 py-1 border">Fecha</th>
                <th className="px-2 py-1 border">Descripción</th>
                <th className="px-2 py-1 border">Tipo</th>
                <th className="px-2 py-1 border">Valor</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td className="border px-2 py-1">{new Date(t.date).toLocaleDateString('es-MX')}</td>
                  <td className="border px-2 py-1">{t.description || (t.type === 'debt' ? 'Deuda registrada' : 'Abono registrado')}</td>
                  <td className="border px-2 py-1">{t.type === 'debt' ? 'Deuda' : 'Abono'}</td>
                  <td className="border px-2 py-1 text-right">{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="font-bold text-lg text-right mb-2">
          {isDebt ? 'Deuda total: ' : 'Saldo Positivo: '}
          {Math.abs(total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <DialogFooter>
          <Button onClick={() => window.print()} variant="outline">Imprimir</Button>
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
