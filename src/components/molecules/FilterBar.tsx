import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Autocomplete, TextField } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { Category } from '../../types';

interface FilterBarProps {
  selectedMonth: number;
  onMonthChange: (month: number) => void;
  selectedYear: number;
  onYearChange: (year: number) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  categories: Category[];
  months: { full: string; abbr: string }[];
  years: number[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
  selectedCategory,
  onCategoryChange,
  categories,
  months,
  years,
}) => {
  const handleMonthChange = (event: SelectChangeEvent) => {
    onMonthChange(parseInt(event.target.value));
  };

  const handleYearChange = (event: SelectChangeEvent) => {
    onYearChange(parseInt(event.target.value));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
        mb: 3,
      }}
    >
      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel id="month-select-label">Mês</InputLabel>
        <Select
          labelId="month-select-label"
          id="month-select"
          value={selectedMonth.toString()}
          label="Mês"
          onChange={handleMonthChange}
        >
          {months.map((month, idx) => (
            <MenuItem key={idx} value={idx.toString()}>
              {month.full}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel id="year-select-label">Ano</InputLabel>
        <Select
          labelId="year-select-label"
          id="year-select"
          value={selectedYear.toString()}
          label="Ano"
          onChange={handleYearChange}
        >
          {years.map((year) => (
            <MenuItem key={year} value={year.toString()}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Autocomplete
        sx={{ minWidth: 200, flexGrow: 1 }}
        options={categories.map((cat) => cat.name)}
        value={selectedCategory}
        onChange={(_, newValue) => onCategoryChange(newValue)}
        renderInput={(params) => (
          <TextField {...params} label="Categoria" placeholder="Todas as categorias" />
        )}
        clearText="Limpar"
        noOptionsText="Nenhuma categoria encontrada"
      />
    </Box>
  );
};
