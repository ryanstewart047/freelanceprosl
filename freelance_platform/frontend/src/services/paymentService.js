import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const apiClient = axios.create({
  baseURL: `${API_URL}/api/v2`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Payment service
const paymentService = {
  // Create a new transaction
  createTransaction: async (transactionData) => {
    try {
      const response = await apiClient.post('/payments/create-transaction', transactionData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Get transaction details
  getTransaction: async (transactionId) => {
    try {
      const response = await apiClient.get(`/payments/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Get user transactions with optional filters
  getUserTransactions: async (filters = {}) => {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      for (const key in filters) {
        if (filters[key] !== undefined && filters[key] !== null) {
          queryParams.append(key, filters[key]);
        }
      }
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/payments/transactions?${queryString}` : '/payments/transactions';
      
      const response = await apiClient.get(endpoint);
      return response.data.results;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Get user payment methods
  getPaymentMethods: async () => {
    try {
      const response = await apiClient.get('/payments/payment-methods');
      return response.data.payment_methods;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Add a new payment method
  addPaymentMethod: async (paymentMethodData) => {
    try {
      const response = await apiClient.post('/payments/payment-methods', paymentMethodData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Helper function to format currency
  formatCurrency: (amount, currency = 'SLL') => {
    return new Intl.NumberFormat('en-SL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  // Get transaction status label with appropriate styling
  getStatusLabel: (status) => {
    const statusMap = {
      'pending': { label: 'Pending', color: '#f0ad4e', bgColor: '#fcf8e3' },
      'completed': { label: 'Completed', color: '#5cb85c', bgColor: '#dff0d8' },
      'failed': { label: 'Failed', color: '#d9534f', bgColor: '#f2dede' },
      'refunded': { label: 'Refunded', color: '#5bc0de', bgColor: '#d9edf7' },
      'cancelled': { label: 'Cancelled', color: '#777', bgColor: '#eee' }
    };

    return statusMap[status] || { label: status, color: '#777', bgColor: '#eee' };
  },

  // Get payment method options
  getPaymentMethodOptions: () => {
    return [
      { value: 'mobile_money', label: 'Mobile Money' },
      { value: 'credit_card', label: 'Credit Card (Coming Soon)', disabled: true },
      { value: 'bank_transfer', label: 'Bank Transfer (Coming Soon)', disabled: true }
    ];
  },

  // Get mobile money provider options
  getMobileMoneyProviderOptions: () => {
    return [
      { value: 'orange', label: 'Orange Money' },
      { value: 'africell', label: 'Africell Money' },
      { value: 'qcell', label: 'QMoney' }
    ];
  }
};

export default paymentService;
