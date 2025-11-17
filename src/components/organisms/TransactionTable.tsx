import React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Paper, Chip, Box, IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CurrencyText } from '../atoms/CurrencyText';
import { CategoryIcon } from '../atoms/CategoryIcon';
import type { Transaction } from '../../types';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
  paginationModel?: { page: number; pageSize: number };
  onPaginationModelChange?: (model: { page: number; pageSize: number }) => void;
  rowCount?: number;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onEdit,
  onDelete,
  loading = false,
  paginationModel,
  onPaginationModelChange,
  rowCount,
}) => {
  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: 'Data',
      width: 120,
      valueFormatter: (value: Date) => {
        if (!value) return '-';
        try {
          const date = value instanceof Date ? value : new Date(value);
          if (isNaN(date.getTime())) return '-';
          return format(date, 'dd/MM/yyyy', { locale: ptBR });
        } catch {
          return '-';
        }
      },
    },
    {
      field: 'description',
      headerName: 'Descrição',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'category',
      headerName: 'Categoria',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CategoryIcon category={params.value} fontSize="small" />
          {params.value}
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: 'Tipo',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value === 'income' ? 'Entrada' : 'Saída'}
          color={params.value === 'income' ? 'success' : 'error'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'amount',
      headerName: 'Valor',
      width: 150,
      align: 'right',
      headerAlign: 'left',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <CurrencyText
            value={params.value}
            type={params.row.type}
            showSign
            variant="body2"
          />
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, height: '100%' }}>
          <Tooltip title="Editar transação">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEdit(params.row)}
              aria-label={`Editar transação: ${params.row.description}`}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir transação">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(params.row.id)}
              aria-label={`Excluir transação: ${params.row.description}`}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Paper sx={{ width: '100%', height: 600 }}>
      <DataGrid
        rows={transactions}
        columns={columns}
        loading={loading}
        pageSizeOptions={[10, 25, 50, 100]}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        rowCount={rowCount}
        paginationMode="server"
        initialState={{
          sorting: {
            sortModel: [{ field: 'date', sort: 'desc' }],
          },
        }}
        slots={{
          toolbar: GridToolbar,
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        sx={{
          border: 0,
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'action.hover',
          },
        }}
        disableRowSelectionOnClick
        density="comfortable"
      />
    </Paper>
  );
};
