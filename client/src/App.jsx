import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardProvider } from './context/DashboardContext';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import axios from './api/axios';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import Beneficiaries from './pages/Beneficiaries';
import Donations from './pages/Donations';
import AdminPanel from './pages/AdminPanel';

// Components
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    checkBackendConnection();
    checkAuthStatus();
  }, []);

  const checkBackendConnection = async () => {
    try {
      await axios.get('/test');
      setBackendStatus('connected');
      console.log('✅ Backend connection successful');
    } catch (error) {
      setBackendStatus('disconnected');
      console.warn('⚠️ Backend not connected');
    }
  };

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    console.log('Checking auth - Token:', token ? 'exists' : 'none');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
        setUserData(user);
        setIsAuthenticated(true);
        verifyToken(token);
      } catch (e) {
        console.error('Error parsing user data:', e);
        clearAuth();
        setLoading(false);
      }
    } else {
      console.log('No auth data found');
      clearAuth();
      setLoading(false);
    }
  };

  const verifyToken = async (token) => {
    try {
      const response = await axios.get('/auth/verify', {
        headers: { 'x-auth-token': token }
      });
      
      if (response.data.user) {
        setUserRole(response.data.user.role);
        setUserData(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserData(null);
  };

  const handleLogin = (token, user) => {
    console.log('Login successful - User role:', user.role);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setIsAuthenticated(true);
    setUserRole(user.role);
    setUserData(user);
  };

  const handleLogout = () => {
    clearAuth();
    // Force navigation to login
    window.location.href = '/login';
  };

  // Listen for storage changes (logout in another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        clearAuth();
        window.location.href = '/login';
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading application...</p>
        </div>
      </div>
    );
  }

  console.log('App render - Auth:', isAuthenticated, 'Role:', userRole);

  return (
    <ThemeProvider>
      <DashboardProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          
          {/* Backend Connection Status Banner */}
          {backendStatus === 'disconnected' && (
            <div className="bg-yellow-500 text-white text-center py-2 px-4 fixed top-0 left-0 right-0 z-50">
              ⚠️ Backend server not connected. Using demo data.
            </div>
          )}
          
          <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                  (userRole === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />) 
                  : <Login onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/register" 
              element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} 
            />
            
            {/* Admin routes - only accessible by admin */}
            <Route 
              path="/admin/*" 
              element={
                isAuthenticated && userRole === 'admin' ? 
                  <AdminLayout /> : 
                  <Navigate to={isAuthenticated ? "/" : "/login"} replace />
              }
            >
              <Route index element={<AdminPanel />} />
              <Route path="users" element={<AdminPanel />} />
              <Route path="stats" element={<AdminPanel />} />
            </Route>
            
            {/* User routes - only accessible by regular users (not admin) */}
            <Route 
              path="/*" 
              element={
                isAuthenticated ? 
                  (userRole === 'admin' ? <Navigate to="/admin" replace /> : <Layout />) 
                  : <Navigate to="/login" replace />
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="activities" element={<Activities />} />
              <Route path="beneficiaries" element={<Beneficiaries />} />
              <Route path="donations" element={<Donations />} />
            </Route>
          </Routes>
        </Router>
      </DashboardProvider>
    </ThemeProvider>
  );
}

export default App;