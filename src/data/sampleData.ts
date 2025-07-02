import { Client, Transaction } from "@/types/client";

export const sampleClients: Client[] = [
  {
    id: "1",
    name: "María González",
    email: "maria.gonzalez@email.com",
    phone: "555-123-4567",
    address: "Av. Principal 123, Ciudad",
    balance: 1500.00,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T15:30:00Z"
  },
  {
    id: "2", 
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@email.com",
    phone: "555-987-6543",
    address: "Calle Secundaria 456, Ciudad",
    balance: -500.00,
    createdAt: "2024-01-18T14:00:00Z",
    updatedAt: "2024-01-22T09:15:00Z"
  },
  {
    id: "3",
    name: "Ana Martínez",
    phone: "555-456-7890",
    address: "Plaza Central 789, Ciudad",
    balance: 750.00,
    createdAt: "2024-01-20T11:30:00Z",
    updatedAt: "2024-01-25T16:45:00Z"
  }
];

export const sampleTransactions: Transaction[] = [
  {
    id: "1",
    clientId: "1",
    type: "debt",
    amount: 2000.00,
    description: "Compra de productos para evento",
    date: "2024-01-15",
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    clientId: "1", 
    type: "payment",
    amount: 500.00,
    description: "Abono parcial",
    date: "2024-01-20",
    createdAt: "2024-01-20T15:30:00Z"
  },
  {
    id: "3",
    clientId: "2",
    type: "payment",
    amount: 1000.00,
    description: "Pago adelantado por servicios futuros",
    date: "2024-01-18",
    createdAt: "2024-01-18T14:00:00Z"
  },
  {
    id: "4",
    clientId: "2",
    type: "debt",
    amount: 500.00,
    description: "Servicios de consultoría",
    date: "2024-01-22",
    createdAt: "2024-01-22T09:15:00Z"
  },
  {
    id: "5",
    clientId: "3",
    type: "debt",
    amount: 750.00,
    description: "Productos personalizados",
    date: "2024-01-20",
    createdAt: "2024-01-20T11:30:00Z"
  }
];

export const initializeSampleData = () => {
  const existingClients = localStorage.getItem('debt_app_clients');
  const existingTransactions = localStorage.getItem('debt_app_transactions');

  if (!existingClients) {
    localStorage.setItem('debt_app_clients', JSON.stringify(sampleClients));
  }

  if (!existingTransactions) {
    localStorage.setItem('debt_app_transactions', JSON.stringify(sampleTransactions));
  }
};