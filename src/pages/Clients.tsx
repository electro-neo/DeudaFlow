import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientCard } from "@/components/ClientCard";
import { ClientForm } from "@/components/ClientForm";
import { TransactionForm } from "@/components/TransactionForm";
import { Client, Transaction } from "@/types/client";
import { Plus, Search, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showClientForm, setShowClientForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [transactionType, setTransactionType] = useState<'debt' | 'payment'>('debt');

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
    // Si quieres cargar transacciones desde Supabase, crea una función similar a fetchClients
  }, []);

  // Cargar clientes desde Supabase
  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error al cargar clientes", description: error.message });
    } else {
      setClients(data || []);
    }
  };

  // Guardar (crear o actualizar) cliente en Supabase
  const handleSaveClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();

    if (editingClient) {
      // Actualizar cliente existente
      const { error } = await supabase
        .from("clients")
        .update({ ...clientData, updated_at: now })
        .eq("id", editingClient.id);
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
        .insert([{ ...clientData, balance: 0, created_at: now, updated_at: now }]);
      if (error) {
        toast({ title: "Error al crear cliente", description: error.message });
      } else {
        toast({ title: "Cliente creado correctamente" });
        fetchClients();
      }
    }
  };

  // Eliminar cliente de Supabase
  const handleDeleteClient = async (clientId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientId);
      if (error) {
        toast({ title: "Error al eliminar cliente", description: error.message });
      } else {
        toast({ title: "Cliente eliminado correctamente" });
        fetchClients();
      }
    }
  };

  // Las siguientes funciones siguen usando el estado local para transacciones.
  // Si quieres migrar transacciones a Supabase, deberás adaptar también esas funciones.
  const handleAddTransaction = (clientId: string, type: 'debt' | 'payment') => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setTransactionType(type);
      setShowTransactionForm(true);
    }
  };

  const handleSaveTransaction = (transactionData: {
    clientId: string;
    type: 'debt' | 'payment';
    amount: number;
    description: string;
    date: string;
  }) => {
    // Aquí deberías guardar la transacción en Supabase si ya tienes la tabla creada
    // Por ahora, sigue usando localStorage/estado local
    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);

    // Actualizar el balance del cliente en Supabase
    const client = clients.find(c => c.id === transactionData.clientId);
    if (client) {
      const balanceChange = transactionData.type === 'debt'
        ? transactionData.amount
        : -transactionData.amount;
      supabase
        .from("clients")
        .update({ balance: client.balance + balanceChange, updated_at: new Date().toISOString() })
        .eq("id", client.id)
        .then(() => fetchClients());
    }

    toast({
      title: `${transactionData.type === 'debt' ? 'Deuda' : 'Abono'} registrado correctamente`
    });
  };

  const handleViewTransactions = (clientId: string) => {
    navigate(`/transactions?client=${clientId}`);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Gestión de Clientes
          </h1>
          <p className="text-muted-foreground">
            Administra tus clientes y sus cuentas
          </p>
        </div>
        <Button onClick={() => setShowClientForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
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
    </div>
  );
};