
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      error: error.response?.data?.error || 'An unexpected error occurred',
      status: error.response?.status || 500,
    };
    return Promise.reject(customError);
  }
);

export default api;