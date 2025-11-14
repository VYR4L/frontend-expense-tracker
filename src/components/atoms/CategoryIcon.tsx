import React from 'react';
import {
  Restaurant,
  DirectionsCar,
  Home,
  LocalHospital,
  School,
  ShoppingCart,
  Flight,
  Theaters,
  FitnessCenter,
  Pets,
  Build,
  AccountBalance,
  CreditCard,
  Savings,
  TrendingUp,
  CardGiftcard,
  LocalGasStation,
  Phone,
  Wifi,
  Category as CategoryIconMui,
} from '@mui/icons-material';
import type { SvgIconProps } from '@mui/material';

interface CategoryIconProps extends SvgIconProps {
  category: string;
}

const iconMap: Record<string, React.ComponentType<SvgIconProps>> = {
  alimentacao: Restaurant,
  'alimentação': Restaurant,
  transporte: DirectionsCar,
  moradia: Home,
  saude: LocalHospital,
  'saúde': LocalHospital,
  educacao: School,
  'educação': School,
  compras: ShoppingCart,
  viagem: Flight,
  lazer: Theaters,
  entretenimento: Theaters,
  esporte: FitnessCenter,
  'pet': Pets,
  'pets': Pets,
  manutencao: Build,
  'manutenção': Build,
  investimento: TrendingUp,
  investimentos: TrendingUp,
  'salário': AccountBalance,
  salario: AccountBalance,
  presente: CardGiftcard,
  presentes: CardGiftcard,
  combustivel: LocalGasStation,
  'combustível': LocalGasStation,
  telefone: Phone,
  internet: Wifi,
  cartao: CreditCard,
  'cartão': CreditCard,
  poupanca: Savings,
  'poupança': Savings,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, ...props }) => {
  const categoryLower = category.toLowerCase().trim();
  const IconComponent = iconMap[categoryLower] || CategoryIconMui;

  return <IconComponent {...props} />;
};
