import axios from 'axios';
import { URL, authHeader } from './utils/authHeader';

type User = {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
};

export const createUser = async (user: User) => {
  const response = await axios.post(`${URL}/users`, user);
  return response.data;
}

export const getCurrentUser = async () => {
  const response = await axios.get(`${URL}/users/me`, {
    headers: authHeader()
  });
  return response.data;
}

export const updateUser = async (userId: string, updates: Partial<User>, ) => {
  const response = await axios.put(`${URL}/users/${userId}`, updates, {
    headers: authHeader()
  });
  return response.data;
}

export const deleteUser = async (userId: string, ) => {
  const response = await axios.delete(`${URL}/users/${userId}`, {
    headers: authHeader()
  });
  return response.data;
}