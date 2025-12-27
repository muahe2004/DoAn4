import { Container, TextField } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import PrimaryPagination from "../../../components/Pagination/Pagination";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import MaterialSettlementTable from "../components/MaterialSettlementTable";
import { useGetMaterialSettlementReport } from "../apis/getMaterialSettlementReport";
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

    return (
        <Container maxWidth={false} className="primary-container">
            <div className="product-header">
                <div className="product-title">
                    <p className="product-title__label">
                        BÁO CÁO QUYẾT TOÁN TỒN NGUYÊN VẬT LIỆU
                    </p>
                    {dateLabel && (
                        <p className="report-date">{dateLabel}</p>
                    )}
                </div>
                <div className="product-actions">
                    <div className="report-filters">
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
                </div>
            </div>

            <MaterialSettlementTable data={reportData?.data || []} />

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
