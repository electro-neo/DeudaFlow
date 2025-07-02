import { useState } from "react";
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
    
    onSave({
      clientId: client.id,
      type,
      amount: formData.amount,
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
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
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Balance actual:</span>
              <span className={`font-medium ${client.balance > 0 ? 'text-destructive' : client.balance < 0 ? 'text-success' : ''}`}>
                {formatCurrency(client.balance)}
              </span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Monto *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              required
            />
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