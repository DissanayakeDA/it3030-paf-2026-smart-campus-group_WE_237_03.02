import axios from 'axios';
import { getApiBaseURL } from '../config/apiBase';
import type { ChangePasswordRequest, CreateUserRequest, UpdateProfileRequest, UserResponse } from '../types/auth.types';

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
  create(data: CreateUserRequest): Promise<UserResponse> {
    return api.post<UserResponse>('/api/users', data).then(r => r.data);
  },

  getAll(): Promise<UserResponse[]> {
    return api.get<UserResponse[]>('/api/users').then(r => r.data);
  },

  getMe(): Promise<UserResponse> {
    return api.get<UserResponse>('/api/users/me').then(r => r.data);
  },

  updateMe(data: UpdateProfileRequest): Promise<UserResponse> {
    return api.put<UserResponse>('/api/users/me', data).then(r => r.data);
  },

  changeMyPassword(data: ChangePasswordRequest): Promise<void> {
    return api.put('/api/users/me/password', data).then(() => undefined);
  },

  deleteUser(id: number): Promise<void> {
    return api.delete(`/api/users/${id}`).then(() => undefined);
  },
};
