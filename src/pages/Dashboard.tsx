import React, { useState, useMemo, useEffect } from 'react';
import { Container, Box, Paper, Typography, CircularProgress } from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingDown,
  TrendingUp,
  Receipt,
} from '@mui/icons-material';
import { getPaginatedUserTransactions } from '../api/transactionsAPI';
import { getUserCategories } from '../api/categoriesAPI';
import { getCurrentUser } from '../api/usersAPI';
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


const MONTHS = [
  { full: 'Janeiro', abbr: 'Jan' },
  { full: 'Fevereiro', abbr: 'Fev' },
  { full: 'Março', abbr: 'Mar' },
  { full: 'Abril', abbr: 'Abr' },
  { full: 'Maio', abbr: 'Mai' },
  { full: 'Junho', abbr: 'Jun' },
  { full: 'Julho', abbr: 'Jul' },
  { full: 'Agosto', abbr: 'Ago' },
  { full: 'Setembro', abbr: 'Set' },
  { full: 'Outubro', abbr: 'Out' },
  { full: 'Novembro', abbr: 'Nov' },
  { full: 'Dezembro', abbr: 'Dez' },
];

export const Dashboard: React.FC = () => {
  // Define o mês e ano atual como valores iniciais
  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonthIdx);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [_, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar usuário atual
        const user = await getCurrentUser();
        setUserId(user.id);
        
        // Buscar dados em paralelo
        const [transactionsData, categoriesData] = await Promise.all([
          getPaginatedUserTransactions(1, 100),
          getUserCategories()
        ]);
        
        // Mapear categorias
        const mappedCategories = categoriesData.map((cat: any) => ({
          id: cat.id.toString(),
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          type: cat.category_type as 'income' | 'expense',
        }));
        
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Extrai anos únicos das transações
  const availableYears = useMemo(() => {
    const years = new Set(transactions.map(t => t.date.getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const isMonth = t.date.getMonth() === selectedMonth;
      const isYear = t.date.getFullYear() === selectedYear;
      const isCategory = selectedCategory ? t.category === selectedCategory : true;
      return isMonth && isYear && isCategory;
    });
  }, [transactions, selectedMonth, selectedYear, selectedCategory]);

  // Calcular métricas
  const metrics = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      currentBalance: income - expenses,
      monthlyExpenses: expenses,
      monthlyIncome: income,
      transactionCount: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // Dados para o gráfico de pizza (Gastos por Categoria)
  const pieChartData = useMemo(() => {
    const categoryTotals: Record<string, { value: number; color: string }> = {};

    filteredTransactions
      .filter((t) => t.type === 'expense')
      .forEach((transaction) => {
        if (!categoryTotals[transaction.category]) {
          const category = categories.find((c) => c.name === transaction.category);
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
  }, [filteredTransactions, categories]);

  // Dados para o gráfico de linha (Evolução Mensal)
  const lineChartData = useMemo(() => {
    // Agrupa transações por mês/ano
    const monthly: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((t) => {
      const monthIdx = t.date.getMonth();
      const year = t.date.getFullYear();
      const key = `${monthIdx}-${year}`;
      if (!monthly[key]) {
        monthly[key] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        monthly[key].income += t.amount;
      } else if (t.type === 'expense') {
        monthly[key].expense += t.amount;
      }
    });
    // Gera os dados para os últimos 12 meses do ano atual
    const currentYear = new Date().getFullYear();
    return MONTHS.map((m, idx) => {
      const key = `${idx}-${currentYear}`;
      return {
        month: m.abbr,
        income: monthly[key]?.income || 0,
        expense: monthly[key]?.expense || 0,
      };
    });
  }, [transactions]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Dashboard
      </Typography>

      <FilterBar
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        months={MONTHS}
        years={availableYears.length > 0 ? availableYears : [currentYear]}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <StatCard
          title="Saldo Atual"
          value={metrics.currentBalance}
          type={metrics.currentBalance >= 0 ? 'income' : 'expense'}
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
          isCount
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
            <Paper sx={{ p: 3, height: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Gastos por Categoria
              </Typography>
              {pieChartData.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 8 }}>
                  Não houveram gastos no mês/categoria selecionado.
                </Typography>
              ) : (
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
              )}
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
            <Paper sx={{ p: 3, height: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Evolução Mensal
              </Typography>
              {lineChartData.every(d => d.income === 0 && d.expense === 0) ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 8 }}>
                  Não houveram transações no ano para o mês/categoria selecionado.
                </Typography>
              ) : (
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
              )}
            </Paper>
          </motion.div>
        </Box>
      </Box>
    </Container>
  );
};
