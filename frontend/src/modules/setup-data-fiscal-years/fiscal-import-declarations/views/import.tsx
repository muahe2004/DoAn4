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
import { useGetFiscalImportDeclarations, type FiscalImportDeclarationListResponse } from "../apis/getFiscalImportDeclarations";
import { useGetFiscalImportDeclarationDetails, type FiscalImportDeclarationDetailListResponse } from "../apis/getFiscalImportDeclarationDetails";
import { STATUS_DISPLAY } from "../../../../utils/statusDisplay";
import { formatQuantity } from "../utils/unitConversion";
import type { IFiscalImportDeclarationResponse, IFiscalImportDeclarationDetailResponse } from "../types";

import "./import.css";

function SetupFiscalImportDeclarations() {
    const [pageList, setPageList] = useState(1);
    const [rowsPerPageList, setRowsPerPageList] = useState(5);
    const [pageDetail, setPageDetail] = useState(1);
    const [rowsPerPageDetail, setRowsPerPageDetail] = useState(5);
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const ParamsList = {
        limit: rowsPerPageList,
        skip: (pageList - 1) * rowsPerPageList,
        ...(search && { search }),
        ...(fromDate && { from_date: fromDate }),
        ...(toDate && { to_date: toDate }),
    };

    const ParamsDetail = {
        limit: rowsPerPageDetail,
        skip: (pageDetail - 1) * rowsPerPageDetail,
        ...(search && { search }),
    };

    console.log('Current state:', { 
        viewMode, 
        pageList, 
        rowsPerPageList, 
        pageDetail, 
        rowsPerPageDetail,
        ParamsList,
        ParamsDetail
    });

    const { data: fiscalImportDeclarationsData } = useGetFiscalImportDeclarations(
        ParamsList,
        { enabled: viewMode === 'list' }
    ) as { data: FiscalImportDeclarationListResponse | undefined };
    
    const { data: fiscalImportDeclarationDetailsData } = useGetFiscalImportDeclarationDetails(
        ParamsDetail,
        { enabled: viewMode === 'detail' }
    ) as { data: FiscalImportDeclarationDetailListResponse | undefined };

    const handlePageChange = (newPage: number) => {
        console.log('Page change:', { viewMode, newPage, currentPageList: pageList, currentPageDetail: pageDetail });
        if (viewMode === 'list') {
            setPageList(newPage);
        } else {
            setPageDetail(newPage);
        }
    };

    const handleItemsPerPageChange = (value: number) => {
        if (viewMode === 'list') {
            setRowsPerPageList(value);
            setPageList(1);
        } else {
            setRowsPerPageDetail(value);
            setPageDetail(1);
        }
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        setPageList(1);
        setPageDetail(1);
    };


    return (
        <Container maxWidth={false} className="primary-container">
            <Box className="fiscal-search-filters">
                <Box className="filter-left-side">
                    <Select size="small" value="all" sx={{ minWidth: 100 }}>
                        <MenuItem value="all">Tất cả</MenuItem>
                    </Select>
                    <Select size="small" value="" sx={{ minWidth: 120 }}>
                        <MenuItem value="">Mã loại hình</MenuItem>
                    </Select>
                    
                    <Box className="date-range-picker">
                        <TextField 
                            size="small" 
                            type="date" 
                            variant="standard" 
                            InputProps={{ disableUnderline: true }}
                            value={fromDate}
                            onChange={(e) => {
                                setFromDate(e.target.value);
                                setPageList(1);
                            }}
                        />
                        <span>→</span>
                        <TextField 
                            size="small" 
                            type="date" 
                            variant="standard" 
                            InputProps={{ disableUnderline: true }}
                            value={toDate}
                            onChange={(e) => {
                                setToDate(e.target.value);
                                setPageList(1);
                            }}
                        />
                    </Box>

                    <Box className="search-box-container">
                        <SearchEngine placeholder="Số tờ khai nhập, bill, số hóa đơn..." onSearch={handleSearch} />
                    </Box>
                </Box>
                
                <Button variant="outlined" sx={{ color: '#ffffffff', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    XEM DANH MỤC NVL
                </Button>
            </Box>

            <Box className="fiscal-actions-group">
                <Button startIcon={<FiDownload />}>Mẫu nhập tờ khai</Button>
                <Button startIcon={<FiFileText />}>Import từ bảng chi tiết</Button>
                <Button startIcon={<FiCheckCircle />}>Import từ danh sách có sẵn</Button>
                <Button startIcon={<FiGrid />}>Import từ tờ khai gốc</Button>
                <Button startIcon={<FiCpu />}>Tính toán đối soát</Button>
                <Button startIcon={<FiPrinter />}>Kết xuất toàn bộ NVL</Button>
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
                                        <TableCell align="center" sx={{ minWidth: 120 }}>MÃ HẢI QUAN</TableCell>
                                        <TableCell align="center" sx={{ minWidth: 120 }}>MÃ NỘI BỘ</TableCell>
                                        <TableCell align="center">SỐ TỜ KHAI</TableCell>
                                        <TableCell align="center">NGÀY</TableCell>
                                        <TableCell align="center">MÃ LOẠI HÌNH</TableCell>
                                        <TableCell align="center">SỐ HÓA ĐƠN</TableCell>
                                        <TableCell align="center">NGƯỜI NHẬP KHẨU</TableCell>
                                        <TableCell align="center">NGƯỜI XUẤT KHẨU</TableCell>
                                        <TableCell align="center">ĐKVC</TableCell>
                                        <TableCell align="center">TRẠNG THÁI</TableCell>
                                    </TableRow>
                                ) : (
                                    <TableRow>
                                        <TableCell align="center">STT</TableCell>
                                        <TableCell align="center" sx={{ minWidth: 120 }}>SỐ TỜ KHAI</TableCell>
                                        <TableCell align="center" sx={{ minWidth: 100 }}>NGÀY</TableCell>
                                        <TableCell align="center">MÃ LOẠI HÌNH</TableCell>
                                        <TableCell align="center" sx={{ minWidth: 150 }}>MÃ NL, VT</TableCell>
                                        <TableCell align="center" sx={{ minWidth: 200 }}>TÊN NL, VT</TableCell>
                                        <TableCell align="center">ĐƠN VỊ CHUẨN</TableCell>
                                        <TableCell align="center">SỐ LƯỢNG</TableCell>
                                        <TableCell align="center">ĐƠN GIÁ</TableCell>
                                        <TableCell align="center">STT HÀNG</TableCell>
                                        <TableCell align="center">ĐƠN VỊ HẢI QUAN</TableCell>
                                        <TableCell align="center">HỆ SỐ QUY ĐỔI</TableCell>
                                        <TableCell align="center" sx={{ minWidth: 130 }}>SL THEO TK QUY ĐỔI(1)</TableCell>
                                        <TableCell align="center" sx={{ minWidth: 130 }}>SL THEO SỔ QUY ĐỔI(2)</TableCell>
                                        <TableCell align="center" sx={{ minWidth: 100 }}>SAI LỆCH</TableCell>
                                        <TableCell align="center" sx={{ minWidth: 150, bgcolor: '#fff3e0' }}>CHI TIẾT SAI LỆCH</TableCell>
                                    </TableRow>
                                )}
                            </TableHead>
                            <TableBody>
                                {viewMode === 'list' ? (
                                    fiscalImportDeclarationsData?.data && fiscalImportDeclarationsData.data.length > 0 ? (
                                        fiscalImportDeclarationsData.data.map((declaration: IFiscalImportDeclarationResponse, index: number) => {
                                            const statusKey = declaration.status?.toLowerCase?.() ?? "";
                                            const badgeClass = STATUS_DISPLAY[statusKey] ? `status-${statusKey}` : "status-unknown";
                                            
                                            return (
                                                <TableRow key={declaration.id}>
                                                    <TableCell align="center">{(pageList - 1) * rowsPerPageList + index + 1}</TableCell>
                                                    <TableCell align="center">{declaration.external_code || '-'}</TableCell>
                                                    <TableCell align="center">{declaration.internal_code || '-'}</TableCell>
                                                    <TableCell align="center">{declaration.import_declaration_number}</TableCell>
                                                    <TableCell align="center">
                                                        {declaration.licence_date ? new Date(declaration.licence_date).toLocaleDateString('vi-VN') : '-'}
                                                    </TableCell>
                                                    <TableCell align="center">{declaration.type_declaration}</TableCell>
                                                    <TableCell align="center">{declaration.bill_number || '-'}</TableCell>
                                                    <TableCell align="center">{declaration.importer || '-'}</TableCell>
                                                    <TableCell align="center">{declaration.exporter || '-'}</TableCell>
                                                    <TableCell align="center">{declaration.type_inventory || '-'}</TableCell>
                                                    <TableCell align="center">
                                                        <span className={`status-badge ${badgeClass}`}>
                                                            {STATUS_DISPLAY[statusKey] ?? declaration.status ?? "Unknown"}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={11} align="center" sx={{ py: 10, color: '#999' }}>
                                                Chưa có dữ liệu trong hệ thống
                                            </TableCell>
                                        </TableRow>
                                    )
                                ) : (
                                    fiscalImportDeclarationDetailsData?.data && fiscalImportDeclarationDetailsData.data.length > 0 ? (
                                        fiscalImportDeclarationDetailsData.data.map((detail: IFiscalImportDeclarationDetailResponse, index: number) => {
                                            // Backend đã tính sẵn các giá trị
                                            const convertedDeclQty = detail.converted_declaration_quantity || 0;
                                            const convertedAcctQty = detail.converted_accounting_quantity || 0;
                                            const variance = detail.variance || 0;

                                            // Xác định trạng thái sai lệch chi tiết
                                            let varianceStatus = '';
                                            let varianceColor = '#666';
                                            let varianceBg = '#f5f5f5';
                                            
                                            if (variance === 0) {
                                                varianceStatus = '✓ Khớp chính xác';
                                                varianceColor = '#2e7d32';
                                                varianceBg = '#e8f5e9';
                                            } else if (variance > 0) {
                                                const percent = ((variance / convertedDeclQty) * 100).toFixed(1);
                                                varianceStatus = `↑ Nhập thừa ${formatQuantity(variance)} (${percent}%)`;
                                                varianceColor = '#1976d2';
                                                varianceBg = '#e3f2fd';
                                            } else {
                                                const percent = ((Math.abs(variance) / convertedDeclQty) * 100).toFixed(1);
                                                varianceStatus = `↓ Nhập thiếu ${formatQuantity(Math.abs(variance))} (${percent}%)`;
                                                varianceColor = '#d32f2f';
                                                varianceBg = '#ffebee';
                                            }

                                            return (
                                                <TableRow key={detail.id}>
                                                    <TableCell align="center">{(pageDetail - 1) * rowsPerPageDetail + index + 1}</TableCell>
                                                    <TableCell align="center">{detail.import_declaration_number || '-'}</TableCell>
                                                    <TableCell align="center">
                                                        {detail.licence_date ? new Date(detail.licence_date).toLocaleDateString('vi-VN') : '-'}
                                                    </TableCell>
                                                    <TableCell align="center">{detail.type_declaration || '-'}</TableCell>
                                                    <TableCell align="center">{detail.material_code || '-'}</TableCell>
                                                    <TableCell align="center">{detail.material_name || '-'}</TableCell>
                                                    <TableCell align="center">{detail.standard_unit || '-'}</TableCell>
                                                    <TableCell align="center">{detail.quantity || '-'}</TableCell>
                                                    <TableCell align="center">{detail.unit_price || '-'}</TableCell>
                                                    <TableCell align="center">{detail.hs_code}</TableCell>
                                                    <TableCell align="center">{detail.customs_unit || '-'}</TableCell>
                                                    <TableCell align="center">{detail.conversion_factor || '-'}</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                        {formatQuantity(convertedDeclQty)}
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                                        {formatQuantity(convertedAcctQty)}
                                                    </TableCell>
                                                    <TableCell 
                                                        align="center" 
                                                        sx={{ 
                                                            fontWeight: 'bold', 
                                                            color: variance === 0 ? '#666' : variance > 0 ? '#2e7d32' : '#d32f2f' 
                                                        }}
                                                    >
                                                        {formatQuantity(variance)}
                                                    </TableCell>
                                                    <TableCell 
                                                        align="left" 
                                                        sx={{ 
                                                            fontWeight: 'bold',
                                                            fontSize: '0.9rem',
                                                            color: varianceColor,
                                                            bgcolor: varianceBg,
                                                            px: 2
                                                        }}
                                                    >
                                                        {varianceStatus}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={16} align="center" sx={{ py: 10, color: '#999' }}>
                                                Chưa có dữ liệu trong hệ thống
                                            </TableCell>
                                        </TableRow>
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                        <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
                            <PrimaryPagination
                                totalItems={
                                    viewMode === 'list' 
                                        ? (fiscalImportDeclarationsData?.total || 0)
                                        : (fiscalImportDeclarationDetailsData?.total || 0)
                                } 
                                page={viewMode === 'list' ? pageList : pageDetail}
                                rowsPerPage={viewMode === 'list' ? rowsPerPageList : rowsPerPageDetail}
                                onPageChange={handlePageChange}
                                onRowsPerPageChange={handleItemsPerPageChange}
                            />
                        </Box>
                    
                </CardContent>
            </Card>
        </Container>
    );
}

export default SetupFiscalImportDeclarations;