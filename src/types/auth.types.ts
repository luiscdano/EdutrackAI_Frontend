export interface Role {
  id: string;
  name: string;
  description: string | null;
}

export interface AuthenticatedUser {
  id: string;
  firstName: string;
  lastName: string;
  studentCode: string;
  career: string;
  email: string;
  avatarUrl: string | null;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
  role: Role;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthData {
  user: AuthenticatedUser;
  token: string;
}

export interface ApiSuccessResponse<T> {
  ok: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  ok: false;
  message: string;
}
export interface RegisterData {
  firstName: string;
  lastName: string;
  studentCode: string;
  career: string;
  email: string;
  password: string;
  avatarUrl?: string;
}