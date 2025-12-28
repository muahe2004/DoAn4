import { Container, TextField, Button } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import PrimaryPagination from "../../../components/Pagination/Pagination";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import MaterialSettlementTable from "../components/MaterialSettlementTable";
import { useGetMaterialSettlementReport } from "../apis/getMaterialSettlementReport";
import { exportExcel } from "../../../utils/exportExcel";
import axios from "axios";
import { URL_API_SETTLEMENT_REPORT } from "../../../constants/config";
import type { MaterialSettlementResponse } from "../types";
import "./reports.css";

const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("vi-VN");
};

export function MaterialSettlementReport() {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isExporting, setIsExporting] = useState(false);

    const params = {
        skip: (page - 1) * rowsPerPage,
        limit: rowsPerPage,
        ...(search && { search }),
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
    };

    const { data: reportData } = useGetMaterialSettlementReport(params);

    const dateLabel = useMemo(() => {
        if (!reportData) return "";
        return `${formatDate(reportData.start_date)} - ${formatDate(
            reportData.end_date
        )}`;
    }, [reportData]);

    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        setPage(1);
    }, []);

    const handleStartDateChange = (value: string) => {
        setStartDate(value);
        setPage(1);
    };

    const handleEndDateChange = (value: string) => {
        setEndDate(value);
        setPage(1);
    };

    const fetchMaterialExportData = useCallback(async () => {
        const fallbackLimit = Math.max(rowsPerPage, 1);
        const computedLimit =
            reportData?.total && reportData.total > 0
                ? reportData.total
                : fallbackLimit;
        const response = await axios.get<MaterialSettlementResponse>(
            `${URL_API_SETTLEMENT_REPORT}/material-inventory`,
            {
                params: {
                    skip: 0,
                    limit: Math.max(computedLimit, 1),
                    ...(search && { search }),
                    ...(startDate && { start_date: startDate }),
                    ...(endDate && { end_date: endDate }),
                },
                withCredentials: true,
            }
        );
        return response.data.data;
    }, [rowsPerPage, reportData?.total, search, startDate, endDate]);

    const handleExport = useCallback(async () => {
        setIsExporting(true);
        try {
            const dataToExport = await fetchMaterialExportData();
            const sanitizedData = dataToExport.map((row) => ({
                material_code: row.material_code,
                material_name: row.material_name,
                unit_name: row.unit_name,
                opening_quantity: row.opening_quantity,
                import_quantity: row.import_quantity,
                export_quantity: row.export_quantity,
                closing_quantity: row.closing_quantity,
            }));
            exportExcel(
                sanitizedData as Record<string, unknown>[],
                "bao-cao-quyet-toan-ton-nguyen-vat-lieu",
                {
                title: "BÁO CÁO QUYẾT TOÁN TỒN NGUYÊN VẬT LIỆU",
                sectionLabel: dateLabel || undefined,
                headers: {
                    material_code: "Mã NVL",
                    material_name: "Tên NVL",
                    unit_name: "Đơn vị tính",
                    opening_quantity: "Tồn đầu kỳ",
                    import_quantity: "Nhập trong kỳ",
                    export_quantity: "Xuất trong kỳ",
                    closing_quantity: "Tồn cuối kỳ",
                },
                includeIndexColumn: true,
            });
        } catch (error) {
            console.error("Export material settlement report failed", error);
            const message = axios.isAxiosError(error)
                ? error.response?.data?.detail ?? "Không thể xuất báo cáo"
                : "Không thể xuất báo cáo";
            window.alert(message);
        } finally {
            setIsExporting(false);
        }
    }, [fetchMaterialExportData, dateLabel]);

    return (
        <Container maxWidth={false} className="primary-container">
            <div className="primary-header">
                <div className="primary-header-title">
                    <p className="primary-header-title__label">
                        BÁO CÁO QUYẾT TOÁN TỒN NGUYÊN VẬT LIỆU
                    </p>
                    {dateLabel && (
                        <p className="report-date">{dateLabel}</p>
                    )}
                </div>
                <div className="primary-header-actions">
                    <div className="primary-header-filters">
                        <SearchEngine
                            placeholder="Mã hoặc tên nguyên vật liệu..."
                            onSearch={handleSearch}
                        />
                        <TextField
                            type="date"
                            label="Từ ngày"
                            size="small"
                            value={startDate}
                            onChange={(event) =>
                                handleStartDateChange(event.target.value)
                            }
                            InputLabelProps={{ shrink: true }}
                            className="report-date-input"
                        />
                        <TextField
                            type="date"
                            label="Đến ngày"
                            size="small"
                            value={endDate}
                            onChange={(event) =>
                                handleEndDateChange(event.target.value)
                            }
                            InputLabelProps={{ shrink: true }}
                            className="report-date-input"
                        />
                    </div>
                    <div className="primary-header-actions__buttons">
                        <Button
                            className="primary-header-action-btn"
                            variant="contained"
                            onClick={handleExport}
                            disabled={isExporting}
                        >
                            Xuất Excel
                        </Button>
                    </div>
                   
                </div>
            </div>

            <MaterialSettlementTable
                data={reportData?.data || []}
                page={page}
                rowsPerPage={rowsPerPage}
            />

            <PrimaryPagination
                totalItems={reportData?.total || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={(value) => {
                    setRowsPerPage(value);
                    setPage(1);
                }}
            />
        </Container>
    );
}
