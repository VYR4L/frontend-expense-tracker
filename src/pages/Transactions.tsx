import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { getPaginatedUserTransactions, createTransaction, updateTransaction, deleteTransaction } from '../api/transactionsAPI';
import { getUserCategories } from '../api/categoriesAPI';
import { getCurrentUser } from '../api/usersAPI';
import { Add as AddIcon, Upload as UploadIcon, Download as DownloadIcon } from '@mui/icons-material';
import { TransactionTable } from '../components/organisms/TransactionTable';
import { TransactionModal } from '../components/organisms/TransactionModal';
import { exportTransactionsToCSV, importTransactionsFromCSV } from '../utils/csvHelper';
import { autoCategorize } from '../services/categorization';
import type { Transaction, Category } from '../types';

export const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const user = await getCurrentUser();
        setUserId(user.id);
        
        const [transactionsData, categoriesData] = await Promise.all([
          getPaginatedUserTransactions(1, 10),
          getUserCategories()
        ]);
        
        // Mapear categorias da API
        const mappedCategories = categoriesData.map((cat: any) => ({
          id: cat.id.toString(),
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          type: cat.category_type as 'income' | 'expense',
        }));
        
        // A API pode retornar diretamente um array ou um objeto com items
        const transactionsList = Array.isArray(transactionsData) ? transactionsData : (transactionsData?.items || []);
        
        const processedTransactions = transactionsList.map((t: any) => ({
          id: t.id.toString(),
          description: t.description,
          amount: t.amount,
          type: t.transaction_type || t.type,
          category: mappedCategories.find((c: any) => c.id === t.category_id.toString())?.name || 'Sem categoria',
          date: new Date(t.date),
          createdAt: t.created_at ? new Date(t.created_at) : new Date(t.date),
        }));
        
        setTransactions(processedTransactions);
        setCategories(mappedCategories);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showSnackbar('Erro ao carregar transações', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleOpenModal = () => {
    setEditingTransaction(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTransaction(null);
  };

  const handleSubmit = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      if (!userId) return;
      
      const categoryId = categories.find(c => c.name === transactionData.category)?.id;
      if (!categoryId) {
        showSnackbar('Categoria inválida', 'error');
        return;
      }
      
      const apiData = {
        user_id: userId,
        description: transactionData.description,
        amount: transactionData.amount,
        transaction_type: transactionData.type,
        category_id: Number(categoryId),
        date: transactionData.date.toISOString().split('T')[0],
      };
      
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, apiData);
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === editingTransaction.id
              ? { ...transactionData, id: t.id, createdAt: t.createdAt }
              : t
          )
        );
        showSnackbar('Transação atualizada com sucesso!', 'success');
      } else {
        const newTrans = await createTransaction(apiData);
        const newTransaction: Transaction = {
          id: newTrans.id.toString(),
          description: newTrans.description,
          amount: newTrans.amount,
          type: newTrans.transaction_type || transactionData.type,
          category: transactionData.category,
          date: new Date(newTrans.date),
          createdAt: new Date(newTrans.created_at),
        };
        setTransactions((prev) => [newTransaction, ...prev]);
        showSnackbar('Transação criada com sucesso!', 'success');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      showSnackbar('Erro ao salvar transação', 'error');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      showSnackbar('Transação excluída com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      showSnackbar('Erro ao excluir transação', 'error');
    }
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
        const categoryExists = categories.some((cat) => cat.name === category);
        
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

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

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
        categories={categories}
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
