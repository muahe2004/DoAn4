import { useMemo, useState, useCallback } from "react";
import {
  CircularProgress,
  Container,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Button from "../../../components/Button/Button";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import ExportDeclarationModal from "../components/ExportDeclarationModal";
import { useCreateExportDeclaration } from "../apis/createExportDeclaration";
import { useGetExportDeclarationDetail } from "../apis/getExportDeclarationDetail";
import { useGetExportDeclarations } from "../apis/getExportDeclarations";
import { useUpdateExportDeclaration } from "../apis/updateExportDeclaration";
import type {
  IExportCreateDetailPayload,
  IExportCreatePayload,
} from "../types";
import "./exports.css";
import { STATUS_DISPLAY } from "../../../utils/statusDisplay";
import PrimaryPagination from "../../../components/Pagination/Pagination";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const formatDate = (value?: string) => (value ? value.split("T")[0] : "-");

const parseExchangeRate = (value?: string) => {
  if (!value) return undefined;
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const formatFilterDate = (value?: Date | null) =>
  value ? value.toISOString().split("T")[0] : undefined;

interface CreateModalHeader {
  export_declaration_number: string;
  bill_number?: string;
  licence_date?: string;
  importer?: string;
  importer_id?: string;
  shipping_term?: string;
  type_declaration: string;
  type_inventory: string;
  usd_exchange_rate?: string;
  currency_id?: string;
  currency_name?: string;
}

export function ExportDeclaration() {
  const { showSnackbar } = useSnackbar();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [declarationNumber, setDeclarationNumber] = useState("");
  const [productCode, setProductCode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedExportId, setSelectedExportId] = useState<string | null>(null);

  const queryParams = useMemo(() => {
    const start = formatFilterDate(dateRange[0]);
    const end = formatFilterDate(dateRange[1]);
    return {
      skip: (page - 1) * rowsPerPage,
      limit: rowsPerPage,
      start_date: start,
      end_date: end,
      export_declaration_number: declarationNumber || undefined,
      product_code: productCode || undefined,
      search: searchTerm || undefined,
    };
  }, [page, rowsPerPage, dateRange, declarationNumber, productCode, searchTerm]);

  const { data, isFetching, refetch } = useGetExportDeclarations(queryParams);
  const detailQuery = useGetExportDeclarationDetail(selectedExportId);
  const createMutation = useCreateExportDeclaration();
  const updateMutation = useUpdateExportDeclaration();

  const handleCreateSubmit = (
    header: CreateModalHeader,
    details: IExportCreateDetailPayload[]
  ) => {
    const payload: IExportCreatePayload = {
      export_declaration_number: header.export_declaration_number.trim(),
      bill_number: header.bill_number || undefined,
      licence_date: header.licence_date || undefined,
      importer: header.importer || undefined,
      importer_id: header.importer_id || undefined,
      shipping_term: header.shipping_term || undefined,
      type_declaration: header.type_declaration,
      type_inventory: header.type_inventory,
      usd_exchange_rate: parseExchangeRate(header.usd_exchange_rate),
      currency_id: header.currency_id || undefined,
      status: "active",
      details,
    };

    createMutation.mutate(payload, {
      onSuccess: (result) => {
        showSnackbar({
          message: `Tạo tờ khai ${result.header.export_declaration_number} thành công`,
          severity: "success",
        });
        setCreateOpen(false);
        refetch();
        setSelectedExportId(result.header.id);
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.detail ?? error?.message ?? String(error);
        showSnackbar({ message, severity: "error" });
      },
    });
  };

  const handleDetailSave = (
    header: CreateModalHeader,
    details: IExportCreateDetailPayload[]
  ) => {
    if (!selectedExportId) return;
    const payload: IExportCreatePayload = {
      export_declaration_number: header.export_declaration_number.trim(),
      bill_number: header.bill_number || undefined,
      licence_date: header.licence_date || undefined,
      importer: header.importer || undefined,
      importer_id: header.importer_id || undefined,
      shipping_term: header.shipping_term || undefined,
      type_declaration: header.type_declaration,
      type_inventory: header.type_inventory,
      usd_exchange_rate: parseExchangeRate(header.usd_exchange_rate),
      currency_id: header.currency_id || undefined,
      status: "active",
      details,
    };

    updateMutation.mutate(
      { id: selectedExportId, data: payload },
      {
        onSuccess: (result) => {
          showSnackbar({
            message: `Cập nhật tờ khai ${result.header.export_declaration_number} thành công`,
            severity: "success",
          });
          detailQuery.refetch();
          refetch();
          setSelectedExportId(result.header.id);
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.detail ?? error?.message ?? String(error);
          showSnackbar({ message, severity: "error" });
        },
      }
    );
  };

  const handleDeclarationSearch = useCallback((value: string) => {
    setDeclarationNumber(value);
    setPage(1);
  }, []);

  const handleProductSearch = useCallback((value: string) => {
    setProductCode(value);
    setPage(1);
  }, []);

  const ClearFilter = () => {
    setDateRange([null, null]);
    setDeclarationNumber("");
    setProductCode("");
    setPage(1);
  };

  const rows = data?.data ?? [];

  return (
    <Container className="primary-container" maxWidth={false}>
      <div className="exports-header">
        <div className="exports-title">
          <p className="exports-title__label">DANH SÁCH TỜ KHAI XUẤT KHẨU</p>
        </div>
        <div className="exports-actions">
          <Grid container spacing={1} className="exports-actions__filters">
            <Grid size={5} className="exports-actions__filter-item">
              <SearchEngine
                placeholder="Nhập số tờ khai"
                onSearch={handleDeclarationSearch}
              />
            </Grid>
            <Grid size={5}>
              <SearchEngine
                placeholder="Nhập mã sản phẩm"
                onSearch={handleProductSearch}
              />
            </Grid>
            <Grid size={2}>
              <Button
                label="Làm mới"
                className="button-variant__text"
                onClick={() => ClearFilter()}
              />
            </ Grid>
          </Grid>
          <div className="exports-actions__buttons">
            <Button className="product-action-btn" label="Tạo tờ khai" onClick={() => setCreateOpen(true)} />
          </div>
        </div>
      </div>

      <TableContainer className="primary-table-container">
        <Table stickyHeader aria-label="materials table">
          <TableHead className="primary-thead">
            <TableRow>
              <TableCell className="primary-tcell" align="center">
                Số tờ khai
              </TableCell>
              <TableCell className="primary-tcell" align="center">
                Ngày cấp phép
              </TableCell>
              <TableCell className="primary-tcell" align="center">
                ĐKVC
              </TableCell>
              <TableCell className="primary-tcell" align="center">
                Mã loại hình
              </TableCell>
              <TableCell className="primary-tcell" align="center">
                Loại tồn
              </TableCell>
              <TableCell className="primary-tcell" align="center">
                Trạng thái
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="primary-tbody">
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {isFetching
                    ? "Đang tải dữ liệu..." : "Không có dữ liệu phù hợp"}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const statusKey = row.status?.toLowerCase?.() ?? "";
                const badgeClass = STATUS_DISPLAY[statusKey]
                  ? `status-${statusKey}`
                  : "status-unknown";
                const badgeLabel =
                  STATUS_DISPLAY[statusKey] ??
                  row.status ??
                  "-";
                return (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell
                      className="custom-border-tcell primary-tcell"
                      width={150}
                    >
                      <Typography
                        onClick={() => setSelectedExportId(row.id)}
                        sx={{
                          textDecoration: "underline",
                          color: "#1976d2",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "2px",
                        }}
                      >
                        {row.export_declaration_number}
                        <OpenInNewIcon sx={{ fontSize: 16 }} />
                      </Typography>
                    </TableCell>
                    <TableCell
                      className="custom-border-tcell primary-tcell"
                      width={100}
                    >
                      {formatDate(row.licence_date)}
                    </TableCell>
                    <TableCell
                      className="custom-border-tcell primary-tcell"
                      width={150}
                    >
                      {row.shipping_term ?? "-"}
                    </TableCell>
                    <TableCell
                      className="custom-border-tcell primary-tcell"
                      width={150}
                    >
                      {row.type_declaration}
                    </TableCell>
                    <TableCell
                      className="custom-border-tcell primary-tcell"
                      width={150}
                    >
                      {row.type_inventory}
                    </TableCell>
                    <TableCell
                      className="custom-border-tcell primary-tcell"
                      width={150}
                      align="center"
                    >
                      <span className={`status-badge ${badgeClass}`}>
                        {badgeLabel}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        {isFetching && rows.length > 0 && (
          <div className="exports-loading">
            <CircularProgress size={32} />
          </div>
        )}
      </TableContainer>

      <PrimaryPagination
          totalItems={data?.total || 0}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(value) => setPage(value)}
          onRowsPerPageChange={(value) => {
              setRowsPerPage(value);
              setPage(1);
          }}
      />

      <ExportDeclarationModal
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        loading={createMutation.isPending}
      />

      <ExportDeclarationModal
        open={Boolean(selectedExportId)}
        mode="detail"
        loading={detailQuery.isFetching}
        data={detailQuery.data ?? null}
        onClose={() => setSelectedExportId(null)}
        onSave={handleDetailSave}
        saving={updateMutation.isPending}
      />
    </Container>
  );
}
