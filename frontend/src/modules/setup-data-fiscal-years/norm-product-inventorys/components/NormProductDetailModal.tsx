import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import Button from "../../../../components/Button/Button";
import { useGetNormProductDetail } from "../apis/getNormProductDetail";
import type { INormDetailInfo } from "../types";

interface NormDetailModalProps {
  open: boolean;
  onClose: () => void;
  normProductId: string | null;
}

const NormDetailModal: React.FC<NormDetailModalProps> = ({
  open,
  onClose,
  normProductId,
}) => {
  const { data: detail, isLoading } = useGetNormProductDetail(
    normProductId || "",
    {
      enabled: !!normProductId && open,
    }
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatNormValue = (value: number) => {
    if (value % 1 === 0) {
      return value.toString();
    }
    return parseFloat(value.toFixed(2)).toString();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          Chi tiết định mức sản phẩm
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <Typography>Đang tải dữ liệu...</Typography>
          </Box>
        ) : detail ? (
          <Box>
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Thông tin định mức
              </Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Tên định mức:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {detail.norm_name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Ngày tạo:
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(detail.norm_created_at)}
                  </Typography>
                </Box>
                {detail.norm_description && (
                  <Box gridColumn="1 / -1">
                    <Typography variant="body2" color="textSecondary">
                      Mô tả:
                    </Typography>
                    <Typography variant="body1">
                      {detail.norm_description}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Thông tin chi tiết định mức
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>STT</TableCell>
                      <TableCell>Mã NVL</TableCell>
                      <TableCell>Tên NVL</TableCell>
                      <TableCell>Đơn vị tính</TableCell>
                      <TableCell>Định mức</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Mô tả</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detail.norm_details && detail.norm_details.length > 0 ? (
                      detail.norm_details.map(
                        (item: INormDetailInfo, index: number) => (
                          <TableRow key={item.id} hover>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {item.material_code}
                              </Typography>
                            </TableCell>
                            <TableCell>{item.material_name}</TableCell>
                            <TableCell>{item.unit_name}</TableCell>
                            <TableCell>
                              {formatNormValue(item.norm_value)}
                            </TableCell>
                            <TableCell>{item.status}</TableCell>
                            <TableCell>
                              <Typography variant="body2" color="textSecondary">
                                {item.description || "—"}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )
                      )
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography color="textSecondary">
                            Không có dữ liệu chi tiết định mức
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" p={3}>
            <Typography color="error">
              Không thể tải dữ liệu chi tiết
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default NormDetailModal;
