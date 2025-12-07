import React from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LabelPrimary from '../../components/Label/Label';
import Header_Auth from '../../components/Header/Header_Auth';

export default function Register() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const navigate = useNavigate();

  const handleTogglePassword = () => setShowPassword(!showPassword);
  const handleToggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleRegister = () => {
    navigate('/sign-in');
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      flexDirection="column"
      px={2}
    >
      <Box sx={{ p: 4, width: '100%', maxWidth: 800, borderRadius: 2 }}>
        <Header_Auth type="register" />

        <Box component="form" mt={3} display="flex" flexDirection="column" gap={2}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Box flex={1} minWidth="300px">
              <LabelPrimary value="Tên doanh nghiệp" required />
              <TextField
                fullWidth
                placeholder="Nhập tên doanh nghiệp"
                variant="outlined"
                className="primary-text__field"
              />
            </Box>
            <Box flex={1} minWidth="300px">
              <LabelPrimary value="Mã số thuế" required />
              <TextField
                fullWidth
                placeholder="Nhập mã số thuế"
                variant="outlined"
                className="primary-text__field"
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
              />
            </Box>
            <Box flex={1} minWidth="300px">
              <LabelPrimary value="Chức vụ người đại diện" />
              <TextField
                fullWidth
                placeholder="Nhập chức vụ (VD: Giám đốc)"
                variant="outlined"
                className="primary-text__field"
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
              />
            </Box>
            <Box flex={1} minWidth="300px">
              <LabelPrimary value="Email doanh nghiệp" required />
              <TextField
                fullWidth
                placeholder="Nhập email doanh nghiệp"
                variant="outlined"
                className="primary-text__field"
              />
            </Box>
          </Box>

          <Box>
            <LabelPrimary value="Địa chỉ trụ sở chính" />
            <TextField
              fullWidth
              placeholder="Nhập địa chỉ trụ sở chính của doanh nghiệp"
              variant="outlined"
              className="primary-text__field"
            />
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Box flex={1} minWidth="300px">
              <LabelPrimary value="Mật khẩu" required />
              <TextField
                fullWidth
                placeholder="Nhập mật khẩu"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                className="primary-text__field"
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
                type={showConfirmPassword ? 'text' : 'password'}
                variant="outlined"
                className="primary-text__field"
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

          <Button className="primary-button" onClick={handleRegister} variant="contained" fullWidth sx={{ mt: 3 }}>
            Đăng ký doanh nghiệp
          </Button>

          <Divider sx={{ my: 2 }}>Hoặc</Divider>

          <Typography variant="body2" color="primary"
            sx={{
              cursor: 'pointer', textAlign: 'center', ':hover': { textDecoration: 'underline' },
            }}
            onClick={() => navigate('/sign-in')}>
            Đã có tài khoản? Đăng nhập
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
