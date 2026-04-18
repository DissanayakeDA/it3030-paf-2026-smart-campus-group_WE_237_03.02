import axios from 'axios';
import { getApiBaseURL } from '../config/apiBase';
import type {
  LoginRequest,
  AuthResponse,
  UserDTO,
  RefreshTokenRequest,
  GoogleLoginRequest,
} from '../types/auth.types';

const api = axios.create({
  baseURL: getApiBaseURL(),
  headers: { 'Content-Type': 'application/json' },
});

export const authService = {
  login(data: LoginRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', data).then(r => r.data);
  },

  loginWithGoogle(data: GoogleLoginRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/google', data).then(r => r.data);
  },

  refresh(data: RefreshTokenRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/refresh', data).then(r => r.data);
  },

  getMe(accessToken: string): Promise<UserDTO> {
    return api
      .get<UserDTO>('/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(r => r.data);
  },
};
