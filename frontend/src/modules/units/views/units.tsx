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
import { useGetUnits } from "../apis/getUnits";
import { FiEdit } from "react-icons/fi";
import { PiTrashSimpleFill } from "react-icons/pi";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import PrimaryPagination from "../../../components/Pagination/Pagination";
import type { IUnit, IUnitResponse } from "../types";
import UnitFormModel from "../components/UnitFormModel";
import Button from "../../../components/Button/Button";
import "./units.css";
import { useCreateUnit } from "../apis/addUnit";
import { useEditUnit } from "../apis/editUnit";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import * as XLSX from "xlsx";
import { STATUS } from "../../../constants/status";
import { STATUS_DISPLAY } from "../../../utils/statusDisplay";
import { useCreateUnitMulti } from "../apis/addUnitMulti";
import { exportExcel } from "../../../utils/exportExcel";

type ImportedUnit = Omit<IUnitResponse, "id"> & {
    id?: string;
};

export function Units() {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [search, setSearch] = useState("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [selectedUnit, setSelectedUnit] = useState<IUnitResponse | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const { showSnackbar } = useSnackbar();
    const { mutateAsync: createUnit } = useCreateUnit({});
    const { mutateAsync: editUnit } = useEditUnit({});
    const { mutateAsync: createUnitMulti } = useCreateUnitMulti({});

    const Params = {
        limit: rowsPerPage,
        skip: (page - 1) * rowsPerPage,
        ...(search && { search }),
    };

    const {
        data: units,
    } = useGetUnits(Params);

    const handlePageChange = (page: number) => {
        setPage(page);
    };

    const handleItemsPerPageChange = (value: number) => {
        setRowsPerPage(value);
        setPage(1);
    };

    const handleOpenEdit = (unit: IUnitResponse) => {
        setSelectedUnit(unit);
        setOpenModal(true);
    }

    const handleOpenAdd = () => {
        setSelectedUnit(null);
        setOpenModal(true);
    }

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedUnit(null);
    }

    const normalizeUnitPayload = (data: IUnitResponse): IUnit => {
        const {
            id,
            unit_code,
            unit_name,
            description,
            status,
        } = data;

        return {
            id,
            unit_code,
            unit_name,
            description,
            status,
        };
    };

    const handleSubmitUnit = async (data: IUnitResponse) => {
        const payload = normalizeUnitPayload(data);
        console.log(payload);
        try {
            if (selectedUnit) {
                await editUnit({
                    id: data.id!,
                    data: payload,
                });
                showSnackbar({ message: "Cập nhật đơn vị tính thành công", severity: "success" });
            } else {
                await createUnit(payload);
                showSnackbar({ message: "Thêm đơn vị tính thành công", severity: "success" });
            }
            handleCloseModal();
        } catch (error) {
            showSnackbar({ message: "Có lỗi xảy ra, vui lòng thử lại", severity: "error" });
        }
    };

    const handleImportUnits = async (data: IUnitResponse[]) => {
        const payload = {
            units: data.map(unit => ({
                unit_code: unit.unit_code,
                unit_name: unit.unit_name,
                description: unit.description,
                status: unit.status,
            }))
        };

        try {
            await createUnitMulti(payload);
            showSnackbar({ message: "Thêm đơn vị tính thành công", severity: "success" });
            handleCloseModal();
        } catch (error) {
            showSnackbar({ message: "Có lỗi xảy ra, vui lòng thử lại", severity: "error" });
        }
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    }

    const handleImport = () => {
        fileInputRef.current?.click();
    }

    const handleExport = () => {
        const headers = {
            number: "STT",
            unit_code: "Mã đơn vị tính",
            unit_name: "Tên đơn vị tính",
            description: "Mô tả",
        };

        const templateRow = {
            number: "",
            unit_code: "",
            unit_name: "",
            description: "",
        };

        exportExcel([templateRow], "units_template", {
            sheetName: "Template",
            headers,
            title: "DANH MỤC ĐƠN VỊ TÍNH",
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

            const mapped: ImportedUnit[] = rows
                .filter((row) => row.some((cell) => `${cell}`.trim() !== ""))
                .map((row) => {
                    const [
                        unit_code_raw = "",
                        unit_name_raw = "",
                        description_raw = "",
                        status_raw = STATUS.ACTIVE,
                    ] = row;

                    const unit_code = `${unit_code_raw}`.trim();
                    const unit_name = `${unit_name_raw}`.trim();
                    const description = `${description_raw}`.trim();
                    const status = `${status_raw}`.trim() || STATUS.ACTIVE;

                    return {
                        unit_code,
                        unit_name,
                        description,
                        status,
                    };
                });

            handleImportUnits(mapped);
        };

        reader.readAsArrayBuffer(file);
        event.target.value = "";
    };

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
                <Table stickyHeader aria-label="units table">
                    <TableHead className="primary-thead">
                        <TableRow>
                            <TableCell className="primary-tcell" align="center">Mã đơn vị tính</TableCell>
                            <TableCell className="primary-tcell" align="center">Tên đơn vị tính</TableCell>
                            <TableCell className="primary-tcell" align="center">Mô tả</TableCell>
                            <TableCell className="primary-tcell" align="center">Trạng thái</TableCell>
                            <TableCell className="primary-tcell" align="center"></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {units?.data.map((unit) => {
                            const statusKey = unit.status?.toLowerCase?.() ?? "";
                            const badgeClass = STATUS_DISPLAY[statusKey] ? `status-${statusKey}` : "status-unknown";

                            return (
                                <TableRow className="primary-trow" key={unit.id}>
                                    <TableCell className="custom-border-tcell primary-tcell">{unit.unit_code}</TableCell>
                                    <TableCell className="custom-border-tcell primary-tcell">{unit.unit_name}</TableCell>
                                    <TableCell className="custom-border-tcell primary-tcell">{unit.description}</TableCell>
                                    <TableCell align="center" className="custom-border-tcell primary-tcell">
                                        <span className={`status-badge ${badgeClass}`}>
                                            {STATUS_DISPLAY[statusKey] ?? unit.status ?? "Unknown"}
                                        </span>
                                    </TableCell>
                                    <TableCell align="center" className="custom-border-tcell primary-tcell">
                                        <IconButton className="primary-edit-btn" size="small" onClick={() => handleOpenEdit(unit)}>
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
                totalItems={units?.total || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleItemsPerPageChange}
            />

            <UnitFormModel
                open={openModal}
                onClose={handleCloseModal}
                onSubmit={handleSubmitUnit}
                initialData={selectedUnit || undefined}
                mode={selectedUnit ? 'edit' : 'add'}
            />
        </Container>
    );
}