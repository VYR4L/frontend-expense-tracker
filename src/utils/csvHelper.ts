import Papa from 'papaparse';
import { format } from 'date-fns';
import type { Transaction, Category } from '../types';

/**
 * Exporta transações para um arquivo CSV
 * @param transactions - Array de transações a serem exportadas
 * @param filename - Nome do arquivo (sem extensão)
 */
export const exportTransactionsToCSV = (transactions: Transaction[], filename = 'transacoes'): void => {
  // Preparar dados para CSV
  const csvData = transactions.map((transaction) => ({
    Data: format(new Date(transaction.date), 'dd/MM/yyyy'),
    Descrição: transaction.description,
    Categoria: transaction.category,
    Tipo: transaction.type === 'income' ? 'Entrada' : 'Saída',
    Valor: transaction.amount.toFixed(2),
  }));

  // Converter para CSV
  const csv = Papa.unparse(csvData, {
    quotes: true,
    delimiter: ',',
    header: true,
  });

  // Criar blob e fazer download
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exporta categorias para um arquivo CSV
 * @param categories - Array de categorias a serem exportadas
 * @param filename - Nome do arquivo (sem extensão)
 */
export const exportCategoriesToCSV = (categories: Category[], filename = 'categorias'): void => {
  const csvData = categories.map((category) => ({
    Nome: category.name,
    Ícone: category.icon,
    Cor: category.color,
    Tipo: category.type === 'income' ? 'Entrada' : 'Saída',
  }));

  const csv = Papa.unparse(csvData, {
    quotes: true,
    delimiter: ',',
    header: true,
  });

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

interface ImportResult<T> {
  success: boolean;
  data?: T[];
  errors?: string[];
}

/**
 * Importa transações de um arquivo CSV
 * @param file - Arquivo CSV
 * @returns Promise com resultado da importação
 */
export const importTransactionsFromCSV = (file: File): Promise<ImportResult<Omit<Transaction, 'id' | 'createdAt'>>> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = [];
        const data: Omit<Transaction, 'id' | 'createdAt'>[] = [];

        results.data.forEach((row: any, index: number) => {
          try {
            // Validar campos obrigatórios
            if (!row['Descrição'] || !row['Valor'] || !row['Tipo'] || !row['Categoria']) {
              errors.push(`Linha ${index + 2}: Campos obrigatórios faltando`);
              return;
            }

            // Converter data
            let date = new Date();
            if (row['Data']) {
              const dateParts = row['Data'].split('/');
              if (dateParts.length === 3) {
                date = new Date(
                  parseInt(dateParts[2]),
                  parseInt(dateParts[1]) - 1,
                  parseInt(dateParts[0])
                );
              }
            }

            // Converter tipo
            let type: 'income' | 'expense' = 'expense';
            if (row['Tipo'].toLowerCase().includes('entrada') || row['Tipo'].toLowerCase() === 'income') {
              type = 'income';
            }

            // Converter valor
            const amount = parseFloat(row['Valor'].replace(',', '.'));
            if (isNaN(amount)) {
              errors.push(`Linha ${index + 2}: Valor inválido`);
              return;
            }

            data.push({
              description: row['Descrição'],
              amount,
              type,
              category: row['Categoria'],
              date,
            });
          } catch (error) {
            errors.push(`Linha ${index + 2}: Erro ao processar dados`);
          }
        });

        if (errors.length > 0) {
          resolve({
            success: false,
            errors,
          });
        } else {
          resolve({
            success: true,
            data,
          });
        }
      },
      error: () => {
        resolve({
          success: false,
          errors: ['Erro ao ler o arquivo CSV'],
        });
      },
    });
  });
};

/**
 * Importa categorias de um arquivo CSV
 * @param file - Arquivo CSV
 * @returns Promise com resultado da importação
 */
export const importCategoriesFromCSV = (file: File): Promise<ImportResult<Omit<Category, 'id'>>> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = [];
        const data: Omit<Category, 'id'>[] = [];

        results.data.forEach((row: any, index: number) => {
          try {
            if (!row['Nome'] || !row['Tipo']) {
              errors.push(`Linha ${index + 2}: Campos obrigatórios faltando`);
              return;
            }

            let type: 'income' | 'expense' = 'expense';
            if (row['Tipo'].toLowerCase().includes('entrada') || row['Tipo'].toLowerCase() === 'income') {
              type = 'income';
            }

            data.push({
              name: row['Nome'],
              icon: row['Ícone'] || row['Icone'] || '',
              color: row['Cor'] || '#1976d2',
              type,
            });
          } catch (error) {
            errors.push(`Linha ${index + 2}: Erro ao processar dados`);
          }
        });

        if (errors.length > 0) {
          resolve({
            success: false,
            errors,
          });
        } else {
          resolve({
            success: true,
            data,
          });
        }
      },
      error: () => {
        resolve({
          success: false,
          errors: ['Erro ao ler o arquivo CSV'],
        });
      },
    });
  });
};
