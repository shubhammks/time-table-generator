import api from './api';

export const authService = {
  // Register new user
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login user
  async login(email, password) {
    try {
      const response = await api.post('/auth/login-email', {
        email,
        password,
      });
      
      const { access_token, refresh_token } = response.data;
      
      // Store tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current user info
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout user
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  // Get stored token
  getToken() {
    return localStorage.getItem('access_token');
  },
};
