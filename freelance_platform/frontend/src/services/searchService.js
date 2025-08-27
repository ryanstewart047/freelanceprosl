import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const apiClient = axios.create({
  baseURL: `${API_URL}/api/v2`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
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

// Convert object to query string
const buildQueryString = (params) => {
  const queryParams = new URLSearchParams();
  
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      if (Array.isArray(params[key])) {
        params[key].forEach(value => {
          queryParams.append(key, value);
        });
      } else {
        queryParams.append(key, params[key]);
      }
    }
  }
  
  return queryParams.toString();
};

// Search service
const searchService = {
  // Search for freelancers
  searchFreelancers: async (searchParams) => {
    try {
      const queryString = buildQueryString(searchParams);
      const response = await apiClient.get(`/search/freelancers?${queryString}`);
      return response.data.results;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Search for jobs
  searchJobs: async (searchParams) => {
    try {
      const queryString = buildQueryString(searchParams);
      const response = await apiClient.get(`/search/jobs?${queryString}`);
      return response.data.results;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Search for clients
  searchClients: async (searchParams) => {
    try {
      const queryString = buildQueryString(searchParams);
      const response = await apiClient.get(`/search/clients?${queryString}`);
      return response.data.results;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Get search filters
  getSearchFilters: async () => {
    try {
      const response = await apiClient.get('/search/filters');
      return response.data.filters;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Get autocomplete suggestions
  getAutocompleteSuggestions: async (query, type = 'freelancer') => {
    try {
      const response = await apiClient.get(`/search/autocomplete?q=${query}&type=${type}`);
      return response.data.suggestions;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  }
};

export default searchService;
