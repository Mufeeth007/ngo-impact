import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardProvider } from './context/DashboardContext'; // Add this
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

// Components
import Layout from './components/Layout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    checkBackendConnection();
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const checkBackendConnection = async () => {
    try {
      await axios.get('/test');
      setBackendStatus('connected');
      console.log('✅ Backend connection successful');
    } catch (error) {
      setBackendStatus('disconnected');
      console.warn('⚠️ Backend not connected. Using demo data.');
    }
  };

  const verifyToken = async (token) => {
    try {
      await axios.get('/auth/verify', {
        headers: { 'x-auth-token': token }
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <ThemeProvider>
      <DashboardProvider> {/* Add this wrapper */}
        <Router>
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
              ⚠️ Backend server not connected. Using demo data. Start the backend server on port 5000.
            </div>
          )}
          
          <Routes>
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/" /> : <Login setIsAuthenticated={setIsAuthenticated} />} 
            />
            <Route 
              path="/register" 
              element={isAuthenticated ? <Navigate to="/" /> : <Register />} 
            />
            <Route 
              path="/" 
              element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
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