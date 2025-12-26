import { Container } from "@mui/material";
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

    const params = {
        skip: (page - 1) * rowsPerPage,
        limit: rowsPerPage,
        ...(search && { search }),
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
                    <SearchEngine
                        placeholder="Mã hoặc tên nguyên vật liệu..."
                        onSearch={handleSearch}
                    />
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
