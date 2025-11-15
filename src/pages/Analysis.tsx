import React, { useState, useMemo } from 'react';
import { Container, Box, Paper, Typography, FormControl, InputLabel, Select, MenuItem, useTheme } from '@mui/material';
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

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const SpendsHeatmap: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(10);
  const [selectedYear] = useState(2025);
  const { mode } = useThemeMode();
  const theme = useTheme();

  const heatmapData = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
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
          const totalSpend = MOCK_TRANSACTIONS
            .filter((t) => 
              t.type === 'expense' &&
              t.date.getFullYear() === selectedYear &&
              t.date.getMonth() === selectedMonth &&
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
  }, [selectedMonth, selectedYear]);

  // Calcular previsão
  const forecast: ForecastData = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const daysRemaining = daysInMonth - currentDay;
    
    // Calcular gastos e receitas até agora
    const totalSpent = MOCK_TRANSACTIONS
      .filter((t) => 
        t.type === 'expense' &&
        t.date.getFullYear() === selectedYear &&
        t.date.getMonth() === selectedMonth &&
        t.date.getDate() <= currentDay
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = MOCK_TRANSACTIONS
      .filter((t) => 
        t.type === 'income' &&
        t.date.getFullYear() === selectedYear &&
        t.date.getMonth() === selectedMonth &&
        t.date.getDate() <= currentDay
      )
      .reduce((sum, t) => sum + t.amount, 0);
    
    const dailyAverage = totalSpent / currentDay;
    const projectedTotal = totalSpent + (dailyAverage * daysRemaining);
    const projectedBalance = totalIncome - projectedTotal;
    
    return {
      totalSpent,
      dailyAverage,
      daysRemaining,
      projectedTotal,
      totalIncome,
      projectedBalance,
    };
  }, [selectedMonth, selectedYear]);

  // Dados para o gráfico de área (histórico + projeção)
  const forecastChartData = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    
    const historicalData: number[] = [];
    const projectedData: number[] = [];
    const categories: string[] = [];
    
    let cumulativeSpent = 0;
    
    // Dados históricos
    for (let day = 1; day <= daysInMonth; day++) {
      categories.push(`${day}`);
      
      if (day <= currentDay) {
        const daySpent = MOCK_TRANSACTIONS
          .filter((t) => 
            t.type === 'expense' &&
            t.date.getFullYear() === selectedYear &&
            t.date.getMonth() === selectedMonth &&
            t.date.getDate() === day
          )
          .reduce((sum, t) => sum + t.amount, 0);
        
        cumulativeSpent += daySpent;
        historicalData.push(cumulativeSpent);
        projectedData.push(null as any);
      } else {
        // Projeção
        cumulativeSpent += forecast.dailyAverage;
        historicalData.push(null as any);
        projectedData.push(cumulativeSpent);
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
  }, [selectedMonth, selectedYear, forecast.dailyAverage]);

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

  const handleMonthChange = (event: SelectChangeEvent<number>) => {
    setSelectedMonth(event.target.value as number);
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
            {MONTHS.map((month, index) => (
              <MenuItem key={month} value={index}>
                {month}
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