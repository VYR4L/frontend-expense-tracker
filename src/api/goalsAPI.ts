import axios from 'axios';
import { URL, authHeader } from './utils/authHeader';

type Goal = {
  user_id: number;
  name: string;
  target_amount: number;
  current_amount?: number;
  icon?: string;
  color: string;
}

export const createGoal = async (goal: Goal, ) => {
  const response = await axios.post(`${URL}/goals/`, goal, {
    headers: authHeader()
  });
  return response.data;
}

export const getUserGoals = async (userId: string, ) => {
  const response = await axios.get(`${URL}/goals/user/${userId}`, {
    headers: authHeader()
  });
  return response.data;
}

export const updateGoal = async (goalId: string, updates: Partial<Goal>, ) => {
  const response = await axios.put(`${URL}/goals/${goalId}`, updates, {
    headers: authHeader()
  });
  return response.data;
}

export const deleteGoal = async (goalId: string, ) => {
  const response = await axios.delete(`${URL}/goals/${goalId}`, {
    headers: authHeader()
  });
  return response.data;
}