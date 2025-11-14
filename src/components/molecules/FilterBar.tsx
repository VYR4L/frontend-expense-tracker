import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Autocomplete, TextField } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { Category } from '../../types';

interface FilterBarProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  categories: Category[];
  months: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedMonth,
  onMonthChange,
  selectedCategory,
  onCategoryChange,
  categories,
  months,
}) => {
  const handleMonthChange = (event: SelectChangeEvent) => {
    onMonthChange(event.target.value);
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
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel id="month-select-label">Mês</InputLabel>
        <Select
          labelId="month-select-label"
          id="month-select"
          value={selectedMonth}
          label="Mês"
          onChange={handleMonthChange}
        >
          {months.map((month) => (
            <MenuItem key={month} value={month}>
              {month}
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
