import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { ThemeProvider } from './context/ThemeContext';
import { AppSidebar } from './components/organisms/AppSidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Categories } from './pages/Categories';
import { Goals } from './pages/Goals';

// Componente de proteção de rotas
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('expense-tracker-auth');
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Layout principal com sidebar
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const handleLogout = () => {
    localStorage.removeItem('expense-tracker-auth');
    window.location.href = '/login';
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppSidebar onLogout={handleLogout} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          width: '100%',
          pt: { xs: 8, md: 0 }, // Padding-top no mobile para o AppBar
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Rota pública de login */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Transactions />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/categories"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Categories />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/goals"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Goals />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* Redirecionamento padrão */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
