export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  clientId: string;
  type: 'debt' | 'payment';
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}

export interface TransactionWithClient extends Transaction {
  clientName: string;
}