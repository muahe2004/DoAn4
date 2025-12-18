import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LabelPrimary from "../../../components/Label/Label";
import Header_Auth from "../../../components/Header/Header_Auth";
import type { LoginFormErrors, LoginFormValues } from "../types/auth";
import { submitLogin } from "../services/authService";
import { passwordRegex, phoneRegex, emailRegex } from "../services/validators";
import { registerUrl } from "../../../routes/urls";
import { isAuthenticated } from "../services/authState";

const initialForm: LoginFormValues = {
  identity: "",
  password: "",
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<LoginFormValues>(initialForm);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" | "warning" }>({
    open: false,
    message: "",
    severity: "error",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const handleChange =
    (field: keyof LoginFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
    };

  const extractErrorMessage = (err: unknown): string => {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      if (status === 400) return "Email/số điện thoại hoặc mật khẩu không đúng";
      if (status === 401) return "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại";

      const detail = err.response?.data?.detail;
      if (typeof detail === "string") return detail;
      if (Array.isArray(detail)) return detail[0]?.msg || err.message;
      if (detail && typeof detail === "object") {
        return (detail as { msg?: string }).msg || JSON.stringify(detail);
      }
      return err.message;
    }
    if (err instanceof Error) return err.message;
    return "";
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setToast({ open: false, message: "", severity: "error" });

    try {
      const result = await submitLogin(form);
      if (result.errors) {
        setErrors(result.errors);
        setToast({ open: true, message: "Vui lòng kiểm tra thông tin đăng nhập", severity: "warning" });
        return;
      }
      setToast({ open: true, message: "Đăng nhập thành công", severity: "success" });
      navigate("/");
    } catch (err: unknown) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      const message = extractErrorMessage(err) || "Đăng nhập thất bại, vui lòng thử lại";
      setToast({ open: true, message, severity: status === 400 ? "warning" : "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="#f9f9f9"
    >
      <Header_Auth type="login" />
      <Box
        component="form"
        display="flex"
        flexDirection="column"
        gap={1}
        width={400}
        onSubmit={handleLogin}
      >
        <Box mt="1rem">
          <LabelPrimary value="Email hoặc số điện thoại" required />
          <TextField
            fullWidth
            placeholder="Nhập email hoặc số điện thoại"
            variant="outlined"
            className="primary-text__field"
            value={form.identity}
            onChange={handleChange("identity")}
            error={Boolean(errors.identity)}
            helperText={errors.identity}
            inputProps={{ pattern: `${emailRegex.source}|${phoneRegex.source}` }}
          />
        </Box>
        <Box mt="1rem">
          <LabelPrimary value="Mật khẩu" required />
          <TextField
            placeholder="Nhập mật khẩu"
            variant="outlined"
            type={showPassword ? "text" : "password"}
            className="primary-text__field"
            fullWidth
            value={form.password}
            onChange={handleChange("password")}
            error={Boolean(errors.password)}
            helperText={errors.password}
            inputProps={{ pattern: passwordRegex.source, minLength: 8 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTogglePassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Button
          className="primary-button"
          type="submit"
          variant="contained"
          fullWidth
          disabled={submitting}
        >
          {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>

        <Divider sx={{ my: 2 }}>Hoặc</Divider>

        <Typography
          variant="body2"
          color="primary"
          sx={{ cursor: "pointer", textAlign: "center", ":hover": { textDecoration: "underline" } }}
          onClick={() => navigate(registerUrl)}
        >
          Chưa có tài khoản? Đăng ký
        </Typography>
      </Box>
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
