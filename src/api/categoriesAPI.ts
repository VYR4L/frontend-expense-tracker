import axios from 'axios';
import { URL, authHeader } from './utils/authHeader';

type Category = {
  name: string;
  category_type: 'income' | 'expense';
  icon: string;
  color: string;
};

export const createCategory = async (category: Category, ) => {
  const response = await axios.post(`${URL}/categories/`, category, {
    headers: authHeader()
  });
  return response.data;
}

export const getUserCategories = async () => {
  const response = await axios.get(`${URL}/categories/`, {
    headers: authHeader()
  });
  return response.data;
}

export const updateCategory = async (categoryId: string, updates: Partial<Category>, ) => {
  const response = await axios.put(`${URL}/categories/${categoryId}`, updates, {
    headers: authHeader()
  });
  return response.data;
}

export const deleteCategory = async (categoryId: string, ) => {
  const response = await axios.delete(`${URL}/categories/${categoryId}`, {
    headers: authHeader()
  });
  return response.data;
}