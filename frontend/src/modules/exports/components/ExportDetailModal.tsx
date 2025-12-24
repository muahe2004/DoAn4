import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
} from "@mui/material";
import Button from "../../../components/Button/Button";
import type { IExportDetailView } from "../types";

interface ExportDetailModalProps {
  open: boolean;
  loading: boolean;
  posting?: boolean;
  data?: IExportDetailView | null;
  onClose: () => void;
  onEdit?: () => void;
  onPost?: () => void;
}

const formatDate = (value?: string) => (value ? value.split("T")[0] : "-");

export default function ExportDetailModal({
  open,
  loading,
  posting = false,
  data,
  onClose,
  onEdit,
  onPost,
}: ExportDetailModalProps) {
  const status = data?.header?.status || "draft";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle className="primary-dialog-title">
        Chi tiết tờ khai xuất khẩu
      </DialogTitle>
      <DialogContent className="primary-dialog-content">
        {loading && !data ? (
          <div className="exports-loading">
            <CircularProgress />
          </div>
        ) : (
          <>
            <Grid container spacing={2} className="export-header-grid">
              <Grid item xs={6}>
                <div className="export-detail-row">
                  <span className="export-detail-row__label">Số tờ khai</span>
                  <span className="export-detail-row__value">
                    {data?.header.export_declaration_number ?? "-"}
                  </span>
                </div>
              </Grid>
              <Grid item xs={6}>
                <div className="export-detail-row">
                  <span className="export-detail-row__label">Ngày khai</span>
                  <span className="export-detail-row__value">
                    {formatDate(data?.header.licence_date)}
                  </span>
                </div>
              </Grid>
              <Grid item xs={6}>
                <div className="export-detail-row">
                  <span className="export-detail-row__label">Bill</span>
                  <span className="export-detail-row__value">{data?.header.bill_number ?? "-"}</span>
                </div>
              </Grid>
              <Grid item xs={6}>
                <div className="export-detail-row">
                  <span className="export-detail-row__label">Người khai</span>
                  <span className="export-detail-row__value">{data?.header.importer ?? "-"}</span>
                </div>
              </Grid>
              <Grid item xs={6}>
                <div className="export-detail-row">
                  <span className="export-detail-row__label">Mã loại hình</span>
                  <span className="export-detail-row__value">
                    {data?.header.type_declaration ?? "-"}
                  </span>
                </div>
              </Grid>
              <Grid item xs={6}>
                <div className="export-detail-row">
                  <span className="export-detail-row__label">Loại tồn</span>
                  <span className="export-detail-row__value">
                    {data?.header.type_inventory ?? "-"}
                  </span>
                </div>
              </Grid>
              <Grid item xs={6}>
                <div className="export-detail-row">
                  <span className="export-detail-row__label">Điều kiện</span>
                  <span className="export-detail-row__value">
                    {data?.header.shipping_term ?? "-"}
                  </span>
                </div>
              </Grid>
              <Grid item xs={6}>
                <div className="export-detail-row">
                  <span className="export-detail-row__label">Tỷ giá USD</span>
                  <span className="export-detail-row__value">
                    {data?.header.usd_exchange_rate ?? "-"}
                  </span>
                </div>
              </Grid>
            </Grid>

            <div className="export-detail-status">
              <span className={`status-badge status-${status?.toLowerCase()}`}>
                {status}
              </span>
            </div>

            <TableContainer className="primary-table-container">
              <Table size="small">
                <TableHead className="primary-thead">
                  <TableRow>
                    <TableCell className="primary-tcell">Mã HS</TableCell>
                    <TableCell className="primary-tcell">Mã hàng hóa</TableCell>
                    <TableCell className="primary-tcell">Tên hàng hóa</TableCell>
                    <TableCell className="primary-tcell">Xuất xứ</TableCell>
                    <TableCell className="primary-tcell">Đơn vị</TableCell>
                    <TableCell className="primary-tcell">SL</TableCell>
                    <TableCell className="primary-tcell">Đơn giá</TableCell>
                    <TableCell className="primary-tcell">Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data?.details || []).map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>{detail.hs_code}</TableCell>
                      <TableCell>{detail.product_code}</TableCell>
                      <TableCell>{detail.product_name}</TableCell>
                      <TableCell>{detail.origin_country_name}</TableCell>
                      <TableCell>{detail.unit_name}</TableCell>
                      <TableCell>{detail.quantity ?? "-"}</TableCell>
                      <TableCell>{detail.unit_price ?? "-"}</TableCell>
                      <TableCell>{detail.status ?? "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
      <DialogActions className="primary-dialog-actions export-detail-actions">
        <Button onClick={onClose} className="button-cancel">Đóng</Button>
        {onEdit && (
          <Button onClick={onEdit} className="button-primary">Sửa</Button>
        )}
        {onPost && (
          <Button
            onClick={onPost}
            variant="contained"
            disabled={status === "posted" || posting}
          >
            {posting ? "Đang xử lý" : "Tạo phát sinh xuất kho"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
