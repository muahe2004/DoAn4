import {
    Container, Typography, Box, Card, CardContent,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Select, MenuItem, TextField,
    IconButton,
} from "@mui/material";
import { FiDownload, FiUpload, FiEdit } from "react-icons/fi";
import { PiTrashSimpleFill } from "react-icons/pi";
import { type ChangeEvent, useRef, useState } from "react";
import * as XLSX from "xlsx";

import Button from "../../../components/Button/Button";
import PrimaryPagination from "../../../components/Pagination/Pagination";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import { useGetMaterialStores } from "../apis/getMaterialStores";
import { useCreateMaterialStore } from "../apis/addMaterialStore";
import { useEditMaterialStore } from "../apis/editMaterialStore";
import { useCreateMaterialStoreMulti } from "../apis/addMaterialStoreMulti";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import { STATUS_DISPLAY } from "../../../utils/statusDisplay";
import { STATUS } from "../../../constants/status";
import { exportExcel } from "../../../utils/exportExcel";
import MaterialStoreFormModel from "../components/MaterialStoreFormModel";
import type { IMaterialStore, IMaterialStoreResponse } from "../types";

import "./MaterialStores.css";

type ImportedMaterialStore = Omit<IMaterialStoreResponse, "id"> & {
    id?: string;
};

function MaterialStores() {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [search, setSearch] = useState("");
    const [closingDate, setClosingDate] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [selectedStore, setSelectedStore] = useState<IMaterialStoreResponse | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const { showSnackbar } = useSnackbar();
    const { mutateAsync: createMaterialStore } = useCreateMaterialStore({});
    const { mutateAsync: editMaterialStore } = useEditMaterialStore({});
    const { mutateAsync: createMaterialStoreMulti } = useCreateMaterialStoreMulti({});

    const Params = {
        limit: rowsPerPage,
        skip: (page - 1) * rowsPerPage,
        ...(search && { search }),
        ...(closingDate && { closing_date: closingDate }),
        ...(statusFilter && { status: statusFilter }),
    };

    const { data: materialStores } = useGetMaterialStores(Params);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleItemsPerPageChange = (value: number) => {
        setRowsPerPage(value);
        setPage(1);
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleOpenEdit = (store: IMaterialStoreResponse) => {
        setSelectedStore(store);
        setOpenModal(true);
    };

    const handleOpenAdd = () => {
        setSelectedStore(null);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedStore(null);
    };

    const normalizeMaterialStorePayload = (data: IMaterialStoreResponse): IMaterialStore => {
        const {
            id,
            material_id,
            store_id,
            quantity_on_hand,
            reorder_level,
            safety_stock,
            status,
        } = data;

        return {
            id,
            material_id,
            store_id,
            quantity_on_hand,
            reorder_level,
            safety_stock,
            status,
        };
    };

    const handleSubmitMaterialStore = async (data: IMaterialStoreResponse) => {
        const payload = normalizeMaterialStorePayload(data);
        try {
            if (selectedStore) {
                await editMaterialStore({
                    id: data.id!,
                    data: payload,
                });
                showSnackbar({ message: "Cập nhật chốt tồn kho thành công", severity: "success" });
            } else {
                await createMaterialStore(payload);
                showSnackbar({ message: "Thêm chốt tồn kho thành công", severity: "success" });
            }
            handleCloseModal();
        } catch (error) {
            showSnackbar({ message: "Có lỗi xảy ra, vui lòng thử lại", severity: "error" });
        }
    };

    const handleImportMaterialStores = async (data: IMaterialStoreResponse[]) => {
        const payload = {
            material_stores: data.map(store => ({
                material_id: store.material_id,
                store_id: store.store_id,
                quantity_on_hand: store.quantity_on_hand,
                reorder_level: store.reorder_level,
                safety_stock: store.safety_stock,
                status: store.status,
            }))
        };

        try {
            await createMaterialStoreMulti(payload);
            showSnackbar({ message: "Import chốt tồn kho thành công", severity: "success" });
        } catch (error) {
            showSnackbar({ message: "Có lỗi xảy ra, vui lòng thử lại", severity: "error" });
        }
    };

    const handleImport = () => {
        fileInputRef.current?.click();
    };

    const handleExport = () => {
        const headers = {
            number: "STT",
            material_code: "Mã nguyên vật liệu",
            material_name: "Tên nguyên vật liệu",
            unit_name: "Đơn vị tính",
            store_name: "Kho",
            quantity_on_hand: "Số lượng tồn",
            reorder_level: "Mức đặt hàng lại",
            safety_stock: "Tồn kho an toàn",
        };

        const templateRow = {
            number: "",
            material_code: "",
            material_name: "",
            unit_name: "",
            store_name: "",
            quantity_on_hand: "",
            reorder_level: "",
            safety_stock: "",
        };

        exportExcel([templateRow], "material_stores_template", {
            sheetName: "Template",
            headers,
            title: "CHỐT TỒN KHO NGUYÊN VẬT LIỆU",
        });
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (evt) => {
            const data = evt.target?.result;
            if (!data) return;

            const workbook = XLSX.read(new Uint8Array(data as ArrayBuffer), { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
                header: 1,
                range: 2,
                defval: "",
            });

            const mapped: ImportedMaterialStore[] = rows
                .filter((row) => row.some((cell) => `${cell}`.trim() !== ""))
                .map((row) => {
                    const [
                        material_id_raw = "",
                        store_id_raw = "",
                        quantity_on_hand_raw = 0,
                        reorder_level_raw = 0,
                        safety_stock_raw = 0,
                        status_raw = STATUS.ACTIVE,
                    ] = row;

                    return {
                        material_id: `${material_id_raw}`.trim(),
                        store_id: `${store_id_raw}`.trim(),
                        quantity_on_hand: parseFloat(`${quantity_on_hand_raw}`) || 0,
                        reorder_level: parseFloat(`${reorder_level_raw}`) || 0,
                        safety_stock: parseFloat(`${safety_stock_raw}`) || 0,
                        status: `${status_raw}`.trim() || STATUS.ACTIVE,
                    };
                });

            handleImportMaterialStores(mapped);
        };

        reader.readAsArrayBuffer(file);
        event.target.value = "";
    };

    return (
        <Container maxWidth={false} className="primary-container" sx={{ maxWidth: '100% !important', overflow: 'visible' }}>
            <Box className="fiscal-search-filters">
                <Box className="filter-left-side">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
                            Ngày chốt tồn:
                        </Typography>
                        <TextField 
                            size="small" 
                            type="date" 
                            value={closingDate}
                            onChange={(e) => {
                                setClosingDate(e.target.value);
                                setPage(1);
                            }}
                            sx={{ 
                                minWidth: 180,
                                '& .MuiInputBase-root': {
                                    backgroundColor: 'white'
                                }
                            }}
                        />
                    </Box>
                    
                    <Select 
                        size="small" 
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        sx={{ minWidth: 120 }}
                        displayEmpty
                    >
                        <MenuItem value="">Tất cả</MenuItem>
                        <MenuItem value="active">Hoạt động</MenuItem>
                        <MenuItem value="inactive">Không hoạt động</MenuItem>
                    </Select>

                    <Box className="search-box-container">
                        <SearchEngine 
                            placeholder="Mã nguyên vật liệu, tên ngu..." 
                            onSearch={handleSearch} 
                        />
                    </Box>
                </Box>
            </Box>

            <Box className="fiscal-actions-group">
                <Button 
                    startIcon={<FiDownload />}
                    onClick={handleExport}
                    sx={{ 
                        backgroundColor: '#ff6b35',
                        color: 'white',
                        '&:hover': { backgroundColor: '#ff5722' }
                    }}
                >
                    Export chốt tồn kho/sổ kế toán 152
                </Button>
                <Button 
                    startIcon={<FiUpload />}
                    onClick={handleImport}
                    sx={{ 
                        backgroundColor: '#1976d2',
                        color: 'white',
                        '&:hover': { backgroundColor: '#1565c0' }
                    }}
                >
                    Import chốt tồn kho/sổ kế toán 152
                </Button>
                <Button 
                    startIcon={<FiDownload />}
                    onClick={handleExport}
                >
                    Mẫu chốt tồn kho/sổ kế toán 152
                </Button>
                <Button onClick={handleOpenAdd}>
                    Thêm mới
                </Button>
            </Box>
            <input
                type="file"
                accept=".xlsx,.xls,.xlsm,.xlsb"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
            />

            <Card className="fiscal-card" sx={{ overflow: 'visible' }}>
                <Box className="card-header-view">
                    <Typography variant="h6" className="table-title">
                        CHỐT TỒN KHO NGUYÊN VẬT LIỆU
                    </Typography>
                </Box>
                
                <CardContent sx={{ p: 0, overflow: 'auto' }}>
                    <TableContainer className="custom-scrollbar primary-table-theme" sx={{ width: '100%', overflowX: 'auto' }}>
                        <Table stickyHeader size="small" sx={{ minWidth: 1600 }}>
                            <TableHead className="fiscal-table-head">
                                <TableRow>
                                    <TableCell align="center" sx={{ minWidth: 60 }} rowSpan={2}>STT</TableCell>
                                    <TableCell align="center" sx={{ minWidth: 120 }} rowSpan={2}>MÃ NỘI BỘ</TableCell>
                                    <TableCell align="center" sx={{ minWidth: 120 }} rowSpan={2}>MÃ HẢI QUAN</TableCell>
                                    <TableCell align="center" sx={{ minWidth: 300 }} rowSpan={2}>TÊN NGUYÊN VẬT LIỆU</TableCell>
                                    <TableCell align="center" sx={{ minWidth: 100 }} rowSpan={2}>ĐƠN VỊ TÍNH</TableCell>
                                    <TableCell align="center" colSpan={2}>CUỐI KỲ</TableCell>
                                    <TableCell align="center" sx={{ minWidth: 120 }} rowSpan={2}>MỨC ĐẶT HÀNG LẠI</TableCell>
                                    <TableCell align="center" sx={{ minWidth: 120 }} rowSpan={2}>TỒN KHO AN TOÀN</TableCell>
                                    <TableCell align="center" sx={{ minWidth: 120 }} rowSpan={2}>TRẠNG THÁI</TableCell>
                                    <TableCell align="center" sx={{ minWidth: 100 }} rowSpan={2}>THAO TÁC</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align="center" sx={{ minWidth: 100 }}>SỐ LƯỢNG</TableCell>
                                    <TableCell align="center" sx={{ minWidth: 120 }}>GIÁ TRỊ</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {materialStores?.data && materialStores.data.length > 0 ? (
                                    materialStores.data.map((store, index) => {
                                        const statusKey = store.status?.toLowerCase?.() ?? "";
                                        const badgeClass = STATUS_DISPLAY[statusKey] ? `status-${statusKey}` : "status-unknown";
                                        
                                        return (
                                            <TableRow key={store.id} className="primary-trow">
                                                <TableCell align="center" className="custom-border-tcell primary-tcell">
                                                    {(page - 1) * rowsPerPage + index + 1}
                                                </TableCell>
                                                <TableCell align="center" className="custom-border-tcell primary-tcell">
                                                    {store.internal_code || '-'}
                                                </TableCell>
                                                <TableCell align="center" className="custom-border-tcell primary-tcell">
                                                    {store.external_code || '-'}
                                                </TableCell>
                                                <TableCell className="custom-border-tcell primary-tcell">
                                                    {store.material_name || '-'}
                                                </TableCell>
                                                <TableCell align="center" className="custom-border-tcell primary-tcell">
                                                    {store.unit_name || '-'}
                                                </TableCell>
                                                <TableCell align="center" className="custom-border-tcell primary-tcell">
                                                    {store.quantity_on_hand || 0}
                                                </TableCell>
                                                <TableCell align="center" className="custom-border-tcell primary-tcell">
                                                    -
                                                </TableCell>
                                                <TableCell align="center" className="custom-border-tcell primary-tcell">
                                                    {store.reorder_level || '-'}
                                                </TableCell>
                                                <TableCell align="center" className="custom-border-tcell primary-tcell">
                                                    {store.safety_stock || '-'}
                                                </TableCell>
                                                <TableCell align="center" className="custom-border-tcell primary-tcell">
                                                    <span className={`status-badge ${badgeClass}`}>
                                                        {STATUS_DISPLAY[statusKey] ?? store.status ?? "Unknown"}
                                                    </span>
                                                </TableCell>
                                                <TableCell align="center" className="custom-border-tcell primary-tcell">
                                                    <IconButton className="primary-edit-btn" size="small" onClick={() => handleOpenEdit(store)}>
                                                        <FiEdit />
                                                    </IconButton>
                                                    <IconButton className="primary-delete-btn" size="small" onClick={() => console.log("Delete clicked")}>
                                                        <PiTrashSimpleFill />
                                                    </IconButton>
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
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <PrimaryPagination
                            totalItems={materialStores?.total || 0}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            onPageChange={handlePageChange}
                            onRowsPerPageChange={handleItemsPerPageChange}
                        />
                    </Box>
                </CardContent>
            </Card>

            <MaterialStoreFormModel
                open={openModal}
                onClose={handleCloseModal}
                onSubmit={handleSubmitMaterialStore}
                initialData={selectedStore || undefined}
                mode={selectedStore ? 'edit' : 'add'}
            />
        </Container>
    );
}

export default MaterialStores;
