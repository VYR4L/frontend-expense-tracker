import axios from 'axios';
import { URL, authHeader } from './utils/authHeader';

type Transaction = {
  user_id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: number;
  date: string;
};

export const createTransaction = async (transaction: Transaction, ) => {
  const response = await axios.post(`${URL}/transactions`, transaction, {
    headers: authHeader()
  });
  return response.data;
}

export const getPaginatedUserTransactions = async (page: number, limit: number, ) => {
  const response = await axios.get(`${URL}/transactions/?page=${page}&limit=${limit}`, {
    headers: authHeader()
  });
  return response.data;
}

export const updateTransaction = async (transactionId: string, updates: Partial<Transaction>, ) => {
  const response = await axios.put(`${URL}/transactions/${transactionId}`, updates, {
    headers: authHeader()
  });
  return response.data;
}

export const deleteTransaction = async (transactionId: string, ) => {
  const response = await axios.delete(`${URL}/transactions/${transactionId}`, {
    headers: authHeader()
  });
  return response.data;
}