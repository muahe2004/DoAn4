import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import type { INormResponse } from "../types";
import Button from "../../../components/Button/Button";
import { useGetDropdownMaterials } from "../apis/materialsDropdown";
import { useGetDropdownUnits } from "../../units/apis/dropdown";
import "./ViewNormModal.css";

interface ViewNormModalProps {
  open: boolean;
  onClose: () => void;
  norm: INormResponse | null;
}

const ViewNormModal: React.FC<ViewNormModalProps> = ({
  open,
  onClose,
  norm,
}) => {
  // Dropdown data for displaying names
  const { data: materials } = useGetDropdownMaterials({
    skip: 0,
    limit: 1000,
    status: "active",
  });
  const { data: units } = useGetDropdownUnits({
    skip: 0,
    limit: 1000,
    status: "active",
  });

  const getMaterialName = (materialId: string) => {
    return materials?.find((m) => m.id === materialId)?.material_name || "N/A";
  };

  const getUnitName = (unitId: string) => {
    return units?.find((u) => u.id === unitId)?.unit_name || "N/A";
  };

  const formatNormValue = (value: number) => {
    if (value % 1 === 0) {
      return value.toString();
    }
    return parseFloat(value.toFixed(2)).toString();
  };

  if (!norm) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      className="view-norm-modal"
    >
      <DialogTitle className="primary-dialog-title">
        CHI TIẾT ĐỊNH MỨC: {norm.norm_name}
      </DialogTitle>
      <DialogContent className="primary-dialog-content">
        {/* Thông tin định mức */}
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
            Thông tin định mức
          </Typography>

          <Grid container spacing={3}>
            <Grid size={12}>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "text.secondary", mb: 0.5 }}
                >
                  Tên định mức
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "medium", fontSize: "1.1rem" }}
                >
                  {norm.norm_name}
                </Typography>
              </Box>
            </Grid>

            <Grid size={8}>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "text.secondary", mb: 0.5 }}
                >
                  Mô tả
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {norm.description || "Không có mô tả"}
                </Typography>
              </Box>
            </Grid>

            <Grid size={4}>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "text.secondary", mb: 0.5 }}
                >
                  Trạng thái
                </Typography>
                <Chip
                  label={
                    norm.status === "active" ? "Hoạt động" : "Không hoạt động"
                  }
                  color={norm.status === "active" ? "success" : "default"}
                  size="small"
                  sx={{ fontWeight: "medium" }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Chi tiết định mức */}
        <Paper elevation={1}>
          <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Chi tiết định mức ({norm.norm_details?.length || 0} nguyên vật
              liệu)
            </Typography>
          </Box>
          <TableContainer>
            <Table size="medium">
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                    STT
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                    Nguyên vật liệu
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                    Đơn vị tính
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", color: "text.primary" }}
                    align="right"
                  >
                    Định mức
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                    Mô tả
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", color: "text.primary" }}
                    align="center"
                  >
                    Trạng thái
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {norm.norm_details && norm.norm_details.length > 0 ? (
                  norm.norm_details.map((detail, index) => (
                    <TableRow
                      key={detail.id || index}
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                        "&:hover": { backgroundColor: "#f0f0f0" },
                      }}
                    >
                      <TableCell sx={{ fontWeight: "medium" }}>
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getMaterialName(detail.material_id)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getUnitName(detail.unit_id)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatNormValue(detail.norm_value)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {detail.description || "Không có mô tả"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={
                            detail.status === "active"
                              ? "Hoạt động"
                              : "Không hoạt động"
                          }
                          color={
                            detail.status === "active" ? "success" : "default"
                          }
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h6"
                          sx={{ color: "text.secondary", mb: 1 }}
                        >
                          Chưa có chi tiết định mức
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          Định mức này chưa có nguyên vật liệu nào được thiết
                          lập
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </DialogContent>

      <DialogActions className="primary-dialog-actions">
        <Button className="button-cancel" onClick={onClose}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewNormModal;
