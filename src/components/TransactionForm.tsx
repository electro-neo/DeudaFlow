import { useState } from "react";
import { useCurrency } from "../context/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Client } from "@/types/client";

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  type: 'debt' | 'payment';
  onSave: (transaction: {
    clientId: string;
    type: 'debt' | 'payment';
    amount: number;
    description: string;
    date: string;
  }) => void;
}

export const TransactionForm = ({ 
  open, 
  onOpenChange, 
  client, 
  type, 
  onSave 
}: TransactionFormProps) => {
  const [formData, setFormData] = useState({
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || formData.amount <= 0) return;
    let amountToSave = formData.amount;
    // Si el toggle está en USD, el valor ingresado es moneda local y se divide para mostrar el equivalente en USD
    if (currency === "USD") {
      amountToSave = formData.amount; // Se guarda el valor tal cual (moneda local)
    }
    // Si está en 💱, también se guarda el valor tal cual
    onSave({
      clientId: client.id,
      type,
      amount: amountToSave,
      description: formData.description,
      date: formData.date,
    });
    setFormData({
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    onOpenChange(false);
  };

  const handleClose = () => {
    setFormData({
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    onOpenChange(false);
  };

  const { currency, rate } = useCurrency();
  const getDisplayAmount = (amount: number) => {
    if (currency === "USD") return amount;
    return amount * rate;
  };
  const formatCurrency = (amount: number) => {
    if (currency === "USD") {
      return `$${amount.toFixed(2)} USD`;
    } else {
      return `${getDisplayAmount(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 💱`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'debt' ? 'Nueva Deuda' : 'Nuevo Abono'}
            {client && (
              <Badge variant="outline" className="ml-2">
                {client.name}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {client && (
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Balance actual:</span>
                <span className={`font-medium ${client.balance > 0 ? 'text-destructive' : client.balance < 0 ? 'text-success' : ''}`}>
                  {client.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 💱
                </span>
              </div>
              {currency === "USD" && (
                <div className="flex justify-end text-xs text-muted-foreground">
                  ≈ ${(client.balance / rate).toFixed(2)} USD
                </div>
              )}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Monto *</Label>
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              pattern="^[0-9]*[.,]?[0-9]*$"
              value={formData.amount === 0 ? '' : formData.amount}
              onChange={(e) => {
                const val = e.target.value.replace(',', '.');
                setFormData({ ...formData, amount: val === '' ? 0 : parseFloat(val) });
              }}
              placeholder="Monto en moneda local"
              autoComplete="off"
              required
            />
            {currency === "USD" && (
              <div className="text-xs text-muted-foreground">
                El monto se guarda en moneda local. Equivalente en USD: <b>${formData.amount && rate ? (formData.amount / rate).toFixed(2) : '0.00'} USD</b>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={type === 'debt' ? 'Concepto de la deuda...' : 'Concepto del abono...'}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant={type === 'debt' ? 'destructive' : 'default'}
            >
              Registrar {type === 'debt' ? 'Deuda' : 'Abono'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};