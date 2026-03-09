import axios from 'axios';

// Get the API URL from environment variable or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

console.log('API URL:', API_URL); // For debugging

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 seconds timeout
});

// Request interceptor to add token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    console.log('Making request to:', config.url); // Debug log
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
instance.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status); // Debug log
    return response;
  },
  (error) => {
    console.error('Response error:', error.response || error);
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - backend might be down');
    }
    
    if (error.response?.status === 401) {
      console.log('Unauthorized - redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    if (!error.response) {
      console.error('Network error - is backend running?');
    }
    
    return Promise.reject(error);
  }
);

export default instance;