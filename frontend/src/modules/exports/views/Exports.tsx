import { useMemo, useState } from "react";
import {
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import LabelPrimary from "../../../components/Label/Label";
import Button from "../../../components/Button/Button";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import ExportDeclarationCreateModal from "../components/ExportDeclarationCreateModal";
import ExportDetailModal from "../components/ExportDetailModal";
import { useCreateExportDeclaration } from "../apis/createExportDeclaration";
import { useGetExportDeclarationDetail } from "../apis/getExportDeclarationDetail";
import { useGetExportDeclarations } from "../apis/getExportDeclarations";
import { usePostExportDeclaration } from "../apis/postExportDeclaration";
import type { IExportCreateDetailPayload, IExportCreatePayload } from "../types";
import "./exports.css";

const formatDate = (value?: string) => (value ? value.split("T")[0] : "-");

const parseExchangeRate = (value?: string) => {
  if (!value) return undefined;
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? undefined : parsed;
};

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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [declarationNumber, setDeclarationNumber] = useState("");
  const [productCode, setProductCode] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedExportId, setSelectedExportId] = useState<string | null>(null);

  const queryParams = useMemo(
    () => ({
      skip: page * rowsPerPage,
      limit: rowsPerPage,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      export_declaration_number: declarationNumber || undefined,
      product_code: productCode || undefined,
    }),
    [page, rowsPerPage, startDate, endDate, declarationNumber, productCode],
  );

  const { data, isFetching, refetch } = useGetExportDeclarations(queryParams);
  const detailQuery = useGetExportDeclarationDetail(selectedExportId);
  const createMutation = useCreateExportDeclaration();
  const postMutation = usePostExportDeclaration();

  const handleCreateSubmit = (header: CreateModalHeader, details: IExportCreateDetailPayload[]) => {
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
        const message = error?.response?.data?.detail ?? error?.message ?? String(error);
        showSnackbar({ message, severity: "error" });
      },
    });
  };

  const handlePost = () => {
    if (!selectedExportId) return;
    postMutation.mutate(selectedExportId, {
      onSuccess: () => {
        showSnackbar({
          message: "Đã tạo phát sinh xuất kho cho tờ khai",
          severity: "success",
        });
        detailQuery.refetch();
        refetch();
      },
      onError: (error: any) => {
        const message = error?.response?.data?.detail ?? error?.message ?? String(error);
        showSnackbar({ message, severity: "error" });
      },
    });
  };

  const rows = data?.data ?? [];

  return (
    <div>
      <div className="export-header">
        <div className="export-heading">
          <div>
            <Typography variant="h5" className="export-heading__title">
              Danh sách tờ khai xuất
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Chỉ số tờ khai và hàng hóa xuất được hiển thị theo dòng hàng với khả năng truy vết về chi tiết.
            </Typography>
          </div>
          <div className="export-actions">
            <Button label="Tạo tờ khai" onClick={() => setCreateOpen(true)} />
            <Button
              label="Làm mới"
              variant="text"
              className="button-variant__text"
              onClick={() => refetch()}
            />
          </div>
        </div>

        <div className="export-controls">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <LabelPrimary value="Ngày bắt đầu" />
              <TextField
                type="date"
                size="small"
                className="primary-text__field"
                fullWidth
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setPage(0);
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LabelPrimary value="Ngày kết thúc" />
              <TextField
                type="date"
                size="small"
                className="primary-text__field"
                fullWidth
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setPage(0);
                }}
              />
            </Grid>
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
              <LabelPrimary value="Mã hàng" />
              <TextField
                size="small"
                className="primary-text__field"
                fullWidth
                placeholder="Nhập mã hàng"
                value={productCode}
                onChange={(event) => {
                  setProductCode(event.target.value);
                  setPage(0);
                }}
              />
            </Grid>
          </Grid>
        </div>
      </div>

      <TableContainer component={Paper} className="primary-table-container">
        <Table size="small">
          <TableHead className="primary-thead">
            <TableRow>
              <TableCell className="primary-tcell">STT</TableCell>
              <TableCell className="primary-tcell">Số tờ khai</TableCell>
              <TableCell className="primary-tcell">Ngày</TableCell>
              <TableCell className="primary-tcell">ĐKVC</TableCell>
              <TableCell className="primary-tcell">Mã HS</TableCell>
              <TableCell className="primary-tcell">Mã hàng</TableCell>
              <TableCell className="primary-tcell">Tên hàng</TableCell>
              <TableCell className="primary-tcell">Đơn vị</TableCell>
              <TableCell className="primary-tcell">SL</TableCell>
              <TableCell className="primary-tcell">Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  {isFetching ? "Đang tải dữ liệu..." : "Không có dữ liệu phù hợp"}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow
                  key={row.export_detail_id}
                  hover
                  onClick={() => setSelectedExportId(row.export_declaration_id)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{row.export_declaration_number}</TableCell>
                  <TableCell>{formatDate(row.licence_date)}</TableCell>
                  <TableCell>{row.shipping_term ?? "-"}</TableCell>
                  <TableCell>{row.hs_code}</TableCell>
                  <TableCell>{row.product_code}</TableCell>
                  <TableCell>{row.product_name}</TableCell>
                  <TableCell>{row.unit_name}</TableCell>
                  <TableCell>{row.quantity ?? "-"}</TableCell>
                  <TableCell>{row.status ?? "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {isFetching && rows.length > 0 && (
          <div className="exports-loading">
            <CircularProgress size={32} />
          </div>
        )}
      </TableContainer>

      <TablePagination
        component="div"
        count={data?.total ?? 0}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 20, 50]}
      />

      <ExportDeclarationCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        loading={createMutation.isPending}
      />

      <ExportDetailModal
        open={Boolean(selectedExportId)}
        loading={detailQuery.isFetching}
        posting={postMutation.isPending}
        data={detailQuery.data ?? null}
        onClose={() => setSelectedExportId(null)}
        onPost={handlePost}
      />
    </div>
  );
}
