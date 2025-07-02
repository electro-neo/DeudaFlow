import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/components/DashboardStats";
import { TransactionsList } from "@/components/TransactionsList";
import { Client, Transaction, TransactionWithClient } from "@/types/client";
import { Plus, Activity } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { initializeSampleData } from "@/data/sampleData";
import { supabase } from "../supabaseClient";
import { useSession } from "@supabase/auth-helpers-react";

export const Dashboard = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const session = useSession();
  const user = session?.user;
  const navigate = useNavigate();

  useEffect(() => {
    // Inicializar datos de ejemplo si no existen
    initializeSampleData();
    
    // Cargar datos del localStorage
    const savedClients = localStorage.getItem('debt_app_clients');
    const savedTransactions = localStorage.getItem('debt_app_transactions');
    
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    }
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const transactionsWithClient: TransactionWithClient[] = recentTransactions.map(transaction => {
    const client = clients.find(c => c.id === transaction.clientId);
    return {
      ...transaction,
      clientName: client?.name || 'Cliente no encontrado'
    };
  });

  if (session === undefined) {
    return <div>Cargando...</div>;
  }
  if (session === null) {
    navigate("/login");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Resumen general de cuentas y movimientos
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/clients">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <DashboardStats clients={clients} transactions={transactions} />

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Movimientos Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsWithClient.length > 0 ? (
            <div className="space-y-4">
              {transactionsWithClient.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      transaction.type === 'debt' ? 'bg-destructive' : 'bg-success'
                    }`} />
                    <div>
                      <p className="font-medium">{transaction.clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.description || `${transaction.type === 'debt' ? 'Deuda' : 'Abono'} registrado`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'debt' ? 'text-destructive' : 'text-success'
                    }`}>
                      {transaction.type === 'debt' ? '+' : '-'}
                      {new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: 'MXN'
                      }).format(transaction.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                </div>
              ))}
              <div className="pt-4 text-center">
                <Button variant="outline" asChild>
                  <Link to="/transactions">Ver Todos los Movimientos</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay movimientos registrados aún</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};