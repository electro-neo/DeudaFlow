import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Transaction, Client } from "@/types/client";
import { ArrowUp, ArrowDown, Calendar, FileText } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";

interface TransactionsListProps {
  transactions: Transaction[];
  client?: Client | null;
  clients?: Client[]; // <-- Nuevo: lista de todos los clientes
}


export const TransactionsList = ({ transactions, client, clients = [] }: TransactionsListProps) => {
  const { currency, rate } = useCurrency();
  // Si la transacción fue registrada en USD, mostrar el monto original en USD
  // Si fue registrada en moneda local, mostrar el monto tal cual
  const formatCurrency = (amount: number) => {
    if (currency === "USD") {
      // Mostramos el monto convertido a USD (aproximado)
      return `$${(amount / rate).toFixed(2)} USD`;
    } else {
      // Mostramos el monto tal cual, en moneda local
      return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 💱`;
    }
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

  if (sortedTransactions.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="py-12 text-center text-muted-foreground">
          <FileText className="mx-auto mb-2 h-8 w-8" />
          No hay movimientos registrados {client ? `para ${client.name}` : "aún"}.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {sortedTransactions.map((transaction) => {
        // Busca el cliente correspondiente si no se pasó por prop
        const transactionClient = client || clients.find(c => c.id === transaction.clientId);

        return (
          <Card key={transaction.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                {transaction.type === "debt" ? (
                  <ArrowUp className="h-5 w-5 text-destructive" />
                ) : (
                  <ArrowDown className="h-5 w-5 text-success" />
                )}
                <Badge variant={transaction.type === "debt" ? "destructive" : "default"}>
                  {transaction.type === "debt" ? "Deuda" : "Abono"}
                </Badge>
                <span className="ml-2 text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(transaction.date)}
                </span>
              </div>
              <div className={`font-semibold text-lg ${transaction.type === "debt" ? "text-destructive" : "text-success"}`}>
                {transaction.type === "debt" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                {transactionClient && (
                  <span className="text-sm text-muted-foreground">
                    Cliente: <span className="font-medium">{transactionClient.name}</span>
                  </span>
                )}
                {transaction.description && (
                  <span className="text-sm">{transaction.description}</span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};