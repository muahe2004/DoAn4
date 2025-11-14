import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import './Header_Auth.css'; 

interface Header_AuthProps {
  type: 'register' | 'login';
}

const Header_Auth: React.FC<Header_AuthProps> = ({ type }) => {
  return (
    <Box textAlign="center" className="header-auth__container">
      <Paper elevation={0} className="header-auth__paper">
        <img src="../../../public/logo.png" alt="Logo" className="header-auth__logo"/>
      </Paper>

      <Typography className="header-auth__title primary-text__field__title" fontWeight="bold" gutterBottom>
        {type === 'register' ? 'Đăng ký' : 'Đăng nhập'}
      </Typography>
    </Box>
  );
};

export default Header_Auth;
