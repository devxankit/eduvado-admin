import axios from 'axios';
import config from '../config/config';

// Function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    return false;
  }
  
  try {
    const userData = JSON.parse(user);
    return userData.role === 'admin';
  } catch (error) {
    console.error('Error parsing user data:', error);
    return false;
  }
};

// Function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Function to make authenticated API calls
export const apiCall = async (method, url, data = null) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const config = {
    method,
    url: `${config.apiUrl}${url}`,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
};

// Function to verify token with server
export const verifyToken = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }
    
    const response = await axios.get(`${config.apiUrl}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.status === 200;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};
