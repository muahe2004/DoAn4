import { loginApi, registerApi } from "../api/authApi";
import { setAuthenticated, clearAuthenticated } from "./authState";
import type { LoginFormErrors, LoginFormValues, LoginResponse, RegisterFormErrors, RegisterFormValues, RegisterRequest, RegisterResponse, UserRole } from "../types/auth";

import { emailRegex, phoneRegex, validateLoginForm, validateRegisterForm } from "./validators";

const DEFAULT_ROLE: UserRole = "staff";

const hasErrors = (errors: LoginFormErrors | RegisterFormErrors) =>
  Object.values(errors).some((val) => Boolean(val));

export const submitLogin = async (
  form: LoginFormValues
): Promise<{ data?: LoginResponse; errors?: LoginFormErrors }> => {
  const errors = validateLoginForm(form);
  if (hasErrors(errors)) return { errors };

  const payload =
    phoneRegex.test(form.identity) || !emailRegex.test(form.identity)
      ? { phone_number: form.identity, password: form.password }
      : { email: form.identity, password: form.password };

  const data = await loginApi(payload);
  setAuthenticated();
  return { data };
};

export const submitRegister = async (
  form: RegisterFormValues
): Promise<{ data?: RegisterResponse; errors?: RegisterFormErrors }> => {
  const errors = validateRegisterForm(form);
  if (hasErrors(errors)) return { errors };

  const { confirmPassword: _confirmPassword, role, ...rest } = form;
  void _confirmPassword;
  const payload: RegisterRequest = {
    ...rest,
    role: role ?? DEFAULT_ROLE,
    confirm_password: form.confirmPassword,
  };

  const data = await registerApi(payload);
  return { data };
};

export const submitLogout = async (): Promise<void> => {
  await import("../api/authApi").then(({ logoutApi }) => logoutApi());
  clearAuthenticated();
};
