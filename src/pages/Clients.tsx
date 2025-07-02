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
    loadData();
  }, []);

  const loadData = () => {
    const savedClients = localStorage.getItem('debt_app_clients');
    const savedTransactions = localStorage.getItem('debt_app_transactions');
    
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    }
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  };

  const saveClients = (updatedClients: Client[]) => {
    setClients(updatedClients);
    localStorage.setItem('debt_app_clients', JSON.stringify(updatedClients));
  };

  const saveTransactions = (updatedTransactions: Transaction[]) => {
    setTransactions(updatedTransactions);
    localStorage.setItem('debt_app_transactions', JSON.stringify(updatedTransactions));
  };

  const handleSaveClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    if (editingClient) {
      const updatedClients = clients.map(client =>
        client.id === editingClient.id
          ? { ...client, ...clientData, updatedAt: now }
          : client
      );
      saveClients(updatedClients);
      toast({ title: "Cliente actualizado correctamente" });
    } else {
      const newClient: Client = {
        ...clientData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      saveClients([...clients, newClient]);
      toast({ title: "Cliente creado correctamente" });
    }
    
    setEditingClient(null);
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      const updatedClients = clients.filter(client => client.id !== clientId);
      saveClients(updatedClients);
      
      // También eliminar las transacciones del cliente
      const updatedTransactions = transactions.filter(t => t.clientId !== clientId);
      saveTransactions(updatedTransactions);
      
      toast({ title: "Cliente eliminado correctamente" });
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

  const handleSaveTransaction = (transactionData: {
    clientId: string;
    type: 'debt' | 'payment';
    amount: number;
    description: string;
    date: string;
  }) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const updatedTransactions = [...transactions, newTransaction];
    saveTransactions(updatedTransactions);

    // Actualizar el balance del cliente
    const updatedClients = clients.map(client => {
      if (client.id === transactionData.clientId) {
        const balanceChange = transactionData.type === 'debt' 
          ? transactionData.amount 
          : -transactionData.amount;
        return {
          ...client,
          balance: client.balance + balanceChange,
          updatedAt: new Date().toISOString()
        };
      }
      return client;
    });
    
    saveClients(updatedClients);
    
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