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

// Notification service
const notificationService = {
  // Get user notifications with optional filters
  getNotifications: async (filters = {}) => {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      for (const key in filters) {
        if (filters[key] !== undefined && filters[key] !== null) {
          queryParams.append(key, filters[key]);
        }
      }
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/notifications?${queryString}` : '/notifications';
      
      const response = await apiClient.get(endpoint);
      return response.data.results;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Mark a notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await apiClient.post(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await apiClient.post('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Get notification preferences
  getNotificationPreferences: async () => {
    try {
      const response = await apiClient.get('/notifications/preferences');
      return response.data.preferences;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Update notification preferences
  updateNotificationPreferences: async (preferences) => {
    try {
      const response = await apiClient.put('/notifications/preferences', preferences);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Get notification icon based on type
  getNotificationIcon: (type) => {
    const iconMap = {
      'WELCOME': 'fa-solid fa-party-horn',
      'ACCOUNT_VERIFIED': 'fa-solid fa-badge-check',
      'PASSWORD_RESET': 'fa-solid fa-key',
      'NEW_MESSAGE': 'fa-solid fa-envelope',
      'NEW_PROPOSAL': 'fa-solid fa-file-contract',
      'JOB_AWARDED': 'fa-solid fa-trophy',
      'PAYMENT_INITIATED': 'fa-solid fa-money-bill-wave',
      'PAYMENT_COMPLETED': 'fa-solid fa-check-circle',
      'PAYMENT_FAILED': 'fa-solid fa-exclamation-circle',
      'NEW_JOB_MATCH': 'fa-solid fa-briefcase',
      'NEW_REVIEW': 'fa-solid fa-star',
      'JOB_COMPLETED': 'fa-solid fa-check-double'
    };

    return iconMap[type] || 'fa-solid fa-bell';
  },

  // Format notification timestamp
  formatNotificationTime: (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notificationTime) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    // For older notifications, display the actual date
    return notificationTime.toLocaleDateString('en-SL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

export default notificationService;
