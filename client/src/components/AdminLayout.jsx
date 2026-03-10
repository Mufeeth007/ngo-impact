import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FaHome, FaUsers, FaChartBar, FaSignOutAlt, FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

const AdminLayout = () => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUsername(user.username);
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear all storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    toast.success('Logged out successfully!', {
      icon: '👋',
    });
    
    // Force hard redirect to login
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Navbar */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/admin" className="text-xl font-bold flex items-center space-x-2">
                <FaUsers />
                <span>Admin Panel</span>
              </Link>
              <div className="hidden md:flex space-x-4">
                <Link to="/admin" className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center space-x-2">
                  <FaHome />
                  <span>Dashboard</span>
                </Link>
                <Link to="/admin/users" className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center space-x-2">
                  <FaUsers />
                  <span>NGOs</span>
                </Link>
                <Link to="/admin/stats" className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center space-x-2">
                  <FaChartBar />
                  <span>Statistics</span>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm hidden md:inline">Welcome, {username || 'Admin'}</span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {isDark ? <FaSun /> : <FaMoon />}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <FaSignOutAlt />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;