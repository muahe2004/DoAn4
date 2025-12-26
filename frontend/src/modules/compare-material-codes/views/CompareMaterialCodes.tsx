import {
    Container,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import { type ChangeEvent, useRef, useState } from "react";
import { useGetCompareMaterialCodes } from "../apis/getCompareMaterialCodes";
import { FiEdit } from "react-icons/fi";
import { PiTrashSimpleFill } from "react-icons/pi";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import PrimaryPagination from "../../../components/Pagination/Pagination";
import type { ICompareMaterialCode, ICompareMaterialCodeResponse } from "../types";
import CompareMaterialCodeFormModel from "../components/CompareMaterialCodeFormModel";
import Button from "../../../components/Button/Button";
import "./CompareMaterialCodes.css";
import { useCreateCompareMaterialCode } from "../apis/addCompareMaterialCode";
import { useEditCompareMaterialCode } from "../apis/editCompareMaterialCode";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import * as XLSX from "xlsx";
import { STATUS } from "../../../constants/status";
import { STATUS_DISPLAY } from "../../../utils/statusDisplay";
import { useCreateCompareMaterialCodeMulti } from "../apis/addCompareMaterialCodeMulti";
import { exportExcel } from "../../../utils/exportExcel";

type ImportedCompareMaterialCode = Omit<ICompareMaterialCodeResponse, "id"> & {
    id?: string;
};

export function CompareMaterialCodes() {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [selectedCode, setSelectedCode] = useState<ICompareMaterialCodeResponse | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const { showSnackbar } = useSnackbar();
    const { mutateAsync: createCode } = useCreateCompareMaterialCode({});
    const { mutateAsync: editCode } = useEditCompareMaterialCode({});
    const { mutateAsync: createCodeMulti } = useCreateCompareMaterialCodeMulti({});

    const Params = {
        limit: rowsPerPage,
        skip: (page - 1) * rowsPerPage,
        ...(search && { search }),
    };

    const {
        data: codes,
    } = useGetCompareMaterialCodes(Params);

    const handlePageChange = (page: number) => {
        setPage(page);
    };

    const handleItemsPerPageChange = (value: number) => {
        setRowsPerPage(value);
        setPage(1);
    };

    const handleOpenEdit = (code: ICompareMaterialCodeResponse) => {
        setSelectedCode(code);
        setOpenModal(true);
    }

    const handleOpenAdd = () => {
        setSelectedCode(null);
        setOpenModal(true);
    }

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedCode(null);
    }

    const normalizePayload = (data: ICompareMaterialCodeResponse): ICompareMaterialCode => {
        const {
            id,
            material_id,
            internal_code,
            external_code,
            description,
            status,
        } = data;

        return {
            id,
            material_id,
            internal_code,
            external_code,
            description,
            status,
        };
    };

    const handleSubmit = async (data: ICompareMaterialCodeResponse) => {
        const payload = normalizePayload(data);
        try {
            if (selectedCode) {
                await editCode({
                    id: data.id!,
                    data: payload,
                });
                showSnackbar({ message: "Cập nhật mã so sánh thành công", severity: "success" });
            } else {
                await createCode(payload);
                showSnackbar({ message: "Thêm mã so sánh thành công", severity: "success" });
            }
            handleCloseModal();
        } catch (error) {
            showSnackbar({ message: "Có lỗi xảy ra, vui lòng thử lại", severity: "error" });
        }
    };

    const handleImport = () => {
        fileInputRef.current?.click();
    }

    const handleExport = () => {
        const headers = {
            number: "STT",
            material_id: "Mã nguyên vật liệu",
            internal_code: "Mã nội bộ",
            external_code: "Mã hải quan",
            description: "Mô tả",
        };

        const templateRow = {
            number: "",
            material_id: "",
            internal_code: "",
            external_code: "",
            description: "",
        };

        exportExcel([templateRow], "compare_material_codes_template", {
            sheetName: "Template",
            headers,
            title: "DANH MỤC MÃ SO SÁNH",
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

            const mapped: ImportedCompareMaterialCode[] = rows
                .filter((row) => row.some((cell) => `${cell}`.trim() !== ""))
                .map((row) => {
                    const [
                        material_id_raw = "",
                        internal_code_raw = "",
                        external_code_raw = "",
                        description_raw = "",
                        status_raw = STATUS.ACTIVE,
                    ] = row;

                    return {
                        material_id: `${material_id_raw}`.trim(),
                        internal_code: `${internal_code_raw}`.trim(),
                        external_code: `${external_code_raw}`.trim(),
                        description: `${description_raw}`.trim(),
                        status: `${status_raw}`.trim() || STATUS.ACTIVE,
                    };
                });

            handleImportMulti(mapped);
        };

        reader.readAsArrayBuffer(file);
        event.target.value = "";
    };

    const handleImportMulti = async (data: ICompareMaterialCodeResponse[]) => {
        const payload = {
            compare_material_codes: data.map(code => ({
                material_id: code.material_id,
                internal_code: code.internal_code,
                external_code: code.external_code,
                description: code.description,
                status: code.status,
            }))
        };

        try {
            await createCodeMulti(payload);
            showSnackbar({ message: "Import mã so sánh thành công", severity: "success" });
        } catch (error) {
            showSnackbar({ message: "Có lỗi xảy ra, vui lòng thử lại", severity: "error" });
        }
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    }

    return (
        <Container maxWidth={false} className="primary-container">
            <div className="unit-actions">
                <SearchEngine placeholder="Tìm kiếm" onSearch={handleSearch}/>
                <Button onClick={handleExport} className="unit-upload-button">Xuất mẫu excel</Button>
                <Button onClick={handleImport} className="unit-upload-button">tải lên</Button>
                <Button onClick={handleOpenAdd}>thêm mới</Button>
            </div>
            <input
                type="file"
                accept=".xlsx,.xls,.xlsm,.xlsb"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
            />

            <TableContainer className="primary-table-container">
                <Table stickyHeader aria-label="compare material codes table">
                    <TableHead className="primary-thead">
                        <TableRow>
                            <TableCell className="primary-tcell" align="center">Mã nguyên vật liệu</TableCell>
                            <TableCell className="primary-tcell" align="center">Tên nguyên vật liệu</TableCell>
                            <TableCell className="primary-tcell" align="center">Mã nội bộ</TableCell>
                            <TableCell className="primary-tcell" align="center">Mã hải quan</TableCell>
                            <TableCell className="primary-tcell" align="center">Mô tả</TableCell>
                            <TableCell className="primary-tcell" align="center">Trạng thái</TableCell>
                            <TableCell className="primary-tcell" align="center"></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {codes?.data.map((code) => {
                            const statusKey = code.status?.toLowerCase?.() ?? "";
                            const badgeClass = STATUS_DISPLAY[statusKey] ? `status-${statusKey}` : "status-unknown";

                            return (
                                <TableRow className="primary-trow" key={code.id}>
                                    <TableCell className="custom-border-tcell primary-tcell">{code.material_code || '-'}</TableCell>
                                    <TableCell className="custom-border-tcell primary-tcell">{code.material_name || '-'}</TableCell>
                                    <TableCell className="custom-border-tcell primary-tcell">{code.internal_code || '-'}</TableCell>
                                    <TableCell className="custom-border-tcell primary-tcell">{code.external_code || '-'}</TableCell>
                                    <TableCell className="custom-border-tcell primary-tcell">{code.description || '-'}</TableCell>
                                    <TableCell align="center" className="custom-border-tcell primary-tcell">
                                        <span className={`status-badge ${badgeClass}`}>
                                            {STATUS_DISPLAY[statusKey] ?? code.status ?? "Unknown"}
                                        </span>
                                    </TableCell>
                                    <TableCell align="center" className="custom-border-tcell primary-tcell">
                                        <IconButton className="primary-edit-btn" size="small" onClick={() => handleOpenEdit(code)}>
                                            <FiEdit />
                                        </IconButton>
                                        <IconButton className="primary-delete-btn" size="small" onClick={() => console.log("Delete clicked")}>
                                            <PiTrashSimpleFill />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <PrimaryPagination
                totalItems={codes?.total || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleItemsPerPageChange}
            />

            <CompareMaterialCodeFormModel
                open={openModal}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                initialData={selectedCode || undefined}
                mode={selectedCode ? 'edit' : 'add'}
            />
        </Container>
    );
}
