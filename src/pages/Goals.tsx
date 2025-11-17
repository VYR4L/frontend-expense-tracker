import React, { useState, useEffect } from 'react';
import { getUserGoals, createGoal, updateGoal, deleteGoal } from '../api/goalsAPI';
import { getCurrentUser } from '../api/usersAPI';
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
import { CircularProgress } from '@mui/material';

interface GoalFormData {
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
  category: string;
}

const AVAILABLE_COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#4CAF50', '#FF9800', '#E91E63', '#3F51B5', '#009688',
];

export const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error'
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        setUserId(user.id);
        
        const data = await getUserGoals(user.id.toString());
        // Corrige o mapeamento dos campos para o formato esperado pelo frontend
        const mappedGoals = data.map((goal: any) => ({
          id: goal.id.toString(),
          name: goal.name,
          targetAmount: Number(goal.target_amount),
          currentAmount: Number(goal.current_amount),
          icon: goal.icon || '',
          color: goal.color,
          category: goal.category || 'default',
        }));
        setGoals(mappedGoals);
      } catch (error) {
        console.error('Erro ao carregar metas:', error);
        showSnackbar('Erro ao carregar metas', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGoals();
  }, []);

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

  const handleDelete = async (id: string) => {
    try {
      await deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      showSnackbar('Meta excluída com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      showSnackbar('Erro ao excluir meta', 'error');
    }
  };

  const onSubmit = async (data: GoalFormData) => {
    try {
      if (!userId) return;
      
      const goalData = {
        user_id: userId,
        name: data.name,
        target_amount: Number(data.targetAmount),
        current_amount: Number(data.currentAmount),
        icon: data.icon,
        color: data.color,
      };
      
      if (editingGoal) {
        await updateGoal(editingGoal.id, goalData);
        setGoals((prev) =>
          prev.map((g) =>
            g.id === editingGoal.id
              ? { 
                  id: g.id,
                  name: data.name,
                  targetAmount: Number(data.targetAmount),
                  currentAmount: Number(data.currentAmount),
                  icon: data.icon,
                  color: data.color,
                  category: data.category
                }
              : g
          )
        );
        showSnackbar('Meta atualizada com sucesso!', 'success');
      } else {
        const newGoalData = await createGoal(goalData);
        const newGoal: Goal = {
          id: newGoalData.id.toString(),
          name: newGoalData.name,
          targetAmount: newGoalData.target_amount,
          currentAmount: newGoalData.current_amount || 0,
          icon: newGoalData.icon || '',
          color: newGoalData.color,
          category: data.category,
        };
        setGoals((prev) => [newGoal, ...prev]);
        showSnackbar('Meta criada com sucesso!', 'success');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      showSnackbar('Erro ao salvar meta', 'error');
    }
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
        <Typography variant="h4" fontWeight={700}>
          Metas Financeiras
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
            disabled={goals.length === 0}
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
                  <CategoryIcon category={goal.icon} />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={goal.name}
                secondaryTypographyProps={{ component: 'div' }}
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Box sx={{ display: 'flex', flexDirection: {xs: 'column', md:'row', lg:'row'}, gap: 0.5, mb: 1 }}>
                      <Chip
                        label={`Alvo: R$ ${Number(goal.targetAmount).toFixed(2)}`}
                        size="small"
                        color={Number(goal.currentAmount) >= Number(goal.targetAmount) ? 'success' : 'default'}
                        variant='outlined'
                        sx={{ width: 'fit-content' }}
                      />
                      <Chip
                        label={`Atual: R$ ${Number(goal.currentAmount).toFixed(2)}`}
                        size="small"
                        color="info"
                        variant='outlined'
                        sx={{ width: 'fit-content' }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100, 100)}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'action.hover',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              backgroundColor: Number(goal.currentAmount) >= Number(goal.targetAmount)
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
                        {Math.min(((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100), 100).toFixed(0)}%
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