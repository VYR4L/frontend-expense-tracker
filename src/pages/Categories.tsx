import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { CategoryIcon } from '../components/atoms/CategoryIcon';
import { exportCategoriesToCSV, importCategoriesFromCSV } from '../utils/csvHelper';
import { useForm, Controller } from 'react-hook-form';
import type { Category, TransactionType } from '../types';

interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Alimentação', icon: 'restaurant', color: '#FF6384', type: 'expense' },
  { id: '2', name: 'Transporte', icon: 'directions_car', color: '#36A2EB', type: 'expense' },
  { id: '3', name: 'Moradia', icon: 'home', color: '#FFCE56', type: 'expense' },
  { id: '4', name: 'Saúde', icon: 'local_hospital', color: '#4BC0C0', type: 'expense' },
  { id: '5', name: 'Lazer', icon: 'theaters', color: '#9966FF', type: 'expense' },
  { id: '6', name: 'Salário', icon: 'account_balance', color: '#4CAF50', type: 'income' },
];

const AVAILABLE_COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#4CAF50', '#FF9800', '#E91E63', '#3F51B5', '#009688',
];

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      icon: '',
      color: '#FF6384',
      type: 'expense',
    },
  });

  const handleOpenModal = () => {
    setEditingCategory(null);
    reset({
      name: '',
      icon: '',
      color: '#FF6384',
      type: 'expense',
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    reset();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
    });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showSnackbar('Categoria excluída com sucesso!', 'success');
  };

  const onSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...data, id: c.id }
            : c
        )
      );
      showSnackbar('Categoria atualizada com sucesso!', 'success');
    } else {
      const newCategory: Category = {
        ...data,
        id: Date.now().toString(),
      };
      setCategories((prev) => [...prev, newCategory]);
      showSnackbar('Categoria criada com sucesso!', 'success');
    }
    handleCloseModal();
  };

  const handleExport = () => {
    exportCategoriesToCSV(categories);
    showSnackbar('Categorias exportadas com sucesso!', 'success');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await importCategoriesFromCSV(file);

    if (result.success && result.data) {
      const newCategories = result.data.map((data) => ({
        ...data,
        id: Date.now().toString() + Math.random(),
      }));

      setCategories((prev) => [...prev, ...newCategories]);
      showSnackbar(`${newCategories.length} categorias importadas com sucesso!`, 'success');
    } else {
      showSnackbar(
        `Erro ao importar: ${result.errors?.join(', ') || 'Erro desconhecido'}`,
        'error'
      );
    }

    event.target.value = '';
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
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
          Categorias
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
            disabled={categories.length === 0}
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
            Nova Categoria
          </Button>
        </Box>
      </Box>

      <Paper>
        <List>
          {categories.map((category) => (
            <ListItem
              key={category.id}
              secondaryAction={
                <Box>
                  <Tooltip title="Editar categoria">
                    <IconButton
                      edge="end"
                      aria-label={`Editar categoria: ${category.name}`}
                      onClick={() => handleEdit(category)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir categoria">
                    <IconButton
                      edge="end"
                      aria-label={`Excluir categoria: ${category.name}`}
                      onClick={() => handleDelete(category.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemIcon>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: category.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  <CategoryIcon category={category.name} />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={category.name}
                secondary={
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip
                      label={category.type === 'income' ? 'Entrada' : 'Saída'}
                      size="small"
                      color={category.type === 'income' ? 'success' : 'error'}
                      variant="outlined"
                    />
                    <Chip
                      label={category.color}
                      size="small"
                      sx={{
                        backgroundColor: category.color,
                        color: '#fff',
                      }}
                    />
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Modal de Criar/Editar Categoria */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Nome é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nome"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
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
                name="color"
                control={control}
                rules={{ required: 'Cor é obrigatória' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.color}>
                    <InputLabel id="color-label">Cor</InputLabel>
                    <Select {...field} labelId="color-label" label="Cor">
                      {AVAILABLE_COLORS.map((color) => (
                        <MenuItem key={color} value={color}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                backgroundColor: color,
                              }}
                            />
                            {color}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="icon"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Ícone (opcional)"
                    fullWidth
                    helperText="Deixe em branco para usar o ícone padrão"
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseModal} color="inherit">
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              {editingCategory ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
