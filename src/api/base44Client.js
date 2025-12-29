import axios from 'axios';

const API_URL = '/api'; // Proxy will handle this

const client = axios.create({
  baseURL: API_URL,
});

// Interceptor to add token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('waiter_session');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mocking the base44 SDK structure
export const base44 = {
  functions: {
    invoke: async (functionName, args) => {
      try {
        const response = await client.post(`/functions/${functionName}`, args);
        return { data: response.data };
      } catch (error) {
        console.error(`Error invoking ${functionName}:`, error);
        throw error;
      }
    }
  },
  entities: {
    JobRequest: {
      filter: async (filters, sort) => {
        try {
          const params = new URLSearchParams(filters);
          if (sort) params.append('sort', sort);
          const response = await client.get(`/entities/JobRequest?${params.toString()}`);
          return response.data;
        } catch (error) {
          console.error('Error fetching JobRequest:', error);
          return [];
        }
      },
      list: async () => {
        try {
          const response = await client.get('/entities/JobRequest');
          return response.data;
        } catch (error) {
          console.error('Error fetching JobRequest:', error);
          return [];
        }
      },
      create: async (data) => {
        try {
          const response = await client.post('/entities/JobRequest', data);
          return response.data;
        } catch (error) {
          console.error('Error creating JobRequest:', error);
          throw error;
        }
      }
    },
    Rating: {
      filter: async (filters) => {
        try {
          const params = new URLSearchParams(filters);
          const response = await client.get(`/entities/Rating?${params.toString()}`);
          return response.data;
        } catch (error) {
          console.error('Error fetching Rating:', error);
          return [];
        }
      },
      list: async () => {
        try {
          const response = await client.get('/entities/Rating');
          return response.data;
        } catch (error) {
          console.error('Error fetching Rating:', error);
          return [];
        }
      },
      create: async (data) => {
        try {
          const response = await client.post('/entities/Rating', data);
          return response.data;
        } catch (error) {
          console.error('Error creating Rating:', error);
          throw error;
        }
      }
    },
    // We don't have endpoints for all yet, but these are checks
    UserSession: {},
    WaiterUser: {
      list: async () => {
        try {
          const response = await client.post('/functions/listWaiters');
          return response.data.users || [];
        } catch (error) {
          console.error('Error fetching WaiterUser list:', error);
          return [];
        }
      }
    },
    UserCredit: {},
    CancellationTracking: {},
    PasswordResetToken: {},
    User: {}
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await client.post('/integrations/Core/UploadFile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
      }
    },
    auth: {}
  }
};
