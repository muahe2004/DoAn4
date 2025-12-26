import { useMemo, useState, type FocusEvent, type MouseEvent } from "react";
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
  TextField,
  Typography,
} from "@mui/material";
import LabelPrimary from "../../../components/Label/Label";
import Button from "../../../components/Button/Button";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import ExportDeclarationModal from "../components/ExportDeclarationModal";
import { useCreateExportDeclaration } from "../apis/createExportDeclaration";
import { useGetExportDeclarationDetail } from "../apis/getExportDeclarationDetail";
import { useGetExportDeclarations } from "../apis/getExportDeclarations";
import type {
  IExportCreateDetailPayload,
  IExportCreatePayload,
} from "../types";
import "./exports.css";
import { STATUS_EXPORT_DECLARATION } from "../../../utils/statusDisplay";
import PrimaryPagination from "../../../components/Pagination/Pagination";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

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
  shipping_term?: string;
  type_declaration: string;
  type_inventory: string;
  usd_exchange_rate?: string;
}

export function Exports() {
  const { showSnackbar } = useSnackbar();
  const [page, setPage] = useState(0);
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
      skip: page * rowsPerPage,
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

  const handleCreateSubmit = (
    header: CreateModalHeader,
    details: IExportCreateDetailPayload[]
  ) => {
    const payload: IExportCreatePayload = {
      export_declaration_number: header.export_declaration_number.trim(),
      bill_number: header.bill_number || undefined,
      licence_date: header.licence_date || undefined,
      importer: header.importer || undefined,
      shipping_term: header.shipping_term || undefined,
      type_declaration: header.type_declaration,
      type_inventory: header.type_inventory,
      usd_exchange_rate: parseExchangeRate(header.usd_exchange_rate),
      status: "draft",
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

  const ClearFilter = () => {
    setDateRange([null, null]);
    setDeclarationNumber("");
    setProductCode("");
    setPage(0);
  };

  const rows = data?.data ?? [];

  return (
    <Container className="primary-container" maxWidth={false}>
      <div className="exports-header">
        <div className="exports-title">
          <p className="exports-title__label">DANH SÁCH TỜ KHAI XUẤT</p>
        </div>
        <div className="exports-actions">
          <Grid container spacing={2}>
            {/* <Grid item xs={12} sm={6} md={3}>
              <LabelPrimary value="Ngày" />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
              </LocalizationProvider>
            </Grid> */}
            <Grid item xs={12} sm={6} md={3}>
              <LabelPrimary value="Số tờ khai" />
              <TextField
                size="small"
                className="primary-text__field"
                fullWidth
                placeholder="Nhập số tờ khai"
                value={declarationNumber}
                onChange={(event) => {
                  setDeclarationNumber(event.target.value);
                  setPage(0);
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LabelPrimary value="Mã sản phẩm" />
              <TextField
                size="small"
                className="primary-text__field"
                fullWidth
                placeholder="Nhập mã sản phẩm"
                value={productCode}
                onChange={(event) => {
                  setProductCode(event.target.value);
                  setPage(0);
                }}
              />
            </Grid>
            <Button
              label="Làm mới"
              variant="text"
              sx={{ backgroundColor: "#000" }}
              className="button-variant__text"
              onClick={() => ClearFilter()}
            />
          </Grid>
          <div className="exports-actions__buttons">
            <Button label="Tạo tờ khai" onClick={() => setCreateOpen(true)} />
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
                Ngày
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
                const badgeClass = STATUS_EXPORT_DECLARATION[statusKey]
                  ? `status-${statusKey}`
                  : "status-unknown";
                const badgeLabel =
                  STATUS_EXPORT_DECLARATION[statusKey] ??
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
      />
    </Container>
  );
}
