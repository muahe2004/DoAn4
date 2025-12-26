import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Select,
  MenuItem,
  Pagination,
  PaginationItem,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import CloseIcon from "@mui/icons-material/Close";
import "./UoM.css";

const UoM: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  return (
    <Box className="root-page">
      <Box className="toolbar">
        <Box className="left-tools">
          <Select
            size="small"
            displayEmpty
            value=""
            sx={{ height: 36, width: 160, bgcolor: "#fff" }}
          >
            <MenuItem value="">Thời gian thêm</MenuItem>
          </Select>

          <TextField
            size="small"
            placeholder="Mã hải quan, mã nội bộ..."
            className="search-textfield"
            sx={{ width: 280 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Box className="search-icon-wrapper">
                    <SearchIcon fontSize="small" />
                  </Box>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box className="right-tools">
          <Button
            className="btn-sample"
            startIcon={<FileDownloadOutlinedIcon />}
          >
            Mẫu đối sánh ĐVT
          </Button>
          <Button
            className="btn-import"
            variant="outlined"
            startIcon={<FileDownloadOutlinedIcon />}
          >
            Import từ file Excel
          </Button>
          <Button
            className="btn-add"
            variant="contained"
            onClick={() => setOpen(true)}
            startIcon={
              <Box component="span" sx={{ fontWeight: "bold" }}>
                +
              </Box>
            }
          >
            Thêm mới
          </Button>
        </Box>
      </Box>

      <Paper
        sx={{ boxShadow: "none", border: "1px solid var(--border-color)" }}
      >
        <TableContainer sx={{ minHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell className="table-header-cell" sx={{ width: 60 }}>
                  STT
                </TableCell>
                <TableCell
                  className="table-header-cell"
                  align="left"
                  sx={{ width: 180, pl: 2.5 }}
                >
                  Mã đơn vị nội bộ
                </TableCell>
                <TableCell
                  className="table-header-cell"
                  align="left"
                  sx={{ width: 140 }}
                >
                  Mã đơn vị hải quan
                </TableCell>
                <TableCell className="table-header-cell" sx={{ width: 120 }}>
                  Ngày thêm
                </TableCell>
                <TableCell className="table-header-cell" align="left">
                  Mô tả thông tin đơn vị tính
                </TableCell>
                <TableCell
                  className="table-header-cell"
                  sx={{
                    width: 100,
                    fontWeight: "400 !important",
                    color: "rgba(255,255,255,0.7) !important",
                  }}
                >
                  Xóa All
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  className="table-body-cell"
                  sx={{ height: 200, color: "#999", border: "none" }}
                >
                  {loading ? "Đang tải dữ liệu..." : "Chưa có dữ liệu"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            p: 1.5,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            bgcolor: "#fafafa",
            borderTop: "1px solid var(--border-color)",
          }}
        >
          <Pagination
            count={10}
            shape="rounded"
            variant="outlined"
            size="small"
            renderItem={(item) => (
              <PaginationItem
                slots={{
                  previous: ArrowBackIosNewIcon,
                  next: ArrowForwardIosIcon,
                }}
                {...item}
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "#e6f7ff",
                    borderColor: "var(--primary-color)",
                    color: "var(--primary-color)",
                  },
                }}
              />
            )}
          />
          <Box
            sx={{
              ml: 2,
              border: "1px solid var(--border-color)",
              p: "4px 8px",
              borderRadius: 1,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              bgcolor: "#fff",
              cursor: "pointer",
            }}
          >
            10 / trang{" "}
            <KeyboardArrowRightIcon
              sx={{ transform: "rotate(90deg)", fontSize: 16 }}
            />
          </Box>
        </Box>
      </Paper>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="dialog-header">
          Thêm mới cặp mã đơn vị tính
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ color: "#fff", p: 0 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid size={6}>
              <label className="label-input">
                Mã đơn vị hải quan <span>*</span>
              </label>
              <TextField fullWidth size="small" placeholder="Mã hải quan" />
            </Grid>
            <Grid size={6}>
              <label className="label-input">
                Mã đơn vị nội bộ <span>*</span>
              </label>
              <TextField fullWidth size="small" placeholder="Mã nội bộ" />
            </Grid>
            <Grid size={12}>
              <label className="label-input">Mô tả đơn vị tính</label>
              <TextField fullWidth size="small" placeholder="Mô tả" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpen(false)}
            variant="outlined"
            sx={{
              color: "var(--primary-color)",
              borderColor: "var(--primary-color)",
              textTransform: "none",
            }}
          >
            Quay lại
          </Button>
          <Button className="btn-add" variant="contained">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UoM;
