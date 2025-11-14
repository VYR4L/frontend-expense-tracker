import React from 'react';
import { Typography } from '@mui/material';
import type { TypographyProps } from '@mui/material';
import type { TransactionType } from '../../types';

interface CurrencyTextProps extends Omit<TypographyProps, 'color'> {
  value: number;
  type?: TransactionType;
  showSign?: boolean;
  colorized?: boolean;
}

export const CurrencyText: React.FC<CurrencyTextProps> = ({
  value,
  type,
  showSign = false,
  colorized = true,
  ...typographyProps
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Math.abs(amount));
  };

  const getColor = (): string | undefined => {
    if (!colorized) return undefined;
    
    if (type === 'income') return 'success.main';
    if (type === 'expense') return 'error.main';
    
    // Se não há tipo, usar cor baseada no valor
    if (value > 0) return 'success.main';
    if (value < 0) return 'error.main';
    
    return undefined;
  };

  const getSign = (): string => {
    if (!showSign) return '';
    if (type === 'income' || value > 0) return '+ ';
    if (type === 'expense' || value < 0) return '- ';
    return '';
  };

  return (
    <Typography
      color={getColor()}
      fontWeight={500}
      {...typographyProps}
    >
      {getSign()}{formatCurrency(value)}
    </Typography>
  );
};
