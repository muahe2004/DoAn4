import {
    Container, Typography, Box, Card, CardContent,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Select,
    MenuItem, TextField,
} from "@mui/material";
import { 
    FiDownload, FiFileText, FiCheckCircle, FiGrid, 
    FiCpu, FiPrinter,
} from "react-icons/fi";
import { useState } from "react";

import Button from "../../../../components/Button/Button";
import PrimaryPagination from "../../../../components/Pagination/Pagination";
import SearchEngine from "../../../../components/SearchEngine/SearchEngine";

import "./export.css";

function SetupFiscalExportDeclarations() {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleItemsPerPageChange = (value: number) => {
        setRowsPerPage(value);
        setPage(1);
    };

    return (
        <Container maxWidth={false} className="primary-container">
            <Box className="fiscal-search-filters">
                <Box className="filter-left-side">
                    <Select size="small" defaultValue="all" sx={{ minWidth: 100 }}>
                        <MenuItem value="all">Tất cả</MenuItem>
                    </Select>
                    <Select size="small" displayEmpty sx={{ minWidth: 120 }}>
                        <MenuItem value="">Mã loại hình</MenuItem>
                    </Select>
                    
                    <Box className="date-range-picker">
                        <TextField size="small" type="date" variant="standard" InputProps={{ disableUnderline: true }} />
                        <span>→</span>
                        <TextField size="small" type="date" variant="standard" InputProps={{ disableUnderline: true }} />
                    </Box>

                    <Box className="search-box-container">
                        <SearchEngine placeholder="Số tờ khai xuất, bill, số hóa đơn..." onSearch={() => {}} />
                    </Box>
                </Box>
                
                <Button variant="outlined" sx={{ color: '#ffffffff', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    XEM DANH MỤC SP
                </Button>
            </Box>

            <Box className="fiscal-actions-group">
                <Button startIcon={<FiDownload />}>Mẫu xuất tờ khai</Button>
                <Button startIcon={<FiFileText />}>Import từ bảng chi tiết</Button>
                <Button startIcon={<FiCheckCircle />}>Import từ danh sách có sẵn</Button>
                <Button startIcon={<FiGrid />}>Import từ tờ khai gốc</Button>
                <Button startIcon={<FiCpu />}>Tính toán đối soát</Button>
                <Button startIcon={<FiPrinter />}>Kết xuất toàn bộ SP</Button>
            </Box>

            <Card className="fiscal-card">
                <Box className="card-header-view">
                    <Typography variant="h6" className="table-title">
                        {viewMode === 'list' ? 'THÔNG TIN TỜ KHAI' : 'CHI TIẾT TỜ KHAI'}
                    </Typography>
                    <Box className="view-mode-icons">
                        <IconButton size="small" className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><FiGrid /></IconButton>
                        <IconButton size="small" className={viewMode === 'detail' ? 'active' : ''} onClick={() => setViewMode('detail')}><FiFileText /></IconButton>
                    </Box>
                </Box>
                
                <CardContent sx={{ p: 0 }}>
                    <TableContainer className="custom-scrollbar primary-table-theme">
                        <Table stickyHeader size="small">
                            <TableHead className="fiscal-table-head">
                                {viewMode === 'list' ? (
                                    <TableRow>
                                        <TableCell align="center" width={50}>STT</TableCell>
                                        <TableCell align="center">SỐ TỜ KHAI</TableCell>
                                        <TableCell align="center">NGÀY</TableCell>
                                        <TableCell align="center">MÃ LOẠI HÌNH</TableCell>
                                        <TableCell align="center">SỐ HÓA ĐƠN</TableCell>
                                        <TableCell align="center">NGƯỜI XUẤT KHẨU</TableCell>
                                        <TableCell align="center">NGƯỜI NHẬP KHẨU</TableCell>
                                        <TableCell align="center">ĐKVC</TableCell>
                                        <TableCell align="center">TRẠNG THÁI</TableCell>
                                        <TableCell align="center">ACTION</TableCell>
                                    </TableRow>
                                ) : (
                                    <TableRow>
                                        <TableCell align="center">STT</TableCell>
                                        <TableCell align="center" sx={{ minWidth: 120 }}>SỐ TỜ KHAI</TableCell>
                                        <TableCell align="center" sx={{ minWidth: 100 }}>NGÀY</TableCell>
                                        <TableCell align="center">MÃ LOẠI HÌNH</TableCell>
                                        <TableCell align="center" sx={{ minWidth: 150 }}>MÃ HÀNG HOÁ</TableCell>
                                        <TableCell align="center" sx={{ minWidth: 200 }}>TÊN HÀNG HOÁ</TableCell>
                                        <TableCell align="center">ĐƠN VỊ</TableCell>
                                        <TableCell align="center">SỐ LƯỢNG</TableCell>
                                        <TableCell align="center">ĐƠN GIÁ</TableCell>
                                        <TableCell align="center">STT HÀNG</TableCell>
                                        <TableCell align="center">ĐƠN VỊ(HQ)</TableCell>
                                        <TableCell align="center">SỐ LƯỢNG(HQ)</TableCell>
                                        <TableCell align="center" sx={{ minWidth: 130 }}>SL THEO TK QUY ĐỔI(1)</TableCell>
                                        <TableCell align="center" sx={{ minWidth: 130 }}>SL THEO SỔ QUY ĐỔI(2)</TableCell>
                                        <TableCell align="center" sx={{ minWidth: 100 }}>SAI LỆCH</TableCell>
                                    </TableRow>
                                )}
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell colSpan={20} align="center" sx={{ py: 10, color: '#999' }}>
                                        Chưa có dữ liệu trong hệ thống
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <PrimaryPagination
                            totalItems={0} 
                            page={page}
                            rowsPerPage={rowsPerPage}
                            onPageChange={handlePageChange}
                            onRowsPerPageChange={handleItemsPerPageChange}
                        />
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
}

export default SetupFiscalExportDeclarations;