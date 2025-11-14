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
  InputAdornment,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { CategoryIcon } from '../components/atoms/CategoryIcon';
import { exportGoalsToCSV, importGoalsFromCSV } from '../utils/csvHelper';
import { useForm, Controller } from 'react-hook-form';
import type { Goal } from '../types';

interface GoalFormData {
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
  category: string;
}

const INITIAL_GOALS: Goal[] = [
  { id: '1', name: 'Comprar um PC Gamer', targetAmount: 5000, currentAmount: 1500, icon: 'computer', color: '#FF5733', category: 'Eletrônicos' },
  { id: '2', name: 'Viagem para a Europa', targetAmount: 8000, currentAmount: 3000, icon: 'flight', color: '#33C1FF', category: 'Viagem' },
];

const AVAILABLE_COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#4CAF50', '#FF9800', '#E91E63', '#3F51B5', '#009688',
];

export const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error'
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalFormData>({
    defaultValues: {
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      icon: '',
      color: '',
      category: '',
    },
  });

  const handleOpenModal = () => {
    setEditingGoal(null);
    reset({
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      icon: '',
      color: '#FF6384',
      category: 'Poupança',
    });
    setModalOpen(true);
  }

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingGoal(null);
    reset();
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    reset({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      icon: goal.icon,
      color: goal.color,
      category: goal.category,
    });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    showSnackbar('Meta excluída com sucesso!', 'success');
  };

  const onSubmit = (data: GoalFormData) => {
    if (editingGoal) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === editingGoal.id
            ? { ...data, id: g.id }
            : g
        )
      );
      showSnackbar('Meta atualizada com sucesso!', 'success');
    } else {
      const newGoal: Goal = {
        ...data,
        id: Date.now().toString(),
      };
      setGoals((prev) => [newGoal, ...prev]);
      showSnackbar('Meta criada com sucesso!', 'success');
    }
    handleCloseModal();
  };

  const handleExport = () => {
    exportGoalsToCSV(goals);
    showSnackbar('Metas exportadas com sucesso!', 'success');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await importGoalsFromCSV(file);

    if (result.success && result.data) {
      const importedGoals = result.data.map((data) => ({
        ...data,
        id: Date.now().toString() + Math.random(),
      }));
      setGoals((prev) => [...prev, ...importedGoals]);
      showSnackbar('Metas importadas com sucesso!', 'success');
    } else {
      showSnackbar(
        `Erro ao importar: ${result.errors?.join(', ') || 'Erro desconhecido'}`,
        'error'
      );
    }

    event.target.value = '';
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', md: 'center' },
        gap: 2,
        mb: 3
      }}>
        <Typography variant='h4' fontWeight={700}>
          Metas Financeiras
        </Typography>

        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1,
        }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={goals.length === 0}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Exportar CSV
          </Button>

          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            disabled={goals.length === 0}
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
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            disabled={goals.length === 0}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Nova Meta
          </Button>

        </Box>
      </Box>
      <Paper>
        <List>
          {goals.map((goal) => (
            <ListItem
              key={goal.id}
              secondaryAction={
                <Box>
                  <Tooltip title="Editar meta">
                    <IconButton
                      edge="end"
                      aria-label={`Editar meta: ${goal.name}`}
                      onClick={() => handleEdit(goal)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir meta">
                    <IconButton
                      edge="end"
                      aria-label={`Excluir meta: ${goal.name}`}
                      onClick={() => handleDelete(goal.id)}
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
                    backgroundColor: goal.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CategoryIcon category={goal.category} />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={goal.name}
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip
                        label={`Alvo: R$ ${goal.targetAmount.toFixed(2)}`}
                        size="small"
                        color={goal.currentAmount >= goal.targetAmount ? 'success' : 'default'}
                        variant='outlined'
                      />
                      <Chip
                        label={`Atual: R$ ${goal.currentAmount.toFixed(2)}`}
                        size="small"
                        color="info"
                        variant='outlined'
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'action.hover',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              backgroundColor: goal.currentAmount >= goal.targetAmount
                                ? 'success.main'
                                : goal.color,
                            },
                          }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ minWidth: 40, fontWeight: 600 }}
                      >
                        {Math.min(((goal.currentAmount / goal.targetAmount) * 100), 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Modal de Criar/Editar Meta */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingGoal ? 'Editar Meta' : 'Nova Meta'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                pt: 1
              }}
            >
              <Controller
                name="name"
                control={control}
                rules={{ required: 'O nome da meta é obrigatório' }}
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
                name="targetAmount"
                control={control}
                rules={{ required: 'O valor alvo é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Valor Alvo"
                    type="number"
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                    inputProps={{
                      step: '1.00',
                      min: '0',
                    }}
                    error={!!errors.targetAmount}
                    helperText={errors.targetAmount?.message}
                  />
                )}
              />

              <Controller
                name="currentAmount"
                control={control}
                rules={{ required: 'O valor atual é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Valor Atual"
                    type="number"
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                    inputProps={{
                      step: '1.00',
                      min: '0',
                    }}
                    error={!!errors.targetAmount}
                    helperText={errors.targetAmount?.message}
                  />
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
          <DialogActions sx={{ pr: 3, pb: 2 }}>
            <Button onClick={handleCloseModal} color="inherit">
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              {editingGoal ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}