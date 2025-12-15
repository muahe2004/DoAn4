import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Select,
  MenuItem,
  Pagination,
  PaginationItem,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid 
} from '@mui/material';
import { styled } from '@mui/material/styles';

import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CloseIcon from '@mui/icons-material/Close';

interface MaterialData {
  id: number | string;
  maNoiBo: string;
  maHaiQuan: string;
  ngayThem: string;
  moTa: string;
}

const COLORS = {
  bgLayout: '#f5f7fa',
  primaryText: '#334371',       
  modalHeader: '#334371',       
  tealBtn: '#1bc5bd',           
  blueBtn: '#334371',           
  sampleBtnText: '#4ea4f3',     
  borderGray: '#e0e0e0',
  textGray: '#666666',
  inputBorder: '#d9d9d9',
};


const RootPage = styled(Box)({
  minHeight: '100vh',
  padding: '0px 0px',
  fontFamily: 'var(--font-family-base, "Montserrat", sans-serif)',
});

const BreadcrumbContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  fontSize: '14px',
  color: COLORS.primaryText,
  marginBottom: '10px',
  '& svg': {
    fontSize: '18px',
    marginRight: '4px',
    color: COLORS.textGray,
  },
  '& .separator': {
    margin: '0 6px',
    color: COLORS.textGray,
    fontSize: '12px'
  },
  '& .current-step': {
    fontWeight: 700,
  }
});

const HeaderContainer = styled(Box)({
  marginBottom: '16px',
});

const PageTitle = styled(Box)({
  fontSize: '22px',
  fontWeight: 700,
  color: COLORS.primaryText,
  textTransform: 'uppercase',
  marginBottom: '16px',
});

const Toolbar = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '12px',
});

const LeftTools = styled(Box)({
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
});

const RightTools = styled(Box)({
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
});

const SearchTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    paddingRight: 0,
    height: '36px',
    backgroundColor: '#fff',
    fontSize: '13px',
    fontFamily: 'inherit',
    '& fieldset': { borderColor: COLORS.borderGray },
    '&:hover fieldset': { borderColor: COLORS.primaryText },
    '&.Mui-focused fieldset': { borderColor: COLORS.primaryText },
  },
  '& input': {
    padding: '8px 12px',
  }
});

const SearchIconWrapper = styled(Box)({
  height: '36px',
  width: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f5f5f5',
  borderLeft: `1px solid ${COLORS.borderGray}`,
  borderTopRightRadius: '4px',
  borderBottomRightRadius: '4px',
  cursor: 'pointer',
  color: COLORS.textGray,
});

const FilterSelect = styled(Select)({
  height: '36px',
  width: '160px',
  backgroundColor: '#fff',
  fontSize: '13px',
  fontFamily: 'inherit',
  color: COLORS.textGray,
  '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.borderGray }
});

const BtnSample = styled(Button)({
  height: '36px',
  textTransform: 'none',
  fontFamily: 'inherit',
  fontWeight: 700,
  fontSize: '12px',
  color: COLORS.sampleBtnText,
  backgroundColor: '#fff',
  border: 'none',
  borderRadius: '6px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  '&:hover': {
    backgroundColor: '#f8fcff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
});

const BtnImport = styled(Button)({
  height: '36px',
  textTransform: 'none',
  fontFamily: 'inherit',
  fontWeight: 700,
  fontSize: '12px',
  color: COLORS.primaryText, 
  backgroundColor: '#fff',
  border: `1px solid ${COLORS.primaryText}`,
  borderRadius: '6px',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: 'rgba(27, 78, 197, 0.08)', 
    boxShadow: 'none',
    border: `1px solid ${COLORS.primaryText}`,
  },
});

const BtnAdd = styled(Button)({
  height: '36px',
  textTransform: 'none',
  fontFamily: 'inherit',
  fontWeight: 700,
  fontSize: '12px',
  color: '#fff',
  backgroundColor: COLORS.blueBtn,
  borderRadius: '6px',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: '#334371',
    boxShadow: 'none',
  },
});

const StyledTableHeadCell = styled(TableCell)({
  backgroundColor: '#334371',
  color: 'white',
  fontWeight: 700,
  fontSize: '12px',
  fontFamily: 'inherit',
  borderBottom: `1px solid ${COLORS.borderGray}`,
  borderRight: '1px solid #dcdcdc',
  padding: '10px 8px',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  '&:last-child': {
    borderRight: 'none',
    color: '#999',
    fontWeight: 'normal',
    cursor: 'pointer'
  }
});

const StyledTableBodyCell = styled(TableCell)({
  fontSize: '13px',
  fontFamily: 'inherit',
  color: COLORS.textGray,
  padding: '8px 12px',
  borderBottom: '1px solid #f0f0f0',
  borderRight: '1px solid #f0f0f0',
  height: '45px',
  '&:last-child': {
    borderRight: 'none',
  }
});

const PaginationContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: '10px 20px',
  backgroundColor: '#fafafa',
  borderTop: `1px solid ${COLORS.borderGray}`,
});

const PageSizeSelect = styled(Box)({
  marginLeft: '16px',
  border: `1px solid ${COLORS.borderGray}`,
  borderRadius: '4px',
  padding: '4px 8px',
  fontSize: '13px',
  color: COLORS.textGray,
  backgroundColor: '#fff',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  cursor: 'pointer'
});


const CustomDialogTitle = styled(DialogTitle)({
  backgroundColor: COLORS.modalHeader, 
  color: '#fff',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 24px',
  fontSize: '16px',
  fontWeight: 700,
  fontFamily: 'inherit',
});

const CustomDialogContent = styled(DialogContent)({
  padding: '24px !important',
  backgroundColor: '#fff',
});

const CustomDialogActions = styled(DialogActions)({
  padding: '16px 24px',
  backgroundColor: '#fff',
});

const LabelText = styled(Typography)({
  fontSize: '14px',
  fontWeight: 600,
  color: '#333',
  marginBottom: '6px',
  fontFamily: 'inherit',
  '& span': {
    color: 'red',
    marginLeft: '2px'
  }
});

const ModalTextField = styled(TextField)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    height: '40px',
    borderRadius: '4px',
    backgroundColor: '#fff',
    fontSize: '14px',
    fontFamily: 'inherit',
    '& fieldset': {
      borderColor: COLORS.inputBorder,
    },
    '&:hover fieldset': {
      borderColor: '#40a9ff',
    },
    '&.Mui-focused fieldset': {
      borderColor: COLORS.modalHeader,
    },
  },
  '& input': {
    padding: '8px 12px',
    '&::placeholder': {
       fontSize: '14px',
       color: '#bfbfbf',
       opacity: 1
    }
  }
});

const BtnClose = styled(Button)({
  height: '36px',
  minWidth: '100px',
  textTransform: 'none',
  fontFamily: 'inherit',
  fontWeight: 600,
  fontSize: '14px',
  color: COLORS.modalHeader,
  border: `1px solid ${COLORS.modalHeader}`,
  backgroundColor: '#fff',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: '#f0f5f9',
    border: `1px solid ${COLORS.modalHeader}`,
  },
});

const BtnSave = styled(Button)({
  height: '36px',
  minWidth: '100px',
  textTransform: 'none',
  fontFamily: 'inherit',
  fontWeight: 600,
  fontSize: '14px',
  color: '#fff',
  backgroundColor: COLORS.modalHeader,
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: '#334371',
  },
});

const Material: React.FC = () => {
  const [rows, setRows] = useState<MaterialData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterTime, setFilterTime] = useState('');
  const [searchText, setSearchText] = useState('');
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setTimeout(() => {
         setRows([]);
         setLoading(false);
      }, 500);
    };
    fetchData();
  }, []);

  return (
    <RootPage>
      <BreadcrumbContainer>
        <HomeIcon fontSize="small" />
        <span className="separator">/</span>
        <span style={{ color: COLORS.textGray }}>Chuyển đổi dữ liệu</span>
        <span className="separator">/</span>
        <span className="current-step">Chuyển đổi mã NVL(Nội bộ - Hải quan)</span>
      </BreadcrumbContainer>

      <HeaderContainer>
        <PageTitle>BẢNG ĐỐI SÁNH MÃ NGUYÊN VẬT LIỆU</PageTitle>
        
        <Toolbar>
          <LeftTools>
            <FilterSelect
              displayEmpty
              value={filterTime}
              onChange={(e) => setFilterTime(e.target.value as string)}
              renderValue={(selected) => !selected ? "Thời gian thêm" : selected as string}
            >
              <MenuItem value=""><em>Tất cả</em></MenuItem>
              <MenuItem value="newest">Mới nhất</MenuItem>
            </FilterSelect>

            <SearchTextField
              placeholder="Mã hải quan, mã nội bộ..."
              variant="outlined"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ width: '280px' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIconWrapper>
                      <SearchIcon fontSize="small" />
                    </SearchIconWrapper>
                  </InputAdornment>
                ),
              }}
            />
          </LeftTools>

          <RightTools>
            <BtnSample startIcon={<FileDownloadOutlinedIcon />}>
              Mẫu đối sánh mã NVL
            </BtnSample>
            <BtnImport startIcon={<FileDownloadOutlinedIcon />}>
              Import từ file Excel
            </BtnImport>
            <BtnAdd 
              onClick={handleOpen}
              startIcon={<Box component="span" sx={{fontSize: '18px', fontWeight: 'bold'}}>+</Box>}
            >
              Thêm mới
            </BtnAdd>
          </RightTools>
        </Toolbar>
      </HeaderContainer>

      <Paper sx={{ width: '100%', overflow: 'hidden', border: `1px solid ${COLORS.borderGray}`, boxShadow: 'none', borderRadius: '4px' }}>
        <TableContainer sx={{ minHeight: '400px' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <StyledTableHeadCell sx={{ width: '60px' }}>STT</StyledTableHeadCell>
                <StyledTableHeadCell sx={{ width: '180px', textAlign: 'left !important', paddingLeft: '20px !important' }}>
                  Mã nội bộ
                </StyledTableHeadCell>
                <StyledTableHeadCell sx={{ width: '140px', textAlign: 'left !important' }}>Mã hải quan</StyledTableHeadCell>
                <StyledTableHeadCell sx={{ width: '120px' }}>Ngày thêm</StyledTableHeadCell>
                <StyledTableHeadCell sx={{ textAlign: 'left !important' }}>Mô tả thông tin nguyên vật liệu</StyledTableHeadCell>
                <StyledTableHeadCell sx={{ width: '100px' }}>Xóa All</StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row, index) => (
                  <TableRow hover key={row.id || index}>
                    <StyledTableBodyCell align="center">{index + 1}</StyledTableBodyCell>
                    <StyledTableBodyCell sx={{ paddingLeft: '20px !important' }}>{row.maNoiBo}</StyledTableBodyCell>
                    <StyledTableBodyCell>{row.maHaiQuan}</StyledTableBodyCell>
                    <StyledTableBodyCell align="center">{row.ngayThem}</StyledTableBodyCell>
                    <StyledTableBodyCell>{row.moTa}</StyledTableBodyCell>
                    <StyledTableBodyCell align="center">
                      <Box display="flex" justifyContent="center" gap="4px">
                        <IconButton size="small" sx={{ color: '#f3961a' }}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ color: '#e53e3e' }}>
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </StyledTableBodyCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <StyledTableBodyCell colSpan={6} align="center" sx={{ height: '200px', color: '#999' }}>
                    {loading ? "Đang tải dữ liệu..." : "Chưa có dữ liệu"}
                  </StyledTableBodyCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <PaginationContainer>
          <Pagination 
            count={10} 
            variant="outlined" 
            shape="rounded" 
            renderItem={(item) => (
              <PaginationItem
                slots={{ previous: ArrowBackIosNewIcon, next: ArrowForwardIosIcon }}
                {...item}
                sx={{
                  border: `1px solid ${COLORS.borderGray}`,
                  margin: '0 2px',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  color: COLORS.textGray,
                  '&.Mui-selected': {
                    backgroundColor: '#e6f7ff',
                    borderColor: COLORS.primaryText,
                    color: COLORS.primaryText,
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: '#d6f0ff',
                    }
                  }
                }}
              />
            )}
          />
          <PageSizeSelect>
            10 / trang <KeyboardArrowRightIcon sx={{ transform: 'rotate(90deg)', fontSize: '16px' }} />
          </PageSizeSelect>
        </PaginationContainer>
      </Paper>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '8px', overflow: 'hidden' }
        }}
      >
        <CustomDialogTitle>
          Thêm mới cặp mã đối sánh
          <IconButton onClick={handleClose} sx={{ color: '#fff', padding: 0 }}>
            <CloseIcon />
          </IconButton>
        </CustomDialogTitle>

        <CustomDialogContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 6 }}>
              <LabelText>Mã hải quan <span>*</span></LabelText>
              <ModalTextField placeholder="Mã hải quan" variant="outlined" />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <LabelText>Mã nội bộ <span>*</span></LabelText>
              <ModalTextField placeholder="Mã nội bộ" variant="outlined" />
            </Grid>

            {/* Hàng 2: Mô tả */}
            <Grid size={{ xs: 12 }}>
              <LabelText>Mô tả thông tin nguyên vật liệu</LabelText>
              <ModalTextField placeholder="Mô tả thông tin nguyên vật liệu" variant="outlined" />
            </Grid>
          </Grid>
        </CustomDialogContent>

        <CustomDialogActions>
          <BtnClose onClick={handleClose} variant="outlined">
            Quay lại
          </BtnClose>
          <BtnSave variant="contained">
            Lưu
          </BtnSave>
        </CustomDialogActions>
      </Dialog>

    </RootPage>
  );
};

export default Material;