import axios from 'axios';
import { URL, authHeader } from './utils/authHeader';

export const getBalance = async (userId: string, ) => {
  const response = await axios.get(`${URL}/balances/${userId}`, {
    headers: authHeader()
  });
  return response.data;
}