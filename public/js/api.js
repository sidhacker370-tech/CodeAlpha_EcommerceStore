// CodeAlpha Store API Client
const API_BASE = '/api';

const API = {
  // Generic request handler
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Attach JWT token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle unauthorized (expired/invalid token) globally
        if (response.status === 401 && token) {
          console.warn('Authentication token expired or invalid. Logging out...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('auth-change'));
          window.location.hash = '#/login';
          throw new Error('Session expired. Please log in again.');
        }
        
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error.message);
      throw error;
    }
  },

  // Auth Endpoints
  auth: {
    async register(name, email, password) {
      return API.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
    },

    async login(email, password) {
      return API.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    async getProfile() {
      return API.request('/auth/profile', {
        method: 'GET',
      });
    },
  },

  // Product Endpoints
  products: {
    async list(filters = {}) {
      const params = new URLSearchParams();
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters.sort) params.append('sort', filters.sort);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      return API.request(`/products${queryString}`, {
        method: 'GET',
      });
    },

    async get(id) {
      return API.request(`/products/${id}`, {
        method: 'GET',
      });
    },
  },

  // Order Endpoints
  orders: {
    async create(orderData) {
      return API.request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    },

    async list() {
      return API.request('/orders', {
        method: 'GET',
      });
    },

    async get(id) {
      return API.request(`/orders/${id}`, {
        method: 'GET',
      });
    },
  },
};
