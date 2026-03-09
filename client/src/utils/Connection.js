import axios from '../api/axios';

export const testBackendConnection = async () => {
  try {
    const startTime = Date.now();
    const response = await axios.get('/test');
    const endTime = Date.now();
    
    return {
      connected: true,
      responseTime: endTime - startTime,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      details: error.response?.data || 'No response from server'
    };
  }
};

export const testAllEndpoints = async () => {
  const endpoints = [
    { method: 'GET', url: '/test', name: 'Test' },
    { method: 'POST', url: '/auth/login', name: 'Login', data: { email: 'admin@ngo.com', password: 'admin123' } },
    { method: 'GET', url: '/activities', name: 'Activities' },
    { method: 'GET', url: '/beneficiaries', name: 'Beneficiaries' },
    { method: 'GET', url: '/donations', name: 'Donations' }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      let response;
      if (endpoint.method === 'POST') {
        response = await axios.post(endpoint.url, endpoint.data);
      } else {
        response = await axios.get(endpoint.url);
      }
      
      results.push({
        endpoint: endpoint.name,
        url: endpoint.url,
        status: '✅ Success',
        code: response.status
      });
    } catch (error) {
      results.push({
        endpoint: endpoint.name,
        url: endpoint.url,
        status: '❌ Failed',
        error: error.message,
        code: error.response?.status || 'No response'
      });
    }
  }
  
  return results;
};