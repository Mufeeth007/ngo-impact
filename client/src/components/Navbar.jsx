import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaMoon, FaSun, FaSignOutAlt } from 'react-icons/fa';
import { MdDashboard, MdPeople, MdEvent, MdAttachMoney } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useState } from 'react';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navItems = [
    { path: '/', icon: MdDashboard, label: 'Dashboard' },
    { path: '/activities', icon: MdEvent, label: 'Activities' },
    { path: '/beneficiaries', icon: MdPeople, label: 'Beneficiaries' },
    { path: '/donations', icon: MdAttachMoney, label: 'Donations' },
  ];

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('theme'); // Optional: keep theme preference
    
    // Show success message
    toast.success('Logged out successfully!', {
      duration: 2000,
      position: 'top-right',
    });
    
    // Force redirect to login page
    setTimeout(() => {
      window.location.href = '/login'; // Use window.location for hard redirect
      // Alternative: navigate('/login', { replace: true });
    }, 500);
  };

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">NGO</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
              Impact Analytics
            </h1>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Dark Mode Toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
            </motion.button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Profile menu"
              >
                <FaUserCircle className="text-2xl text-primary-600" />
              </button>
              
              {/* Dropdown Menu */}
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 glass-card rounded-lg shadow-xl py-2 z-50"
                >
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Admin</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">admin@ngo.com</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 transition-colors"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;