export type Role = 'USER' | 'ADMIN' | 'TECHNICIAN';

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDTO;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}
