import { useState, useEffect } from "react";
import { useCurrency } from "../context/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransactionsList } from "@/components/TransactionsList";
import { TransactionForm } from "@/components/TransactionForm";
import { Client, Transaction } from "@/types/client";
import { Plus, Search, Filter, Download } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "../supabaseClient";

export const Transactions = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [transactionType, setTransactionType] = useState<'debt' | 'payment'>('debt');
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const session = useSession();
  const user = session?.user;

  // Cargar clientes y transacciones desde Supabase
  useEffect(() => {
    if (user) {
      fetchClients();
      fetchTransactions();
    }
  }, [user]);

  useEffect(() => {
    // Si hay un parámetro de cliente en la URL, seleccionarlo
    const clientParam = searchParams.get('client');
    if (clientParam && clients.length > 0) {
      setSelectedClientId(clientParam);
    }
  }, [searchParams, clients]);

  useEffect(() => {
    // Filtrar transacciones
    let filtered = transactions;

    if (selectedClientId !== "all") {
      filtered = filtered.filter(t =>
        t.clientId === selectedClientId || t.client_id === selectedClientId
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(t => 
        (t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (clients.find(c => c.id === t.clientId)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, selectedClientId, typeFilter, searchTerm, clients]);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Error al cargar clientes", description: error.message });
    } else {
      setClients(data || []);
    }
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Error al cargar transacciones", description: error.message });
    } else {
      // Mapear client_id a clientId y created_at a createdAt si es necesario
      const mapped = (data || []).map((t: any) => ({
        ...t,
        clientId: t.client_id,
        createdAt: t.created_at,
      }));
      setTransactions(mapped);
    }
  };

  const saveTransactions = (updatedTransactions: Transaction[]) => {
    setTransactions(updatedTransactions);
    localStorage.setItem('debt_app_transactions', JSON.stringify(updatedTransactions));
  };

  const saveClients = (updatedClients: Client[]) => {
    setClients(updatedClients);
    localStorage.setItem('debt_app_clients', JSON.stringify(updatedClients));
  };

  // Guardar nueva transacción en Supabase
  const handleSaveTransaction = async (transactionData: {
    clientId: string;
    type: 'debt' | 'payment';
    amount: number;
    description: string;
    date: string;
  }) => {
    if (!user) return;
    const { error } = await supabase
      .from("transactions")
      .insert([{
        client_id: transactionData.clientId,
        user_id: user.id,
        type: transactionData.type,
        amount: transactionData.amount,
        description: transactionData.description,
        date: transactionData.date,
        created_at: new Date().toISOString(),
      }]);
    if (error) {
      toast({ title: "Error al guardar transacción", description: error.message });
    } else {
      toast({ title: `${transactionData.type === 'debt' ? 'Deuda' : 'Abono'} registrado correctamente` });
      fetchTransactions();
      fetchClients(); // Para actualizar balances si lo manejas en clientes
    }
  };

  const handleAddTransaction = (type: 'debt' | 'payment') => {
    if (selectedClientId !== "all") {
      const client = clients.find(c => c.id === selectedClientId);
      if (client) {
        setSelectedClient(client);
        setTransactionType(type);
        setShowTransactionForm(true);
        return;
      }
    }
    
    // Si no hay cliente seleccionado, mostrar el primero disponible
    if (clients.length > 0) {
      setSelectedClient(clients[0]);
      setTransactionType(type);
      setShowTransactionForm(true);
    }
  };

  const selectedClientData = selectedClientId !== "all" 
    ? clients.find(c => c.id === selectedClientId) 
    : null;

  const { currency, rate } = useCurrency();
  // Siempre muestra los montos en moneda local, pero si el toggle está en USD muestra el equivalente en USD
  const formatCurrency = (amount: number) => {
    if (currency === "USD") {
      return `$${(amount / rate).toFixed(2)} USD`;
    } else {
      return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 💱`;
    }
  };
  const totalAmount = filteredTransactions.reduce((sum, t) => {
    return sum + (t.type === 'debt' ? t.amount : -t.amount);
  }, 0);

  if (session === undefined) {
    return <div>Cargando...</div>;
  }
  if (session === null) {
    navigate("/login");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Movimientos
          </h1>
          <p className="text-muted-foreground">
            Historial de deudas y abonos
          </p>
        </div>
      </div> 

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar movimientos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="debt">Deudas</SelectItem>
                  <SelectItem value="payment">Abonos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Total</label>
              <div className={`text-lg font-semibold p-2 rounded-md bg-muted ${
                totalAmount > 0 ? 'text-destructive' : totalAmount < 0 ? 'text-success' : ''
              }`}>
                {formatCurrency(totalAmount)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Info */}
      {selectedClientData && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedClientData.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span>Balance actual:</span>
              <span className={`text-lg font-semibold ${
                selectedClientData.balance > 0 ? 'text-destructive' : 
                selectedClientData.balance < 0 ? 'text-success' : ''
              }`}>
                {formatCurrency(selectedClientData.balance)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      <TransactionsList 
        transactions={filteredTransactions} 
        client={selectedClientData}
        clients={clients} // <-- pasa la lista completa
      />

      {/* Transaction Form */}
      <TransactionForm
        open={showTransactionForm}
        onOpenChange={setShowTransactionForm}
        client={selectedClient}
        type={transactionType}
        onSave={handleSaveTransaction}
      />
    </div>
  );
};