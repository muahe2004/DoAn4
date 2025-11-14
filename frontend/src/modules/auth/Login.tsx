import React from 'react';
import { Box, Button, TextField, Typography, IconButton, InputAdornment, Divider, Grid } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LabelPrimary from '../../components/Label/Label';
import Header_Auth from '../../components/Header/Header_Auth';

export default function Login() {
  const [showPassword, setShowPassword] = React.useState(false);
  const navigate = useNavigate();

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = () => {
    navigate('/');
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="#f9f9f9"
    >
      <Header_Auth type='login'/>
      <Box component="form" display="flex" flexDirection="column" gap={1} width={400}>
        <Grid size={4} mt="1rem">
          <LabelPrimary value="Email hoặc số điện thoại"></LabelPrimary>
          <TextField 
              fullWidth 
              id="outlined-basic" 
              placeholder='Nhập email hoặc số điện thoại'
              variant="outlined" 
              className="primary-text__field"
            />
        </Grid>    
        <Grid size={4} mt="1rem">
          <LabelPrimary value="Mật khẩu"></LabelPrimary>
          <TextField
            placeholder="Nhập mật khẩu"
            variant="outlined"
            type={showPassword ? 'text' : 'password'}
            className="primary-text__field"
            fullWidth
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
        </Grid>    

        <Button className="primary-button" onClick={() => handleLogin()} variant="contained" fullWidth>Đăng nhập</Button>

        <Divider sx={{ my: 2 }}>Hoặc</Divider>

        <Typography
          variant="body2"
          color="primary"
          sx={{ cursor: 'pointer', textAlign: 'center', ":hover": { textDecoration: 'underline' } }}
          onClick={() => navigate('/register')}
        >
          Chưa có tài khoản? Đăng ký
        </Typography>
      </Box>
    </Box>
  );
}
