import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Pagination,
  PaginationItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import "./UoM.css";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";

const UoM: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([
    {
      id: 1,
      customsCode: "PCE",
      localCode: "PCS",
      createdAt: "2025-12-27",
      description: "Đơn vị chuẩn sản phẩm",
    },
    {
      id: 2,
      customsCode: "KG",
      localCode: "KG",
      createdAt: "2025-12-20",
      description: "Khối lượng chuẩn",
    },
  ]);
  const [search, setSearch] = useState("");
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [activeRowId, setActiveRowId] = useState<number | null>(null);
  const [formState, setFormState] = useState({
    customsCode: "",
    localCode: "",
    description: "",
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const filteredRows = useMemo(() => {
    if (!search.trim()) {
      return rows;
    }
    const keyword = search.trim().toLowerCase();
    return rows.filter(
      (row) =>
        row.customsCode.toLowerCase().includes(keyword) ||
        row.localCode.toLowerCase().includes(keyword) ||
        row.description.toLowerCase().includes(keyword)
    );
  }, [search, rows]);

  const resetForm = () => {
    setFormState({
      customsCode: "",
      localCode: "",
      description: "",
    });
    setActiveRowId(null);
  };

  const openDialog = (mode: "add" | "edit", rowId?: number) => {
    if (mode === "edit" && rowId) {
      const row = rows.find((item) => item.id === rowId);
      if (row) {
        setFormState({
          customsCode: row.customsCode,
          localCode: row.localCode,
          description: row.description,
        });
        setActiveRowId(rowId);
      }
    } else {
      resetForm();
    }
    setDialogMode(mode);
    setOpen(true);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const customsCode = formState.customsCode.trim().toUpperCase();
    const localCode = formState.localCode.trim().toUpperCase();
    if (!customsCode || !localCode) {
      return;
    }
    if (dialogMode === "add") {
      setRows((prev) => [
        {
          id: Date.now(),
          customsCode,
          localCode,
          description: formState.description.trim(),
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]);
    } else if (activeRowId !== null) {
      setRows((prev) =>
        prev.map((row) =>
          row.id === activeRowId
            ? {
                ...row,
                customsCode,
                localCode,
                description: formState.description.trim(),
              }
            : row
        )
      );
    }
    setOpen(false);
    resetForm();
  };

  const handleDelete = (rowId: number) => {
    setRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleDownloadTemplate = () => {
    const header = "Customs Code,Local Code,Description\n";
    const body = rows
      .map(
        (row) =>
          `${row.customsCode},${row.localCode},${row.description.replace(
            /,/g,
            ";"
          )}`
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "mau-doi-sanh-dvt.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split(/\r?\n/).filter((line) => line.trim());
      if (lines.length <= 1) {
        return;
      }
      const newEntries = lines.slice(1).map((line) => {
        const [customsCode, localCode, description] = line.split(",");
        return {
          id: Date.now() + Math.random(),
          customsCode: (customsCode || "").trim().toUpperCase(),
          localCode: (localCode || "").trim().toUpperCase(),
          description: (description || "").trim(),
          createdAt: new Date().toISOString().slice(0, 10),
        };
      });
      setRows((prev) => [...newEntries, ...prev]);
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <Box className="root-page">
      <div className="exports-header">
        <div className="exports-title">
          <p className="exports-title__label">BẢNG QUY ĐỔI ĐƠN VỊ TÍNH</p>
        </div>
        <Box className="toolbar">
          <Box className="left-tools">
            <SearchEngine placeholder="Tìm kiếm" onSearch={(event) => handleSearch(event.target.value)} />
          </Box>

          <Box className="right-tools">
            <Button
              className="btn-sample"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={handleDownloadTemplate}
            >
              Mẫu đối sánh ĐVT
            </Button>
            <Button
              variant="outlined"
              className="btn-add"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={triggerImport}
            >
              Import từ file Excel
            </Button>
            <Button
              className="btn-add"
              variant="contained"
              onClick={() => openDialog("add")}
            >
              Thêm mới
            </Button>
          </Box>
        </Box>
      </div>

      <Paper
        sx={{ boxShadow: "none", border: "1px solid var(--border-color)" }}
      >
        <TableContainer className="custom-scrollbar primary-table-theme primary-table-container">
          <Table stickyHeader size="small">
            <TableHead className="primary-thead">
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
                  Hành động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody className="primary-tbody">
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    className="table-body-cell"
                    sx={{ height: 200, color: "#999", border: "none" }}
                  >
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    className="table-body-cell"
                    sx={{ height: 200, color: "#999", border: "none" }}
                  >
                    Chưa có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell className="table-body-cell">
                      {!loading ? index + 1 : "..."}
                    </TableCell>
                    <TableCell className="table-body-cell" align="left">
                      {row.localCode}
                    </TableCell>
                    <TableCell className="table-body-cell" align="left">
                      {row.customsCode}
                    </TableCell>
                    <TableCell className="table-body-cell">
                      {row.createdAt}
                    </TableCell>
                    <TableCell className="table-body-cell" align="left">
                      {row.description || "-"}
                    </TableCell>
                    <TableCell className="table-body-cell">
                      <IconButton
                        size="small"
                        onClick={() => openDialog("edit", row.id)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(row.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
            gap: 1,
          }}
        >
          <Pagination
            count={Math.max(1, Math.ceil(rows.length / 10))}
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

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
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
              <TextField
                fullWidth
                size="small"
                placeholder="Mã hải quan"
                value={formState.customsCode}
                onChange={(event) =>
                  handleFormChange("customsCode", event.target.value)
                }
              />
            </Grid>
            <Grid size={6}>
              <label className="label-input">
                Mã đơn vị nội bộ <span>*</span>
              </label>
              <TextField
                fullWidth
                size="small"
                placeholder="Mã nội bộ"
                value={formState.localCode}
                onChange={(event) =>
                  handleFormChange("localCode", event.target.value)
                }
              />
            </Grid>
            <Grid size={12}>
              <label className="label-input">Mô tả đơn vị tính</label>
              <TextField
                fullWidth
                size="small"
                placeholder="Mô tả"
                value={formState.description}
                onChange={(event) =>
                  handleFormChange("description", event.target.value)
                }
              />
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
          <Button className="btn-add" variant="contained" onClick={handleSave}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UoM;
