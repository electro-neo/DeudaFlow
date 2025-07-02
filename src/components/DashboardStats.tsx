import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client, Transaction } from "@/types/client";
import { Users, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface DashboardStatsProps {
  clients: Client[];
  transactions: Transaction[];
}

export const DashboardStats = ({ clients, transactions }: DashboardStatsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const totalClients = clients.length;
  const totalBalance = clients.reduce((sum, client) => sum + client.balance, 0);
  const totalDebts = clients.reduce((sum, client) => sum + (client.balance > 0 ? client.balance : 0), 0);
  const totalCredits = clients.reduce((sum, client) => sum + (client.balance < 0 ? Math.abs(client.balance) : 0), 0);

  const stats = [
    {
      title: "Total Clientes",
      value: totalClients.toString(),
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Balance Total",
      value: formatCurrency(totalBalance),
      icon: DollarSign,
      color: totalBalance >= 0 ? "text-success" : "text-destructive"
    },
    {
      title: "Total por Cobrar",
      value: formatCurrency(totalDebts),
      icon: TrendingUp,
      color: "text-destructive"
    },
    {
      title: "Total Adelantado",
      value: formatCurrency(totalCredits),
      icon: TrendingDown,
      color: "text-success"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};