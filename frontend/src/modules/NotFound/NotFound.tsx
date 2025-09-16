import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';

import './NotFound.css';

export function NotFound() {
  const navigate = useNavigate();
  const handleGoHome = () => { navigate("/")};

  return (
    <Box className="notfound-container">
      <Typography variant="h1" className="notfound-title">
        404
      </Typography>
      <Typography variant="body1" className="notfound-message">
        Oops! Trang bạn tìm kiếm không tồn tại.
      </Typography>
      <Button
        variant="contained"
        onClick={handleGoHome}
      >
        Quay về trang chủ
      </Button>
    </Box>
  );
}
