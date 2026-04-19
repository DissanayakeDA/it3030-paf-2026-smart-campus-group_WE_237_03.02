export type Role = 'USER' | 'ADMIN' | 'TECHNICIAN';

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  empId?: string | null;
  phoneNumber?: string | null;
  role: Role;
}

export interface UserResponse extends UserDTO {
  createdAt: string;
  updatedAt: string;
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

export interface CreateUserRequest {
  name: string;
  email: string;
  empId: string;
  phoneNumber: string;
  password: string;
  role: Role;
}

export interface UpdateProfileRequest {
  name: string;
  phoneNumber: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
