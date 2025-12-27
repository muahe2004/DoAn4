import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Select, MenuItem, Pagination,
  PaginationItem, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Typography, 
  Grid
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CloseIcon from '@mui/icons-material/Close';

import './material.css';

interface MaterialData {
  id: number | string;
  maNoiBo: string;
  maHaiQuan: string;
  ngayThem: string;
  moTa: string;
}

const Material: React.FC = () => {
  const [rows, setRows] = useState<MaterialData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterTime, setFilterTime] = useState('');
  const [searchText, setSearchText] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setRows([]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <Box className="root-page">
      <Box className="breadcrumb-container">
        <HomeIcon sx={{ fontSize: 18, color: '#666', mr: 0.5 }} />
        <span className="separator">/</span>
        <span style={{ color: '#666' }}>Chuyển đổi dữ liệu</span>
        <span className="separator">/</span>
        <span className="current-step">Chuyển đổi mã NVL(Nội bộ - Hải quan)</span>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography className="page-title">BẢNG ĐỐI SÁNH MÃ NGUYÊN VẬT LIỆU</Typography>
        
        <Box className="toolbar">
          <Box className="left-tools">
            <Select
              displayEmpty
              size="small"
              value={filterTime}
              onChange={(e) => setFilterTime(e.target.value)}
              sx={{ height: 36, width: 160, bgcolor: '#fff' }}
              renderValue={(selected) => !selected ? "Thời gian thêm" : selected}
            >
              <MenuItem value=""><em>Tất cả</em></MenuItem>
              <MenuItem value="newest">Mới nhất</MenuItem>
            </Select>

            <TextField
              placeholder="Mã hải quan, mã nội bộ..."
              variant="outlined"
              size="small"
              className="search-textfield"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ width: 280 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Box className="search-icon-wrapper">
                      <SearchIcon fontSize="small" />
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box className="right-tools">
            <Button className="btn-sample" variant="contained" startIcon={<FileDownloadOutlinedIcon />}>
              Mẫu đối sánh mã NVL
            </Button>
            <Button className="btn-import" variant="outlined" startIcon={<FileDownloadOutlinedIcon />}>
              Import từ file Excel
            </Button>
            <Button 
              className="btn-add" 
              variant="contained" 
              onClick={() => setOpen(true)}
              startIcon={<Box component="span" sx={{ fontWeight: 'bold' }}>+</Box>}
            >
              Thêm mới
            </Button>
          </Box>
        </Box>
      </Box>

      <Paper sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <TableContainer sx={{ minHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell className="table-header-cell" sx={{ width: 60 }}>STT</TableCell>
                <TableCell className="table-header-cell" sx={{ width: 180, textAlign: 'left !important', pl: 2.5 }}>Mã nội bộ</TableCell>
                <TableCell className="table-header-cell" sx={{ width: 140, textAlign: 'left !important' }}>Mã hải quan</TableCell>
                <TableCell className="table-header-cell" sx={{ width: 120 }}>Ngày thêm</TableCell>
                <TableCell className="table-header-cell" sx={{ textAlign: 'left !important' }}>Mô tả thông tin nguyên vật liệu</TableCell>
                <TableCell className="table-header-cell" sx={{ width: 100, fontWeight: '400 !important', color: '#999 !important' }}>Xóa All</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className="primary-tbody">
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ height: 200, color: '#999', border: 'none' }}>
                    {loading ? "Đang tải dữ liệu..." : "Chưa có dữ liệu"}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell align="center" className="table-body-cell">{index + 1}</TableCell>
                    <TableCell className="table-body-cell" sx={{ pl: 2.5 }}>{row.maNoiBo}</TableCell>
                    <TableCell className="table-body-cell">{row.maHaiQuan}</TableCell>
                    <TableCell align="center" className="table-body-cell">{row.ngayThem}</TableCell>
                    <TableCell className="table-body-cell">{row.moTa}</TableCell>
                    <TableCell align="center" className="table-body-cell">
                        <IconButton size="small" sx={{ color: '#f3961a' }}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" sx={{ color: '#e53e3e' }}><DeleteOutlineIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', bgcolor: '#fafafa', borderTop: '1px solid #e0e0e0' }}>
          <Pagination 
            count={10} 
            shape="rounded" 
            variant="outlined" 
            size="small"
            renderItem={(item) => (
              <PaginationItem 
                slots={{ previous: ArrowBackIosNewIcon, next: ArrowForwardIosIcon }} 
                {...item} 
                sx={{ '&.Mui-selected': { bgcolor: '#e6f7ff', borderColor: '#334371', color: '#334371' }}}
              />
            )}
          />
          <Box sx={{ ml: 2, border: '1px solid #e0e0e0', p: '4px 8px', borderRadius: 1, fontSize: 13, display: 'flex', alignItems: 'center', bgcolor: '#fff', cursor: 'pointer' }}>
            10 / trang <KeyboardArrowRightIcon sx={{ transform: 'rotate(90deg)', fontSize: 16 }} />
          </Box>
        </Box>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle className="dialog-header">
          Thêm mới cặp mã đối sánh
          <IconButton onClick={() => setOpen(false)} sx={{ color: '#fff', p: 0 }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            {/* Thay size={6} cho Grid v2/v7 */}
            <Grid size={6}>
              <label className="label-input">Mã hải quan <span>*</span></label>
              <TextField fullWidth size="small" placeholder="Mã hải quan" />
            </Grid>
            
            <Grid size={6}>
              <label className="label-input">Mã nội bộ <span>*</span></label>
              <TextField fullWidth size="small" placeholder="Mã nội bộ" />
            </Grid>
            
            <Grid size={12}>
              <label className="label-input">Mô tả thông tin nguyên vật liệu</label>
              <TextField fullWidth size="small" placeholder="Mô tả thông tin nguyên vật liệu" />
            </Grid>
          </Grid>        
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} variant="outlined" sx={{ color: '#334371', borderColor: '#334371', textTransform: 'none' }}>Quay lại</Button>
          <Button variant="contained" sx={{ bgcolor: '#334371', textTransform: 'none' }}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Material;