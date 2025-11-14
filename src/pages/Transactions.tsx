import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Upload as UploadIcon, Download as DownloadIcon } from '@mui/icons-material';
import { TransactionTable } from '../components/organisms/TransactionTable';
import { TransactionModal } from '../components/organisms/TransactionModal';
import { exportTransactionsToCSV, importTransactionsFromCSV } from '../utils/csvHelper';
import { autoCategorize } from '../services/categorization';
import type { Transaction, Category } from '../types';

// Mock data
const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Alimentação', icon: 'restaurant', color: '#FF6384', type: 'expense' },
  { id: '2', name: 'Transporte', icon: 'directions_car', color: '#36A2EB', type: 'expense' },
  { id: '3', name: 'Moradia', icon: 'home', color: '#FFCE56', type: 'expense' },
  { id: '4', name: 'Saúde', icon: 'local_hospital', color: '#4BC0C0', type: 'expense' },
  { id: '5', name: 'Lazer', icon: 'theaters', color: '#9966FF', type: 'expense' },
  { id: '6', name: 'Salário', icon: 'account_balance', color: '#4CAF50', type: 'income' },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    description: 'Supermercado',
    amount: 350.50,
    type: 'expense',
    category: 'Alimentação',
    date: new Date(2025, 10, 5),
    createdAt: new Date(),
  },
  {
    id: '2',
    description: 'Uber',
    amount: 25.00,
    type: 'expense',
    category: 'Transporte',
    date: new Date(2025, 10, 7),
    createdAt: new Date(),
  },
  {
    id: '3',
    description: 'Salário',
    amount: 5000.00,
    type: 'income',
    category: 'Salário',
    date: new Date(2025, 10, 1),
    createdAt: new Date(),
  },
];

export const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleOpenModal = () => {
    setEditingTransaction(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTransaction(null);
  };

  const handleSubmit = (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTransaction) {
      // Editar transação existente
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingTransaction.id
            ? { ...transactionData, id: t.id, createdAt: t.createdAt }
            : t
        )
      );
      showSnackbar('Transação atualizada com sucesso!', 'success');
    } else {
      // Criar nova transação
      const newTransaction: Transaction = {
        ...transactionData,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      setTransactions((prev) => [newTransaction, ...prev]);
      showSnackbar('Transação criada com sucesso!', 'success');
    }
    handleCloseModal();
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showSnackbar('Transação excluída com sucesso!', 'success');
  };

  const handleExport = () => {
    exportTransactionsToCSV(transactions);
    showSnackbar('Transações exportadas com sucesso!', 'success');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await importTransactionsFromCSV(file);

    if (result.success && result.data) {
      const newTransactions = result.data.map((data) => {
        // Tentar categorizar automaticamente se a categoria não existir
        let category = data.category;
        const categoryExists = MOCK_CATEGORIES.some((cat) => cat.name === category);
        
        if (!categoryExists) {
          const suggestedCategory = autoCategorize(data.description);
          if (suggestedCategory) {
            category = suggestedCategory;
          }
        }

        return {
          ...data,
          category,
          id: Date.now().toString() + Math.random(),
          createdAt: new Date(),
        };
      });

      setTransactions((prev) => [...newTransactions, ...prev]);
      showSnackbar(`${newTransactions.length} transações importadas com sucesso!`, 'success');
    } else {
      showSnackbar(
        `Erro ao importar: ${result.errors?.join(', ') || 'Erro desconhecido'}`,
        'error'
      );
    }

    // Reset input
    event.target.value = '';
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        mb: 3 
      }}>
        <Typography variant="h4" fontWeight={700}>
          Transações
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1 
        }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={transactions.length === 0}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Exportar CSV
          </Button>

          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            component="label"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Importar CSV
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={handleImport}
            />
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Nova Transação
          </Button>
        </Box>
      </Box>

      <TransactionTable
        transactions={transactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <TransactionModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        transaction={editingTransaction}
        categories={MOCK_CATEGORIES}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};
