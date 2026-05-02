import axios from 'axios';
import { auth } from '../firebase';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 15000,
});

// Attach Firebase token to every request
API.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    if (err.response?.status === 401 && !url.includes('/auth/profile') && !url.includes('/auth/me')) {
      if (auth.currentUser) {
        auth.signOut().then(() => {
          window.location.href = '/login';
        });
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default API;
