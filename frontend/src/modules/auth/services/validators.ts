import type { LoginFormErrors, LoginFormValues, RegisterFormErrors, RegisterFormValues } from "../types/auth";


export const phoneRegex = /^\+?\d{10,15}$/;
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegex = /^.{8,}$/;

export const validateLoginForm = (form: LoginFormValues): LoginFormErrors => {
  const errors: LoginFormErrors = {};

  if (!form.identity.trim()) {
    errors.identity = "Vui lòng nhập email hoặc số điện thoại";
  } else if (!emailRegex.test(form.identity) && !phoneRegex.test(form.identity)) {
    errors.identity = "Email hoặc số điện thoại không hợp lệ";
  }

  if (!form.password.trim()) {
    errors.password = "Vui lòng nhập mật khẩu";
  } else if (!passwordRegex.test(form.password)) {
    errors.password = "Mật khẩu phải có ít nhất 8 ký tự";
  }

  return errors;
};

export const validateRegisterForm = (form: RegisterFormValues): RegisterFormErrors => {
  const errors: RegisterFormErrors = {};

  if (!form.name.trim()) errors.name = "Vui lòng nhập tên doanh nghiệp";
  if (!form.tax_code?.trim()) errors.tax_code = "Vui lòng nhập mã số thuế";
  if (!form.code.trim()) errors.code = "Vui lòng nhập mã doanh nghiệp";

  if (!form.phone_number?.trim()) {
    errors.phone_number = "Vui lòng nhập số điện thoại";
  } else if (!phoneRegex.test(form.phone_number)) {
    errors.phone_number = "Số điện thoại không hợp lệ";
  }

  if (!form.email.trim()) {
    errors.email = "Vui lòng nhập email";
  } else if (!emailRegex.test(form.email)) {
    errors.email = "Email không hợp lệ";
  }

  if (!form.password.trim()) {
    errors.password = "Vui lòng nhập mật khẩu";
  } else if (!passwordRegex.test(form.password)) {
    errors.password = "Mật khẩu phải có ít nhất 8 ký tự";
  }

  if (!form.confirmPassword.trim()) {
    errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp";
  }

  if (!form.address?.trim()) errors.address = "Vui lòng nhập địa chỉ";

  return errors;
};
