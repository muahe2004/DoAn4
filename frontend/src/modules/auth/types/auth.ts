export type UserRole = "admin" | "staff";

export interface LoginRequest {
  email?: string;
  phone_number?: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  message: string;
  code: string;
  status: string;
  role: UserRole;
}

export interface LoginFormValues {
  identity: string;
  password: string;
}

export type LoginFormErrors = Partial<Record<keyof LoginFormValues | "general", string>>;

export interface RegisterRequest {
  name: string;
  tax_code?: string | null;
  code: string;
  representative?: string | null;
  position?: string | null;
  phone_number?: string | null;
  email: string;
  password: string;
  confirm_password?: string;
  address?: string | null;
  department?: string | null;
  role: UserRole;
}

export interface RegisterResponse {
  message: string;
}

export interface RegisterFormValues extends Omit<RegisterRequest, "role"> {
  role?: UserRole;
  confirmPassword: string;
}

export type RegisterFormErrors = Partial<Record<keyof RegisterFormValues | "general", string>>;
