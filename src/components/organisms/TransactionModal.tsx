import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { useForm, Controller } from 'react-hook-form';
import type { Transaction, TransactionType, Category } from '../../types';

interface TransactionFormData {
  description: string;
  amount: string;
  type: TransactionType;
  category: string;
  date: Date;
}

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  transaction?: Transaction | null;
  categories: Category[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  open,
  onClose,
  onSubmit,
  transaction,
  categories,
}) => {
  const [selectedType, setSelectedType] = useState<TransactionType>('expense');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<TransactionFormData>({
    defaultValues: {
      description: '',
      amount: '',
      type: 'expense',
      category: '',
      date: new Date(),
    },
  });

  const typeValue = watch('type');

  useEffect(() => {
    setSelectedType(typeValue);
  }, [typeValue]);

  useEffect(() => {
    if (transaction) {
      reset({
        description: transaction.description,
        amount: transaction.amount.toString(),
        type: transaction.type,
        category: transaction.category,
        date: new Date(transaction.date),
      });
      setSelectedType(transaction.type);
    } else {
      reset({
        description: '',
        amount: '',
        type: 'expense',
        category: '',
        date: new Date(),
      });
      setSelectedType('expense');
    }
  }, [transaction, reset]);

  const handleFormSubmit = (data: TransactionFormData) => {
    onSubmit({
      description: data.description,
      amount: parseFloat(data.amount),
      type: data.type,
      category: data.category,
      date: data.date,
    });
    handleClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Filtrar categorias pelo tipo selecionado
  const filteredCategories = categories.filter((cat) => cat.type === selectedType);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {transaction ? 'Editar Transação' : 'Nova Transação'}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Controller
              name="description"
              control={control}
              rules={{ required: 'Descrição é obrigatória' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Descrição"
                  placeholder="Ex: Compra no supermercado"
                  fullWidth
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />

            <Controller
              name="amount"
              control={control}
              rules={{
                required: 'Valor é obrigatório',
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message: 'Valor inválido',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Valor"
                  type="number"
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                  inputProps={{
                    step: '0.01',
                    min: '0',
                  }}
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                />
              )}
            />

            <Controller
              name="type"
              control={control}
              rules={{ required: 'Tipo é obrigatório' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.type}>
                  <InputLabel id="type-label">Tipo</InputLabel>
                  <Select {...field} labelId="type-label" label="Tipo">
                    <MenuItem value="income">Entrada</MenuItem>
                    <MenuItem value="expense">Saída</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="category"
              control={control}
              rules={{ required: 'Categoria é obrigatória' }}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  options={filteredCategories.map((cat) => cat.name)}
                  value={value || null}
                  onChange={(_, newValue) => onChange(newValue || '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Categoria"
                      error={!!errors.category}
                      helperText={errors.category?.message}
                    />
                  )}
                  noOptionsText="Nenhuma categoria disponível"
                />
              )}
            />

            <Controller
              name="date"
              control={control}
              rules={{ required: 'Data é obrigatória' }}
              render={({ field }) => (
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    {...field}
                    label="Data"
                    format="dd/MM/yyyy"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.date,
                        helperText: errors.date?.message,
                      },
                    }}
                  />
                </LocalizationProvider>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained">
            {transaction ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
