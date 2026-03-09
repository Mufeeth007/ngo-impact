import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post('/auth/login', formData);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${response.data.user.username || 'Admin'}!`);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            toast.error('Invalid email or password');
            setErrors({
              general: 'Invalid email or password'
            });
            break;
          case 500:
            toast.error('Server error. Please try again later.');
            break;
          default:
            toast.error(error.response.data?.message || 'Login failed');
        }
      } else if (error.request) {
        toast.error('Cannot connect to server. Please ensure backend is running.');
        setErrors({
          general: 'Backend server not connected. Please start the server on port 5000.'
        });
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 gradient-bg rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
          >
            <span className="text-white font-bold text-3xl">NGO</span>
          </motion.div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
            Impact Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-8 shadow-2xl"
        >
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {errors.general}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.email 
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-200'
                  } bg-white/50 dark:bg-gray-800/50 focus:ring-2 dark:focus:ring-primary-800 transition-colors`}
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.password 
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-200'
                  } bg-white/50 dark:bg-gray-800/50 focus:ring-2 dark:focus:ring-primary-800 transition-colors`}
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={() => toast.error('Please contact your administrator to reset password')}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline transition-colors"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            <motion.button
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              type="submit"
              disabled={loading}
              className="w-full gradient-bg text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FaArrowRight />
                </>
              )}
            </motion.button>

            {/* Create Account Link */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium hover:underline transition-colors"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;