import { Container, Button } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import PrimaryPagination from "../../../components/Pagination/Pagination";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import ProductSettlementTable from "../components/ProductSettlementTable";
import { useGetProductSettlementReport } from "../apis/getProductSettlementReport";
import { exportExcel } from "../../../utils/exportExcel";
import axios from "axios";
import { URL_API_SETTLEMENT_REPORT } from "../../../constants/config";
import type { ProductSettlementResponse } from "../types";
import "./reports.css";

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
};

export function ProductSettlementReport() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const params = {
    skip: (page - 1) * rowsPerPage,
    limit: rowsPerPage,
    ...(search && { search }),
  };

  const { data: reportData } = useGetProductSettlementReport(params);

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

  const fetchProductExportData = useCallback(async () => {
    const fallbackLimit = Math.max(rowsPerPage, 1);
    const computedLimit =
      reportData?.total && reportData.total > 0
        ? reportData.total
        : fallbackLimit;
    const response = await axios.get<ProductSettlementResponse>(
      `${URL_API_SETTLEMENT_REPORT}/product-inventory`,
      {
        params: {
          skip: 0,
          limit: Math.max(computedLimit, 1),
          ...(search && { search }),
        },
        withCredentials: true,
      }
    );
    return response.data.data;
  }, [rowsPerPage, reportData?.total, search]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
        const dataToExport = await fetchProductExportData();
        const sanitizedData = dataToExport.map((row) => ({
          product_code: row.product_code,
          product_name: row.product_name,
          unit_name: row.unit_name,
          opening_quantity: row.opening_quantity,
          production_quantity: row.production_quantity,
          export_quantity: row.export_quantity,
          closing_quantity: row.closing_quantity,
        }));
        exportExcel(
          sanitizedData as Record<string, unknown>[],
          "bao-cao-quyet-toan-ton-san-pham",
          {
        title: "BÁO CÁO QUYẾT TOÁN TỒN SẢN PHẨM",
        sectionLabel: dateLabel || undefined,
        headers: {
          product_code: "Mã SP",
          product_name: "Tên SP",
          unit_name: "Đơn vị tính",
          opening_quantity: "Tồn đầu kỳ",
          production_quantity: "Sản xuất trong kỳ",
          export_quantity: "Xuất trong kỳ",
          closing_quantity: "Tồn cuối kỳ",
        },
        includeIndexColumn: true,
      });
    } catch (error) {
      console.error("Export product settlement report failed", error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.detail ?? "Không thể xuất báo cáo"
        : "Không thể xuất báo cáo";
      window.alert(message);
    } finally {
      setIsExporting(false);
    }
  }, [fetchProductExportData, dateLabel]);

  return (
    <Container maxWidth={false} className="primary-container">
      <div className="primary-header">
        <div className="primary-header-title">
          <p className="primary-header-title__label">
            BÁO CÁO QUYẾT TOÁN TỒN SẢN PHẨM
          </p>
          {dateLabel && <p className="report-date">{dateLabel}</p>}
        </div>
        <div className="primary-header-actions">
          <SearchEngine
            placeholder="Mã hoặc tên sản phẩm..."
            onSearch={handleSearch}
          />
          <div className="primary-header-actions__buttons">
          <Button
            variant="contained"
            className="primary-header-action-btn"
            onClick={handleExport}
            disabled={isExporting}
          >
            Xuất Excel
          </Button>
          </div>
        </div>
      </div>

      <ProductSettlementTable
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
