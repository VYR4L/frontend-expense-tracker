import React, { useState, useMemo } from 'react';
import { Container, Box, Paper, Typography } from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingDown,
  TrendingUp,
  Receipt,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { StatCard } from '../components/molecules/StatCard';
import { FilterBar } from '../components/molecules/FilterBar';
import type { Transaction, Category } from '../types';

// Mock data - em produção, viria de uma API ou Context
const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Alimentação', icon: 'restaurant', color: '#FF6384', type: 'expense' },
  { id: '2', name: 'Transporte', icon: 'directions_car', color: '#36A2EB', type: 'expense' },
  { id: '3', name: 'Moradia', icon: 'home', color: '#FFCE56', type: 'expense' },
  { id: '4', name: 'Saúde', icon: 'local_hospital', color: '#4BC0C0', type: 'expense' },
  { id: '5', name: 'Lazer', icon: 'theaters', color: '#9966FF', type: 'expense' },
  { id: '6', name: 'Salário', icon: 'account_balance', color: '#4CAF50', type: 'income' },
];

const MOCK_TRANSACTIONS: Transaction[] = [
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
  {
    id: '4',
    description: 'Aluguel',
    amount: 1500.00,
    type: 'expense',
    category: 'Moradia',
    date: new Date(2025, 10, 10),
    createdAt: new Date(),
  },
  {
    id: '5',
    description: 'Cinema',
    amount: 60.00,
    type: 'expense',
    category: 'Lazer',
    date: new Date(2025, 10, 12),
    createdAt: new Date(),
  },
];

const MONTHS = [
  'Janeiro 2025',
  'Fevereiro 2025',
  'Março 2025',
  'Abril 2025',
  'Maio 2025',
  'Junho 2025',
  'Julho 2025',
  'Agosto 2025',
  'Setembro 2025',
  'Outubro 2025',
  'Novembro 2025',
  'Dezembro 2025',
];

export const Dashboard: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('Novembro 2025');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Calcular métricas
  const metrics = useMemo(() => {
    const income = MOCK_TRANSACTIONS
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = MOCK_TRANSACTIONS
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      currentBalance: income - expenses,
      monthlyExpenses: expenses,
      monthlyIncome: income,
      transactionCount: MOCK_TRANSACTIONS.length,
    };
  }, []);

  // Dados para o gráfico de pizza (Gastos por Categoria)
  const pieChartData = useMemo(() => {
    const categoryTotals: Record<string, { value: number; color: string }> = {};

    MOCK_TRANSACTIONS
      .filter((t) => t.type === 'expense')
      .forEach((transaction) => {
        if (!categoryTotals[transaction.category]) {
          const category = MOCK_CATEGORIES.find((c) => c.name === transaction.category);
          categoryTotals[transaction.category] = {
            value: 0,
            color: category?.color || '#999999',
          };
        }
        categoryTotals[transaction.category].value += transaction.amount;
      });

    return Object.entries(categoryTotals).map(([name, data]) => ({
      name,
      value: data.value,
      color: data.color,
    }));
  }, []);

  // Dados para o gráfico de linha (Evolução Mensal)
  const lineChartData = [
    { month: 'Jul', income: 5000, expense: 3500 },
    { month: 'Ago', income: 5200, expense: 3800 },
    { month: 'Set', income: 5000, expense: 3200 },
    { month: 'Out', income: 5500, expense: 4000 },
    { month: 'Nov', income: 5000, expense: 1935.5 },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Dashboard
      </Typography>

      <FilterBar
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={MOCK_CATEGORIES}
        months={MONTHS}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <StatCard
          title="Saldo Atual"
          value={metrics.currentBalance}
          icon={<AccountBalanceWallet />}
          subtitle="Diferença entre entradas e saídas"
        />

        <StatCard
          title="Gastos no Mês"
          value={metrics.monthlyExpenses}
          type="expense"
          icon={<TrendingDown />}
          subtitle="Total de saídas"
        />

        <StatCard
          title="Entradas no Mês"
          value={metrics.monthlyIncome}
          type="income"
          icon={<TrendingUp />}
          subtitle="Total de entradas"
        />

        <StatCard
          title="Transações"
          value={metrics.transactionCount}
          icon={<Receipt />}
          subtitle="Total de transações"
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* Gráfico de Pizza - Gastos por Categoria */}
        <Box>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Gastos por Categoria
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(value)
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </motion.div>
        </Box>

        {/* Gráfico de Linha - Evolução Mensal */}
        <Box>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Evolução Mensal
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(value)
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#4CAF50"
                    strokeWidth={2}
                    name="Entradas"
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#f44336"
                    strokeWidth={2}
                    name="Saídas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </motion.div>
        </Box>
      </Box>
    </Container>
  );
};
