# 💰 Expense Tracker - Painel de Controle de Gastos Pessoais

Um painel moderno e completo para gerenciamento de gastos pessoais, desenvolvido com React, TypeScript e Material-UI.

## 🚀 Tecnologias

- **React 19** com TypeScript
- **Material-UI (MUI)** - Sistema de Design
- **Recharts** - Gráficos interativos
- **Framer Motion** - Animações suaves
- **React Hook Form** - Gerenciamento de formulários
- **React Router** - Navegação entre páginas
- **PapaParse** - Importação/Exportação CSV
- **date-fns** - Manipulação de datas

## ✨ Features

### 📊 Dashboard Principal
- Cards com métricas em tempo real
- Gráfico de Pizza: Gastos por categoria
- Gráfico de Linha: Evolução mensal
- Filtros por mês e categoria

### 💳 Transações
- CRUD completo de transações
- Importar/Exportar CSV
- Categorização automática

### 🏷️ Categorias
- CRUD de categorias
- Ícones e cores personalizados
- Importar/Exportar CSV

### 🌗 Modo Escuro
- Persistência em localStorage
- Transição suave entre temas

## 🚀 Como Executar

```bash
# Instalação
npm install

# Desenvolvimento
npm run dev

# Build de Produção
npm run build

# Preview da Build
npm run preview
```

A aplicação estará disponível em `http://localhost:5173`

## 🎯 Funcionalidades Especiais

### Categorização Automática
Sistema inteligente que sugere categorias baseado em palavras-chave:
- "iFood" → Alimentação
- "Uber" → Transporte
- "Aluguel" → Moradia

### Import/Export CSV
Formato esperado para importação de transações:
```csv
Data,Descrição,Categoria,Tipo,Valor
13/11/2025,Supermercado,Alimentação,Saída,350.50
```

## 📝 Licença

MIT

---

**Demo Mode**: Use qualquer email e senha para fazer login! 🎉
