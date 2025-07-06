import { useState, useEffect } from "react";
import { useCurrency } from "../context/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/components/DashboardStats";
import { Client, Transaction, TransactionWithClient } from "@/types/client";
import { Plus, Activity } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useSession } from "@supabase/auth-helpers-react";

export const Dashboard = () => {
  const { currency, rate } = useCurrency();
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const session = useSession();
  const user = session?.user;
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchClients();
      fetchTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id);
    if (!error) setClients(data || []);
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id);
    if (!error) {
      const mapped = (data || []).map((t: any) => ({
        ...t,
        clientId: t.client_id,
        createdAt: t.created_at,
      }));
      setTransactions(mapped);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Borra cookies de Google para forzar selección de cuenta
    document.cookie = "G_AUTHUSER=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "G_ENABLED_IDPS=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Opcional: borra todas las cookies de dominio actual (solo frontend, no httpOnly)
    if (window.location.hostname !== "localhost") {
      document.cookie.split(';').forEach(function(c) {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
    }
    navigate("/login");
  };

  // Ordena y toma las 10 transacciones más recientes
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Formatea monto según moneda: siempre muestra el valor guardado en moneda local, pero si el toggle está en USD muestra el equivalente en USD
  const formatCurrency = (amount: number, type?: string) => {
    if (currency === "USD") {
      return `${type === 'debt' ? '+' : '-'}$${(amount / rate).toFixed(2)} USD`;
    } else {
      return `${type === 'debt' ? '+' : '-'}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 💱`;
    }
  };

  // Relaciona transacciones con clientes
  const transactionsWithClient: TransactionWithClient[] = recentTransactions.map(transaction => {
    const client = clients.find(c => c.id === transaction.clientId);
    return {
      ...transaction,
      clientName: client?.name || 'Cliente no encontrado'
    };
  });

  // Calcula el total adelantado (suma de abonos)
  const totalAdelantado = transactions
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  useEffect(() => {
    if (session === null) {
      navigate("/login");
    }
  }, [session, navigate]);

  if (session === undefined) {
    return <div>Cargando...</div>;
  }
  if (session === null) {
    return null; // Ya navega en el useEffect
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
          {user && (
            <div className="mt-2 text-lg font-semibold text-success">
              ¡Bienvenido, {user.user_metadata?.full_name || user.email}!
            </div>
          )}
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
      <DashboardStats
        clients={clients}
        transactions={transactions}
        // totalAdelantado eliminado, ya no es necesario aquí
      />

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
                      {formatCurrency(transaction.amount, transaction.type)}
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

      {/* Eliminado Total adelantado, solo se muestra el stats Total Abonado */}
    </div>
  );
};