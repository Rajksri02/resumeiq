import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis';
import ProtectedRoute from './components/ProtectedRoute';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { WarmupProvider } from './context/WarmupContext';

const ThemedToaster = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: isDark ? '#0f172a' : '#ffffff',
          color: isDark ? '#f8fafc' : '#0f172a',
          border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
          fontFamily: 'monospace',
          fontSize: '13px',
          borderRadius: '0.75rem',
          boxShadow: isDark
            ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
            : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: isDark ? '#0f172a' : '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#f43f5e',
            secondary: isDark ? '#0f172a' : '#ffffff',
          },
        },
      }}
    />
  );
};

const RootRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <WarmupProvider>
          <ThemedToaster />
          <AuthProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/upload" 
                  element={
                    <ProtectedRoute>
                      <Upload />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/analysis/:id" 
                  element={
                    <ProtectedRoute>
                      <Analysis />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/" element={<RootRedirect />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </AuthProvider>
        </WarmupProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
