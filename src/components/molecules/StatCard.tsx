import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { CurrencyText } from '../atoms/CurrencyText';
import type { TransactionType } from '../../types';

interface StatCardProps {
  title: string;
  value: number;
  type?: TransactionType;
  icon?: React.ReactNode;
  subtitle?: string;
  isCount?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  type,
  icon,
  subtitle,
  isCount = false,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography color="text.secondary" variant="body2" fontWeight={500}>
              {title}
            </Typography>
            {icon && (
              <Box sx={{ color: 'primary.main', opacity: 0.7 }}>
                {icon}
              </Box>
            )}
          </Box>
          
          {isCount ? (
            <Typography variant="h4" fontWeight={500} sx={{ mb: 0.5 }}>
              {value}
            </Typography>
          ) : (
            <CurrencyText
              value={value}
              type={type}
              variant="h4"
              colorized={!!type}
              sx={{ mb: 0.5 }}
            />
          )}
          
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
