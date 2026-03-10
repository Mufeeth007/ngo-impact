import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaMoon, FaSun, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { MdDashboard, MdPeople, MdEvent, MdAttachMoney } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Get user data from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
        setUsername(user.username);
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  const navItems = [
    { path: '/', icon: MdDashboard, label: 'Dashboard', roles: ['user', 'ngo'] },
    { path: '/activities', icon: MdEvent, label: 'Activities', roles: ['user', 'ngo'] },
    { path: '/beneficiaries', icon: MdPeople, label: 'Beneficiaries', roles: ['user', 'ngo'] },
    { path: '/donations', icon: MdAttachMoney, label: 'Donations', roles: ['user', 'ngo'] },
    { path: '/admin', icon: FaCog, label: 'Admin Panel', roles: ['admin'] },
  ];

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Show success message
    toast.success('Logged out successfully!', {
      duration: 2000,
      icon: '👋',
    });
    
    // Force reload to clear all state and redirect
    setTimeout(() => {
      window.location.href = '/login'; // Use window.location for hard redirect
    }, 500);
  };

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(userRole) || (userRole === 'admin' && item.path === '/admin')
  );

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <Link to={userRole === 'admin' ? '/admin' : '/'} className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">NGO</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
              {userRole === 'admin' ? 'Admin Console' : 'Impact Analytics'}
            </h1>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {filteredNavItems.map((item) => {
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
            >
              {isDark ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
            </motion.button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <FaUserCircle className="text-2xl text-primary-600" />
                <span className="hidden md:inline text-sm font-medium">
                  {username || (userRole === 'admin' ? 'Admin' : 'User')}
                </span>
              </button>
              
              {/* Dropdown Menu */}
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 glass-card rounded-lg shadow-xl py-2 z-50"
                >
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {username || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Role: {userRole || 'user'}
                    </p>
                  </div>
                  {userRole === 'admin' && (
                    <Link
                      to="/admin"
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <FaCog />
                      <span>Admin Panel</span>
                    </Link>
                  )}
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