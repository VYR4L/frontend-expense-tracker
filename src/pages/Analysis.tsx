import React, { useState, useMemo, useEffect } from 'react';
import { Container, Box, Paper, Typography, FormControl, InputLabel, Select, MenuItem, useTheme, CircularProgress } from '@mui/material';
import { getPaginatedUserTransactions } from '../api/transactionsAPI';
import { getUserCategories } from '../api/categoriesAPI';
import { getBalance } from '../api/balancesAPI';
import {
  TrendingDown,
  TrendingUp,
  AccountBalance,
  Assessment,
} from '@mui/icons-material';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import type { Transaction, HeatmapData, ForecastData } from '../types';
import type { SelectChangeEvent } from '@mui/material';
import { useThemeMode } from '../context/ThemeContext';
import { StatCard } from '../components/molecules/StatCard';

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

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const SpendsHeatmap: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth();
  const monthsWithYear = MONTHS.map(m => `${m.full} ${currentYear}`);
  const [selectedMonth, setSelectedMonth] = useState(monthsWithYear[currentMonthIdx]);
  const [selectedYear] = useState(currentYear);
  const { mode } = useThemeMode();
  const theme = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [, setBalanceData] = useState<any>(null);
  const [, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userResp = await import('../api/usersAPI');
        const user = await userResp.getCurrentUser();
        setUserId(user.id);
        const [transactionsData, categoriesData, balanceResp] = await Promise.all([
          getPaginatedUserTransactions(1, 1000),
          getUserCategories(),
          getBalance(user.id.toString())
        ]);
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
        setBalanceData(balanceResp);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedMonthIdx = useMemo(() => {
    const normalized = selectedMonth.replace(` ${currentYear}`, '').trim();
    return MONTHS.findIndex(m => m.full === normalized);
  }, [selectedMonth, currentYear]);

  const heatmapData = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonthIdx, 1);
    const lastDay = new Date(selectedYear, selectedMonthIdx + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    const totalDays = firstDayOfWeek + daysInMonth;
    const weeksCount = Math.ceil(totalDays / 7);
    const seriesData: HeatmapData[] = DAYS_OF_WEEK.map((day) => ({
      name: day,
      data: [],
    }));
    for (let week = 0; week < weeksCount; week++) {
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const dayNumber = week * 7 + dayOfWeek - firstDayOfWeek + 1;
        if (dayNumber >= 1 && dayNumber <= daysInMonth) {
          const totalSpend = transactions
            .filter((t) => 
              t.type === 'expense' &&
              t.date.getFullYear() === selectedYear &&
              t.date.getMonth() === selectedMonthIdx &&
              t.date.getDate() === dayNumber
            )
            .reduce((sum, t) => sum + t.amount, 0);
          seriesData[dayOfWeek].data.push({
            x: `Dia ${dayNumber}`,
            y: totalSpend,
          });
        } else {
          seriesData[dayOfWeek].data.push({
            x: ``,
            y: 0,
          });
        }
      }
    }
    return seriesData;
  }, [selectedMonthIdx, selectedYear, transactions]);

  // Calcular previsão usando dados da API se disponíveis
  const forecast: ForecastData = useMemo(() => {
    // Filtra transações do mês selecionado
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(selectedYear, selectedMonthIdx + 1, 0).getDate();
    const daysRemaining = daysInMonth - currentDay;
    const monthTransactions = transactions.filter(
      t => t.date.getFullYear() === selectedYear && t.date.getMonth() === selectedMonthIdx
    );
    const totalSpent = monthTransactions
      .filter(t => t.type === 'expense' && t.date.getDate() <= currentDay)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = monthTransactions
      .filter(t => t.type === 'income' && t.date.getDate() <= currentDay)
      .reduce((sum, t) => sum + t.amount, 0);
    // Se não há receita, não faz projeção
    let dailyAverage = 0;
    let projectedTotal = 0;
    let projectedBalance = 0;
    if (totalIncome > 0) {
      dailyAverage = currentDay > 0 ? totalSpent / currentDay : 0;
      projectedTotal = totalSpent + (dailyAverage * daysRemaining);
      projectedBalance = totalIncome - projectedTotal;
    }
    return {
      totalSpent,
      dailyAverage,
      daysRemaining,
      projectedTotal,
      totalIncome,
      projectedBalance,
    };
  }, [selectedMonthIdx, selectedYear, transactions]);

  // Dados para o gráfico de área (histórico + projeção)
  const forecastChartData = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(selectedYear, selectedMonthIdx + 1, 0).getDate();
    const historicalData: number[] = [];
    const projectedData: number[] = [];
    const categories: string[] = [];
    let cumulativeSpent = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      categories.push(`${day}`);
      if (day <= currentDay) {
        const daySpent = transactions
          .filter((t) => 
            t.type === 'expense' &&
            t.date.getFullYear() === selectedYear &&
            t.date.getMonth() === selectedMonthIdx &&
            t.date.getDate() === day
          )
          .reduce((sum, t) => sum + t.amount, 0);
        cumulativeSpent += daySpent;
        historicalData.push(cumulativeSpent);
        projectedData.push(null as any);
      } else {
        // Só projeta se houver receita
        if (forecast.totalIncome > 0) {
          cumulativeSpent += forecast.dailyAverage;
          historicalData.push(null as any);
          projectedData.push(cumulativeSpent);
        } else {
          historicalData.push(null as any);
          projectedData.push(null as any);
        }
      }
    }
    return {
      series: [
        {
          name: 'Gastos Reais',
          data: historicalData,
        },
        {
          name: 'Projeção',
          data: projectedData,
        },
      ],
      categories,
    };
  }, [selectedMonthIdx, selectedYear, forecast.dailyAverage, forecast.totalIncome]);

  const forecastChartOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: 'area',
      toolbar: {
        show: false,
      },
      background: 'transparent',
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.6,
        opacityTo: 0.1,
      },
    },
    xaxis: {
      categories: forecastChartData.categories,
      title: {
        text: 'Dia do Mês',
        style: {
          color: mode === 'dark' ? '#ffffff' : '#000000',
        },
      },
      labels: {
        style: {
          colors: mode === 'dark' ? '#ffffff' : '#000000',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Gastos Acumulados (R$)',
        style: {
          color: mode === 'dark' ? '#ffffff' : '#000000',
        },
      },
      labels: {
        style: {
          colors: mode === 'dark' ? '#ffffff' : '#000000',
        },
        formatter: (value: number) => `R$ ${value.toFixed(0)}`,
      },
    },
    tooltip: {
      theme: mode,
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => value ? `R$ ${value.toFixed(2)}` : '',
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: mode === 'dark' ? '#ffffff' : '#000000',
      },
    },
    colors: [theme.palette.primary.main, theme.palette.warning.main],
    grid: {
      borderColor: theme.palette.divider,
    },
  }), [mode, forecastChartData.categories, theme]);

  const chartOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: 'heatmap',
      toolbar: {
        show: false,
      },
      background: 'transparent',
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        radius: 2,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 0,
              color: theme.palette.action.hover,
              name: 'Sem gastos',
            },
            {
              from: 0.01,
              to: 500,
              color: theme.palette.primary.light,
              name: 'Baixo',
            },
            {
              from: 500.01,
              to: 1000,
              color: theme.palette.primary.main,
              name: 'Médio',
            },
            {
              from: 1000.01,
              to: 10000000,
              color: theme.palette.primary.dark,
              name: 'Alto',
            },
          ],
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: 'category',
      labels: {
        style: {
          colors: mode === 'dark' ? '#ffffff' : '#000000',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: mode === 'dark' ? '#ffffff' : '#000000',
        },
      },
    },
    tooltip: {
      theme: mode,
      y: {
        formatter: (value: number) => `R$ ${value.toFixed(2)}`,
      },
    },
    legend: {
      show: false,
    },
  }), [mode, theme]);

  const handleMonthChange = (event: SelectChangeEvent<string>) => {
    setSelectedMonth(event.target.value as string);
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
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Análise e Previsão de Gastos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Histórico, padrões e projeções financeiras
          </Typography>
        </Box>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="month-select-label">Mês</InputLabel>
          <Select
            labelId="month-select-label"
            value={selectedMonth}
            label="Mês"
            onChange={handleMonthChange}
          >
            {monthsWithYear.map((monthLabel) => (
              <MenuItem key={monthLabel} value={monthLabel}>
                {monthLabel}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Forecast Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
        <StatCard
          title="Gasto até Hoje"
          value={forecast.totalSpent}
          type="expense"
          icon={<TrendingDown />}
          subtitle={`Média diária: R$ ${forecast.dailyAverage.toFixed(2)}`}
        />

        <StatCard
          title="Projeção Fim do Mês"
          value={forecast.projectedTotal}
          icon={<Assessment />}
          subtitle={`Faltam ${forecast.daysRemaining} dias`}
        />

        <StatCard
          title="Receita Total"
          value={forecast.totalIncome}
          type="income"
          icon={<TrendingUp />}
          subtitle="Entradas do mês"
        />

        <StatCard
          title="Saldo Projetado"
          value={forecast.projectedBalance}
          icon={<AccountBalance />}
          subtitle="Estimativa final"
        />
      </Box>

      {/* Gráfico de Previsão */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Tendência de Gastos
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Gastos acumulados com projeção baseada na média móvel
        </Typography>
        <Chart
          options={forecastChartOptions}
          series={forecastChartData.series}
          type="area"
          height={300}
        />
      </Paper>

      {/* Heatmap */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Mapa de Calor - Gastos Diários
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Visualização estilo GitHub dos seus gastos por dia da semana
        </Typography>
        <Chart
          options={chartOptions}
          series={heatmapData}
          type="heatmap"
          height={300}
        />
        
        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Legenda:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', borderRadius: 0.5 }} />
            <Typography variant="caption" color="text.secondary">Sem gastos</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: 'primary.light', borderRadius: 0.5 }} />
            <Typography variant="caption" color="text.secondary">R$ 0-500</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: 'primary.main', borderRadius: 0.5 }} />
            <Typography variant="caption" color="text.secondary">R$ 500-1000</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: 'primary.dark', borderRadius: 0.5 }} />
            <Typography variant="caption" color="text.secondary">R$ 1000+</Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};