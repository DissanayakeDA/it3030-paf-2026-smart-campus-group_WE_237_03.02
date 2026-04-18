import axios from 'axios';
import { getApiBaseURL } from '../config/apiBase';
import type { UserResponse } from '../types/auth.types';

const api = axios.create({
  baseURL: getApiBaseURL(),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('sc_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const userService = {
  getAll(): Promise<UserResponse[]> {
    return api.get<UserResponse[]>('/api/users').then(r => r.data);
  },
};
