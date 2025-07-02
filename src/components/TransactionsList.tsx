import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Transaction, Client } from "@/types/client";
import { ArrowUp, ArrowDown, Calendar, FileText } from "lucide-react";

interface TransactionsListProps {
  transactions: Transaction[];
  client?: Client;
}

export const TransactionsList = ({ transactions, client }: TransactionsListProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            {client ? `No hay movimientos para ${client.name}` : 'No hay movimientos registrados'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sortedTransactions.map((transaction) => (
        <Card key={transaction.id} className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-2 ${
                  transaction.type === 'debt' 
                    ? 'bg-destructive/10 text-destructive' 
                    : 'bg-success/10 text-success'
                }`}>
                  {transaction.type === 'debt' ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant={transaction.type === 'debt' ? 'destructive' : 'default'}
                      className="text-xs"
                    >
                      {transaction.type === 'debt' ? 'Deuda' : 'Abono'}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(transaction.date)}
                    </span>
                  </div>
                  
                  {transaction.description && (
                    <p className="text-sm text-muted-foreground">
                      {transaction.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className={`text-lg font-semibold ${
                  transaction.type === 'debt' 
                    ? 'text-destructive' 
                    : 'text-success'
                }`}>
                  {transaction.type === 'debt' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};