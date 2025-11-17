import axios from 'axios';
import { URL, authHeader } from './utils/authHeader';

type Credential = {
  email: string;
  password: string;
};

export const login = async (credential: Credential) => {
  try {
    const response = await axios.post(`${URL}/auth/login`, credential);
    return response.data;
  } catch (error) {
    throw error;
  }
}