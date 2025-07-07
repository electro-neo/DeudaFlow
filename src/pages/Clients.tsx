import { useState, useEffect } from "react";
import { useCurrency } from "../context/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientCard } from "@/components/ClientCard";
import { ReceiptModal } from "@/components/ReceiptModal";
import { ClientForm } from "@/components/ClientForm";
import { TransactionForm } from "@/components/TransactionForm";
import { Client, Transaction } from "@/types/client";
import { Plus, Search, Users, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useSession } from "@supabase/auth-helpers-react";
import { ReceiptGeneralModal } from "@/components/ReceiptGeneralModal";

export const Clients = () => {
  const { currency, rate, setRate } = useCurrency();
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showClientForm, setShowClientForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [transactionType, setTransactionType] = useState<'debt' | 'payment'>("debt");
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptClient, setReceiptClient] = useState<Client | null>(null);
  const [showGeneralReceipt, setShowGeneralReceipt] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const session = useSession();
  const user = session?.user;


  // Manejar redirección solo en efecto para evitar warning de React
  useEffect(() => {
    if (session === null) {
      navigate("/login");
    }
  }, [session, navigate]);

  if (session === undefined) {
    return <div>Cargando...</div>;
  }
  if (session === null) {
    return null;
  }

  useEffect(() => {
    if (user) {
      fetchClients();
      fetchTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Cargar clientes desde Supabase
  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error al cargar clientes", description: error.message });
      setClients([]);
    } else {
      setClients(data || []);
    }
  };

  // Cargar transacciones desde Supabase
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

  // Guardar (crear o actualizar) cliente en Supabase
  const handleSaveClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      toast({ title: "Error", description: "No hay usuario autenticado." });
      return;
    }
    const now = new Date().toISOString();

    if (editingClient) {
      // Actualizar cliente existente
      const { error } = await supabase
        .from("clients")
        .update({ ...clientData, updated_at: now })
        .eq("id", editingClient.id)
        .eq("user_id", user.id);
      if (error) {
        toast({ title: "Error al actualizar cliente", description: error.message });
      } else {
        toast({ title: "Cliente actualizado correctamente" });
        fetchClients();
      }
      setEditingClient(null);
    } else {
      // Crear nuevo cliente
      const { error } = await supabase
        .from("clients")
        .insert([{ ...clientData, balance: clientData.balance ?? 0, created_at: now, updated_at: now, user_id: user.id }]);
      if (error) {
        toast({ title: "Error al crear cliente", description: error.message });
      } else {
        toast({ title: "Cliente creado correctamente" });
        fetchClients();
      }
    }
  };

  // Eliminar Cliente de Supabase
  const handleDeleteClient = async (clientId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este cliente? Se eliminarán también todas sus transacciones.")) {
      // 1. Eliminar transacciones asociadas
      const { error: txError } = await supabase
        .from("transactions")
        .delete()
        .eq("client_id", clientId)
        .eq("user_id", user.id);
      if (txError) {
        toast({ title: "Error al eliminar transacciones", description: txError.message });
        return;
      }
      // 2. Eliminar cliente
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientId)
        .eq("user_id", user.id);
      if (error) {
        toast({ title: "Error al eliminar cliente", description: error.message });
      } else {
        toast({ title: "Cliente eliminado correctamente" });
        fetchClients();
      }
    }
  };

  const handleAddTransaction = (clientId: string, type: 'debt' | 'payment') => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setTransactionType(type);
      setShowTransactionForm(true);
    }
  };

  const handleSaveTransaction = async (transactionData: {
    clientId: string;
    type: 'debt' | 'payment';
    amount: number;
    description: string;
    date: string;
  }) => {
    if (!user) {
      toast({ title: "Error", description: "No hay usuario autenticado." });
      return;
    }

    // 1. Guardar la transacción en Supabase
    const { error: insertError } = await supabase
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

    if (insertError) {
      toast({ title: "Error al registrar transacción", description: insertError.message });
      return;
    }

    // 2. Actualizar el balance del cliente en Supabase
    const client = clients.find(c => c.id === transactionData.clientId);
    if (client) {
      const balanceChange = transactionData.type === 'debt'
        ? transactionData.amount
        : -transactionData.amount;

      const { error: updateError } = await supabase
        .from("clients")
        .update({ balance: client.balance + balanceChange, updated_at: new Date().toISOString() })
        .eq("id", client.id);

      if (updateError) {
        toast({ title: "Transacción guardada, pero error al actualizar balance", description: updateError.message });
      } else {
        toast({ title: `${transactionData.type === 'debt' ? 'Deuda' : 'Abono'} registrado correctamente` });
        fetchClients();
      }
    }
    setShowTransactionForm(false);
    fetchTransactions();
  };

  const handleViewTransactions = (clientId: string) => {
    navigate(`/transactions?client=${clientId}`);
  };

  const filteredClients = Array.isArray(clients) ? clients.filter(client =>
    (client.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
    (client.email?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
    (String(client.phone ?? "")).includes(searchTerm)
  ) : [];

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Gestión de Clientes
          </h1>
          <p className="text-muted-foreground">
            Administra tus clientes y sus cuentas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowClientForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
          {clients.length > 0 && (
            <Button onClick={() => setShowGeneralReceipt(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Recibo General
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Clients Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={(client) => {
                setEditingClient(client);
                setShowClientForm(true);
              }}
              onDelete={handleDeleteClient}
              onAddTransaction={handleAddTransaction}
              onViewTransactions={handleViewTransactions}
              onShowReceipt={() => {
                setReceiptClient(client);
                setShowReceipt(true);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12">
          <Users className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza agregando tu primer cliente'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowClientForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Cliente
            </Button>
          )}
        </div>
      )}

      {/* Forms */}
      <ClientForm
        open={showClientForm}
        onOpenChange={setShowClientForm}
        client={editingClient}
        onSave={handleSaveClient}
      />

      <TransactionForm
        open={showTransactionForm}
        onOpenChange={setShowTransactionForm}
        client={selectedClient}
        type={transactionType}
        onSave={handleSaveTransaction}
      />

      {/* Modal de recibo */}
      {receiptClient && (
        <ReceiptModal
          open={showReceipt}
          onOpenChange={setShowReceipt}
          client={receiptClient}
          transactions={transactions.filter(t => t.clientId === receiptClient.id)}
        />
      )}

      {/* Modal Recibo General */}
      <ReceiptGeneralModal
        open={showGeneralReceipt}
        onOpenChange={setShowGeneralReceipt}
        clients={clients}
        transactions={transactions}
      />
    </div>
  );
};