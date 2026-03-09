import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { FaUser, FaEnvelope, FaLock, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.username.trim()) {
      newErrors.username = 'Name is required';
    } else if (formData.username.length < 2) {
      newErrors.username = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Send registration request
      const response = await axios.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      console.log('Registration response:', response.data);
      
      // Show success message
      toast.success('Account created successfully! Please login.');
      
      // Redirect to login page
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle different error scenarios
      if (error.response) {
        switch (error.response.status) {
          case 400:
            if (error.response.data.errors) {
              // Handle validation errors from backend
              const backendErrors = {};
              error.response.data.errors.forEach(err => {
                backendErrors[err.param] = err.msg;
              });
              setErrors(backendErrors);
            } else if (error.response.data.message === 'User already exists') {
              setErrors({
                email: 'Email already registered. Please use a different email or login.'
              });
              toast.error('Email already registered');
            } else {
              toast.error(error.response.data.message || 'Registration failed');
            }
            break;
          case 500:
            toast.error('Server error. Please try again later.');
            break;
          default:
            toast.error('Registration failed. Please try again.');
        }
      } else if (error.request) {
        // Network error - backend not reachable
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: 'bg-gray-200' };
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    
    strength = Math.min(strength, 4); // Scale to 4
    
    const strengthMap = {
      0: { label: 'Very Weak', color: 'bg-red-500' },
      1: { label: 'Weak', color: 'bg-orange-500' },
      2: { label: 'Fair', color: 'bg-yellow-500' },
      3: { label: 'Good', color: 'bg-blue-500' },
      4: { label: 'Strong', color: 'bg-green-500' }
    };
    
    return { 
      strength, 
      label: strengthMap[strength]?.label || '', 
      color: strengthMap[strength]?.color || 'bg-gray-200',
      width: `${(strength / 4) * 100}%`
    };
  };

  const passwordStrength = getPasswordStrength();

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
            Create Account
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Join the Impact Analytics Platform
          </p>
        </div>

        {/* Register Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-8 shadow-2xl"
        >
          {/* General Error Message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {errors.general}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.username 
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-200'
                  } bg-white/50 dark:bg-gray-800/50 focus:ring-2 dark:focus:ring-primary-800 transition-colors`}
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Email Field */}
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

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                    errors.password 
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-200'
                  } bg-white/50 dark:bg-gray-800/50 focus:ring-2 dark:focus:ring-primary-800 transition-colors`}
                  placeholder="Create a password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: passwordStrength.width }}
                      ></div>
                    </div>
                    <span className="ml-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                      {passwordStrength.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Use at least 6 characters with uppercase, lowercase & numbers
                  </p>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                    errors.confirmPassword 
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-200'
                  } bg-white/50 dark:bg-gray-800/50 focus:ring-2 dark:focus:ring-primary-800 transition-colors`}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                required
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => toast.success('Terms of Service will be shown here')}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => toast.success('Privacy Policy will be shown here')}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              type="submit"
              disabled={loading}
              className="w-full gradient-bg text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <FaArrowRight />
                </>
              )}
            </motion.button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium hover:underline transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>

          {/* Security Note */}
          <div className="mt-4">
            <p className="text-xs text-center text-gray-500 dark:text-gray-500">
              🔒 Your information is securely encrypted
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;