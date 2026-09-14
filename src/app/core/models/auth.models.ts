export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  displayName: string;
  emailConfirmationRequired: boolean;
}

export interface CurrentUser {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  createdAt: string;
  lastLoginAt?: string;
}

export interface VerifyEmailRequest {
  userId: string;
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface ApiMessageResponse {
  message: string;
}
