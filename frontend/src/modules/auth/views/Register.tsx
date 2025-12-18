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
import type { RegisterFormErrors, RegisterFormValues } from "../types/auth";
import { submitRegister } from "../services/authService";
import { emailRegex, passwordRegex, phoneRegex } from "../services/validators";
import { signinUrl } from "../../../routes/urls";
import { isAuthenticated } from "../services/authState";

const initialForm: RegisterFormValues = {
  name: "",
  tax_code: "",
  code: "",
  representative: "",
  position: "",
  phone_number: "",
  email: "",
  password: "",
  confirmPassword: "",
  address: "",
  department: "",
};

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState<RegisterFormValues>(initialForm);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" | "warning" }>({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleTogglePassword = () => setShowPassword((prev) => !prev);
  const handleToggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  const handleChange =
    (field: keyof RegisterFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
    };

  const extractErrorMessage = (err: unknown): string => {
    if (axios.isAxiosError(err)) {
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

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setToast({ open: false, message: "", severity: "success" });

    try {
      const result = await submitRegister(form);
      if (result.errors) {
        setErrors(result.errors);
        setToast({ open: true, message: "Vui lòng kiểm tra lại thông tin bắt buộc", severity: "warning" });
        return;
      }
      setToast({ open: true, message: "Đăng ký thành công, vui lòng đăng nhập", severity: "success" });
      setTimeout(() => navigate(signinUrl), 800);
    } catch (err: unknown) {
      const message = extractErrorMessage(err) || "Đăng ký thất bại, vui lòng thử lại";
      setToast({ open: true, message, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh" flexDirection="column" px={2}>
      <Box sx={{ p: 4, width: "100%", maxWidth: 800, borderRadius: 2 }}>
        <Header_Auth type="register" />

        <Box component="form" mt={3} display="flex" flexDirection="column" gap={2} onSubmit={handleRegister}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Box flex={1} minWidth="300px">
              <LabelPrimary value="Tên doanh nghiệp" required />
              <TextField
                fullWidth
                placeholder="Nhập tên doanh nghiệp"
                variant="outlined"
                className="primary-text__field"
                value={form.name}
                onChange={handleChange("name")}
                error={Boolean(errors.name)}
                helperText={errors.name}
              />
            </Box>
            <Box flex={1} minWidth="300px">
              <LabelPrimary value="Mã số thuế" required />
              <TextField
                fullWidth
                placeholder="Nhập mã số thuế"
                variant="outlined"
                className="primary-text__field"
                value={form.tax_code ?? ""}
                onChange={handleChange("tax_code")}
                error={Boolean(errors.tax_code)}
                helperText={errors.tax_code}
              />
            </Box>
          </Box>

          <Box>
            <LabelPrimary value="Mã doanh nghiệp (Code)" required />
            <TextField
              fullWidth
              placeholder="Nhập mã định danh doanh nghiệp"
              variant="outlined"
              className="primary-text__field"
              value={form.code}
              onChange={handleChange("code")}
              error={Boolean(errors.code)}
              helperText={errors.code}
            />
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Box flex={1} minWidth="300px">
              <LabelPrimary value="Người đại diện" />
              <TextField
                fullWidth
                placeholder="Nhập tên người đại diện"
                variant="outlined"
                className="primary-text__field"
                value={form.representative ?? ""}
                onChange={handleChange("representative")}
                error={Boolean(errors.representative)}
                helperText={errors.representative}
              />
            </Box>
            <Box flex={1} minWidth="300px">
              <LabelPrimary value="Chức vụ người đại diện" />
              <TextField
                fullWidth
                placeholder="Nhập chức vụ (VD: Giám đốc)"
                variant="outlined"
                className="primary-text__field"
                value={form.position ?? ""}
                onChange={handleChange("position")}
                error={Boolean(errors.position)}
                helperText={errors.position}
              />
            </Box>
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Box flex={1} minWidth="300px">
              <LabelPrimary value="Số điện thoại liên hệ" required />
              <TextField
                fullWidth
                placeholder="Nhập số điện thoại"
                variant="outlined"
                className="primary-text__field"
                value={form.phone_number ?? ""}
                onChange={handleChange("phone_number")}
                error={Boolean(errors.phone_number)}
                helperText={errors.phone_number}
                inputProps={{ pattern: phoneRegex.source }}
              />
            </Box>
            <Box flex={1} minWidth="300px">
              <LabelPrimary value="Email doanh nghiệp" required />
              <TextField
                fullWidth
                placeholder="Nhập email doanh nghiệp"
                variant="outlined"
                className="primary-text__field"
                value={form.email}
                onChange={handleChange("email")}
                error={Boolean(errors.email)}
                helperText={errors.email}
                inputProps={{ pattern: emailRegex.source }}
              />
            </Box>
          </Box>

          <Box>
            <LabelPrimary value="Địa chỉ trụ sở chính" required />
            <TextField
              fullWidth
              placeholder="Nhập địa chỉ trụ sở chính của doanh nghiệp"
              variant="outlined"
              className="primary-text__field"
              value={form.address ?? ""}
              onChange={handleChange("address")}
              error={Boolean(errors.address)}
              helperText={errors.address}
            />
          </Box>

          <Box>
            <LabelPrimary value="Phòng ban (tuỳ chọn)" />
            <TextField
              fullWidth
              placeholder="Nhập phòng ban"
              variant="outlined"
              className="primary-text__field"
              value={form.department ?? ""}
              onChange={handleChange("department")}
              error={Boolean(errors.department)}
              helperText={errors.department}
            />
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Box flex={1} minWidth="300px">
              <LabelPrimary value="Mật khẩu" required />
              <TextField
                fullWidth
                placeholder="Nhập mật khẩu"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                className="primary-text__field"
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
            <Box flex={1} minWidth="300px">
              <LabelPrimary value="Xác nhận mật khẩu" required />
              <TextField
                fullWidth
                placeholder="Nhập lại mật khẩu"
                type={showConfirmPassword ? "text" : "password"}
                variant="outlined"
                className="primary-text__field"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword}
                inputProps={{ pattern: passwordRegex.source, minLength: 8 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleToggleConfirmPassword} edge="end">
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>

          <Button
            className="primary-button"
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            disabled={submitting}
          >
            {submitting ? "Đang đăng ký..." : "Đăng ký doanh nghiệp"}
          </Button>

          <Divider sx={{ my: 2 }}>Hoặc</Divider>

          <Typography
            variant="body2"
            color="primary"
            sx={{ cursor: "pointer", textAlign: "center", ":hover": { textDecoration: "underline" } }}
            onClick={() => navigate(signinUrl)}
          >
            Đã có tài khoản? Đăng nhập
          </Typography>
        </Box>
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
