export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: Date;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryExpense {
  category: string;
  value: number;
  color: string;
}

export interface DashboardMetrics {
  currentBalance: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  totalExpenses: number;
}
