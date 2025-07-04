import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Client } from "@/types/client";
import { User, Phone, Mail, MapPin, Trash2, Edit, Plus, Minus } from "lucide-react";

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
  onAddTransaction: (clientId: string, type: 'debt' | 'payment') => void;
  onViewTransactions: (clientId: string) => void;
}

export const ClientCard = ({ 
  client, 
  onEdit, 
  onDelete, 
  onAddTransaction, 
  onViewTransactions 
}: ClientCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            {client.name}
          </CardTitle>
          <Badge 
            variant={client.balance > 0 ? "destructive" : client.balance < 0 ? "default" : "secondary"}
            className="font-medium"
          >
            {formatCurrency(client.balance)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          {client.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {client.phone}
            </div>
          )}
          {client.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {client.email}
            </div>
          )}
          {client.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {client.address}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddTransaction(client.id, 'debt')}
            className="flex items-center gap-1 hover:bg-red-100 hover:border-red-400 hover:text-red-700 transition-colors"
            style={{ borderColor: '#ef4444' }}
          >
            <Plus className="h-4 w-4" />
            Deuda
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddTransaction(client.id, 'payment')}
            className="flex items-center gap-1 hover:bg-green-100 hover:border-green-400 hover:text-green-700 transition-colors"
            style={{ borderColor: '#22c55e' }}
          >
            <Minus className="h-4 w-4" />
            Abono
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onViewTransactions(client.id)}
            className="flex-1 hover:bg-blue-100 hover:border-blue-400 hover:text-blue-700 transition-colors"
            style={{ borderColor: '#2563eb' }}
          >
            Ver Movimientos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(client)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(client.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};