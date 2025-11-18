# 💰 Expense Tracker - Frontend

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/MUI-6.3-007FFF?style=for-the-badge&logo=mui&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

<p align="center">
  Painel de controle moderno e completo para gerenciamento de despesas pessoais, desenvolvido com React, TypeScript e Material-UI.
</p>

<p align="center">
  🔗 <a href="https://vyral-expense-tracker.netlify.app">Aplicativo no ar</a>
</p>

<p align="center">
  <strong>Usuário de teste:</strong> teste@teste.com | <strong>Senha:</strong> teste123
</p>

---

## 🎯 Sobre o Projeto

Este é o frontend de um sistema de controle de despesas pessoais, com interface moderna, gráficos interativos, paginação server-side e integração completa com a API backend. O sistema permite gerenciar transações, categorias, metas e visualizar análises detalhadas dos seus gastos.

### 🔧 Principais Tecnologias

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Material-UI](https://img.shields.io/badge/MUI-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-8884D8?style=for-the-badge)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

## ✨ Características

- 🔒 Autenticação JWT com backend
- 📊 Dashboard com gráficos interativos
- 💳 Gerenciamento completo de transações com paginação server-side
- 🏷️ Sistema de categorias personalizadas
- 🎯 Metas financeiras
- 📈 Análise e previsão de gastos com heatmap
- 🌗 Modo escuro/claro
- 📤 Importação/Exportação CSV
- 🤖 Categorização automática inteligente

## 🚀 Funcionalidades

### 📊 Dashboard
- **Métricas em tempo real**: Saldo, gastos, entradas e transações do mês
- **Gráfico de Pizza**: Distribuição de gastos por categoria
- **Gráfico de Linha**: Evolução mensal de receitas e despesas
- **Filtros dinâmicos**: Por mês e categoria com atualização em tempo real

### 💳 Transações
- **CRUD completo**: Criar, editar e deletar transações
- **Paginação server-side**: Navegação eficiente entre milhares de registros
- **Tabela interativa**: Ordenação, filtro rápido e busca
- **Import/Export CSV**: Importação e exportação de dados em massa
- **Categorização automática**: Sugestão inteligente baseada em descrição

### 🏷️ Categorias
- **Gestão completa**: CRUD de categorias personalizadas
- **Customização**: Ícones e cores para cada categoria
- **Tipos**: Diferenciação entre entradas e saídas
- **Import/Export CSV**: Backup e migração de categorias

### 🎯 Metas
- **Definição de objetivos**: Metas financeiras por categoria
- **Acompanhamento visual**: Barra de progresso animada
- **Status em tempo real**: Atualização automática do progresso

### 📈 Análise e Previsão
- **Heatmap de gastos**: Visualização estilo GitHub dos gastos diários
- **Previsão financeira**: Projeção de gastos baseada na média diária
- **Gráfico de tendência**: Histórico vs projeção de gastos
- **Métricas detalhadas**: Gasto até hoje, projeção fim do mês, saldo projetado

### 🌗 Temas
- **Modo claro/escuro**: Alternância suave entre temas
- **Persistência**: Preferência salva em localStorage
- **Design responsivo**: Otimizado para desktop, tablet e mobile

## 🚀 Tecnologias Utilizadas

- **React 19** - Biblioteca JavaScript
- **TypeScript 5.5** - Tipagem estática
- **Vite 6.0** - Build tool e dev server
- **Material-UI (MUI) 6.3** - Sistema de Design
- **Recharts** - Gráficos interativos
- **ApexCharts** - Heatmaps e gráficos avançados
- **React Hook Form** - Gerenciamento de formulários
- **React Router 7** - Navegação SPA
- **Framer Motion** - Animações fluidas
- **Axios** - Cliente HTTP
- **date-fns** - Manipulação de datas
- **PapaParse** - Parsing de CSV

## 📁 Estrutura do Projeto

```
frontend-expense-tracker/
├── src/
│   ├── api/              # Chamadas à API backend
│   │   ├── utils/        # Utilitários (authHeader, etc)
│   │   ├── authAPI.ts
│   │   ├── transactionsAPI.ts
│   │   ├── categoriesAPI.ts
│   │   ├── goalsAPI.ts
│   │   └── balancesAPI.ts
│   ├── components/
│   │   ├── atoms/        # Componentes básicos
│   │   ├── molecules/    # Componentes compostos
│   │   └── organisms/    # Componentes complexos
│   ├── context/          # Contextos React (Theme)
│   ├── pages/            # Páginas da aplicação
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Transactions.tsx
│   │   ├── Categories.tsx
│   │   ├── Goals.tsx
│   │   └── Analysis.tsx
│   ├── services/         # Lógica de negócio
│   ├── styles/           # Temas e estilos
│   ├── types/            # TypeScript types
│   ├── utils/            # Funções utilitárias
│   ├── App.tsx           # Componente raiz
│   └── main.tsx          # Ponto de entrada
├── vite.config.ts        # Configuração do Vite
├── netlify.toml          # Deploy Netlify
├── package.json          # Dependências
└── README.md             # Documentação
```

## ⚙️ Configuração do Ambiente

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_BACKEND_URL=http://localhost:8000
```

Para produção, configure a variável no seu provedor de hospedagem (Netlify, Vercel, etc).

### 2. Instalação Local

Instale as dependências:

```sh
npm install
```

### 3. Execução Local

Execute o servidor de desenvolvimento:

```sh
npm run dev
```

Acesse a aplicação em [http://localhost:5173](http://localhost:5173)

### 4. Build de Produção

Gere os arquivos otimizados:

```sh
npm run build
```

Teste o build localmente:

```sh
npm run preview
```

## 🌐 Deploy

O projeto está configurado para deploy automático no Netlify:

1. Conecte o repositório ao Netlify
2. Configure a variável de ambiente `VITE_BACKEND_URL` nas configurações
3. O deploy ocorre automaticamente a cada push na branch `main`

## 🎯 Funcionalidades Especiais

### Categorização Automática
Sistema inteligente que sugere categorias baseado em palavras-chave na descrição:
- "iFood", "Restaurante" → Alimentação
- "Uber", "Taxi" → Transporte
- "Aluguel", "Condomínio" → Moradia
- "Netflix", "Cinema" → Lazer

### Paginação Server-Side
- Navegação eficiente entre milhares de registros
- Carregamento sob demanda
- Controles de página com números e reticências (< 1 2 3 ... 400 >)
- Seletor de quantidade de itens por página (10, 25, 50, 100)

### Import/Export CSV
Formato esperado para importação de transações:
```csv
Data,Descrição,Categoria,Tipo,Valor
13/11/2025,Supermercado,Alimentação,Saída,350.50
14/11/2025,Salário,Trabalho,Entrada,5000.00
```

### Filtros Dinâmicos
- Filtro por mês com seletor visual
- Filtro por categoria com dropdown
- Atualização em tempo real dos cards e gráficos
- Mensagens de fallback quando não há dados

## 🔗 Backend

Este frontend se conecta ao [Expense Tracker API](https://github.com/VYR4L/backend-expense-tracker), desenvolvido com FastAPI, MySQL e Docker.

## 📝 Licença

MIT

---

<p align="center">
  Desenvolvido com 💜 por Felipe Kravec Zanatta
</p>
