import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
} from "@mui/material";
import { FiFileText, FiGrid, FiCpu } from "react-icons/fi";
import { useState } from "react";
import Button from "../../../../components/Button/Button";
import PrimaryPagination from "../../../../components/Pagination/Pagination";
import SearchEngine from "../../../../components/SearchEngine/SearchEngine";
import { useGetFiscalExportDeclarations } from "../apis/getFiscalExportDeclarations";
import { useGetFiscalExportDeclarationDetails } from "../apis/getFiscalExportDeclarationDetails";
import { STATUS_DISPLAY } from "../../../../utils/statusDisplay";
import { formatQuantity, getVarianceStatus } from "../utils/quantity";

import "./export.css";

function SetupFiscalExportDeclarations() {
  const [pageList, setPageList] = useState(1);
  const [rowsPerPageList, setRowsPerPageList] = useState(5);
  const [pageDetail, setPageDetail] = useState(1);
  const [rowsPerPageDetail, setRowsPerPageDetail] = useState(5);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const listParams = {
    limit: rowsPerPageList,
    skip: (pageList - 1) * rowsPerPageList,
    ...(search && { search }),
    ...(fromDate && { start_date: fromDate }),
    ...(toDate && { end_date: toDate }),
  };

  const detailParams = {
    limit: rowsPerPageDetail,
    skip: (pageDetail - 1) * rowsPerPageDetail,
    ...(search && { search }),
  };

  const { data: fiscalExportDeclarationsData } = useGetFiscalExportDeclarations(
    listParams,
    { enabled: viewMode === "list" }
  );

  const { data: fiscalExportDeclarationDetailsData } =
    useGetFiscalExportDeclarationDetails(detailParams, {
      enabled: viewMode === "detail",
    });

  const handlePageChange = (newPage: number) => {
    if (viewMode === "list") {
      setPageList(newPage);
    } else {
      setPageDetail(newPage);
    }
  };

  const resetActivePage = () => {
    if (viewMode === "list") {
      setPageList(1);
    } else {
      setPageDetail(1);
    }
  };

  const handleItemsPerPageChange = (value: number) => {
    if (viewMode === "list") {
      setRowsPerPageList(value);
      setPageList(1);
    } else {
      setRowsPerPageDetail(value);
      setPageDetail(1);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    resetActivePage();
  };

  return (
    <Container maxWidth={false} className="primary-container">
      <div className="exports-header">
        <div className="exports-title">
          <p className="exports-title__label">ÁP DỮ LIỆU TỜ KHAI XUẤT</p>
        </div>
        <Box className="filter-left-side" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box className="date-range-picker">
                <TextField
                size="small"
                type="date"
                variant="standard"
                InputProps={{ disableUnderline: true }}
                value={fromDate}
                onChange={(event) => {
                    setFromDate(event.target.value);
                    resetActivePage();
                }}
                />
                <span>→</span>
                <TextField
                size="small"
                type="date"
                variant="standard"
                InputProps={{ disableUnderline: true }}
                value={toDate}
                onChange={(event) => {
                    setToDate(event.target.value);
                    resetActivePage();
                }}
                />
            </Box>

            <Box className="search-box-container">
                <SearchEngine
                placeholder="Số tờ khai xuất, bill, HS code..."
                onSearch={handleSearch}
                />
            </Box>
            </Box>
            <Button startIcon={<FiCpu />}>Tính toán đối soát</Button>
        </Box>
      </div>

      <Card className="fiscal-card">
        <Box className="card-header-view">
          <Typography variant="h6" className="table-title">
            {viewMode === "list" ? "THÔNG TIN TỜ KHAI" : "CHI TIẾT TỜ KHAI"}
          </Typography>
          <Box className="view-mode-icons">
            <IconButton
              size="small"
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
            >
              <FiGrid />
            </IconButton>
            <IconButton
              size="small"
              className={viewMode === "detail" ? "active" : ""}
              onClick={() => setViewMode("detail")}
            >
              <FiFileText />
            </IconButton>
          </Box>
        </Box>

        <CardContent sx={{ p: 0 }}>
          <TableContainer className="custom-scrollbar primary-table-theme primary-table-container export-declarations-table">
            <Table stickyHeader size="small">
              <TableHead className="fiscal-table-head primary-thead">
                {viewMode === "list" ? (
                  <TableRow>
                    <TableCell align="center">SỐ TỜ KHAI</TableCell>
                    <TableCell align="center">NGÀY</TableCell>
                    <TableCell align="center">MÃ LOẠI HÌNH</TableCell>
                    <TableCell align="center">SỐ HÓA ĐƠN</TableCell>
                    <TableCell align="center">NGƯỜI XUẤT KHẨU</TableCell>
                    <TableCell align="center">NGƯỜI NHẬP KHẨU</TableCell>
                    <TableCell align="center">ĐKVC</TableCell>
                    <TableCell align="center">TRẠNG THÁI</TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell align="center" sx={{ minWidth: 120 }}>
                      SỐ TỜ KHAI
                    </TableCell>
                    <TableCell align="center" sx={{ minWidth: 100 }}>
                      NGÀY
                    </TableCell>
                    <TableCell align="center">MÃ LOẠI HÌNH</TableCell>
                    <TableCell align="center" sx={{ minWidth: 150 }}>
                      MÃ HÀNG HOÁ
                    </TableCell>
                    <TableCell align="center" sx={{ minWidth: 200 }}>
                      TÊN HÀNG HOÁ
                    </TableCell>
                    <TableCell align="center">ĐƠN VỊ</TableCell>
                    <TableCell align="center">SỐ LƯỢNG</TableCell>
                    <TableCell align="center">ĐƠN GIÁ</TableCell>
                    <TableCell align="center">STT HÀNG</TableCell>
                    <TableCell align="center">ĐƠN VỊ(HQ)</TableCell>
                    <TableCell align="center">SỐ LƯỢNG(HQ)</TableCell>
                    <TableCell align="center" sx={{ minWidth: 130 }}>
                      SL THEO TK QUY ĐỔI(1)
                    </TableCell>
                    <TableCell align="center" sx={{ minWidth: 130 }}>
                      SL THEO SỔ QUY ĐỔI(2)
                    </TableCell>
                    <TableCell align="center" sx={{ minWidth: 100 }}>
                      SAI LỆCH
                    </TableCell>
                  </TableRow>
                )}
              </TableHead>
              <TableBody className="primary-tbody">
                {viewMode === "list" ? (
                  fiscalExportDeclarationsData?.data &&
                  fiscalExportDeclarationsData.data.length > 0 ? (
                    fiscalExportDeclarationsData.data.map(
                      (declaration, index) => {
                        const statusKey =
                          declaration.status?.toLowerCase?.() ?? "";
                        const badgeClass = STATUS_DISPLAY[statusKey]
                          ? `status-${statusKey}`
                          : "status-unknown";
                        return (
                          <TableRow key={`${declaration.export_declaration_number}-${index}`}>
                            <TableCell align="center">
                              {declaration.export_declaration_number || "-"}
                            </TableCell>
                            <TableCell align="center">
                              {declaration.licence_date
                                ? new Date(
                                    declaration.licence_date
                                  ).toLocaleDateString("vi-VN")
                                : "-"}
                            </TableCell>
                            <TableCell align="center">
                              {declaration.type_declaration || "-"}
                            </TableCell>
                            <TableCell align="center">
                              {declaration.bill_number || "-"}
                            </TableCell>
                            <TableCell align="center">
                              {declaration.importer || "-"}
                            </TableCell>
                            <TableCell align="center">{"-"}</TableCell>
                            <TableCell align="center">
                              {declaration.shipping_term || "-"}
                            </TableCell>
                            <TableCell align="center">
                              <span className={`status-badge ${badgeClass}`}>
                                {STATUS_DISPLAY[statusKey] ??
                                  declaration.status ??
                                  "Unknown"}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        align="center"
                        sx={{ py: 10, color: "#999" }}
                      >
                        Chưa có dữ liệu trong hệ thống
                      </TableCell>
                    </TableRow>
                  )
                ) : fiscalExportDeclarationDetailsData?.data &&
                  fiscalExportDeclarationDetailsData.data.length > 0 ? (
                  fiscalExportDeclarationDetailsData.data.map(
                    (detail, index) => {
                      const quantity = detail.quantity ?? 0;
                      const quantity2 = detail.quantity2 ?? 0;
                      const conversion = detail.conversion_factor ?? 1;
                      const convertedDeclarationQty = quantity * conversion;
                      const convertedAccountingQty = quantity2;
                      const variance =
                        convertedAccountingQty - convertedDeclarationQty;
                      const varianceStatus = getVarianceStatus(
                        variance,
                        convertedDeclarationQty || convertedAccountingQty || 1
                      );

                      return (
                        <TableRow key={detail.id}>
                          <TableCell align="center">
                            {detail.export_declaration_number || "-"}
                          </TableCell>
                          <TableCell align="center">
                            {detail.licence_date
                              ? new Date(
                                  detail.licence_date
                                ).toLocaleDateString("vi-VN")
                              : "-"}
                          </TableCell>
                          <TableCell align="center">
                            {detail.type_declaration || "-"}
                          </TableCell>
                          <TableCell align="center">
                            {detail.product_code || "-"}
                          </TableCell>
                          <TableCell align="center">
                            {detail.product_name || "-"}
                          </TableCell>
                          <TableCell align="center">
                            {detail.unit_name || "-"}
                          </TableCell>
                          <TableCell align="center">
                            {detail.quantity !== undefined
                              ? detail.quantity.toLocaleString("vi-VN")
                              : "-"}
                          </TableCell>
                          <TableCell align="center">
                            {detail.unit_price !== undefined
                              ? detail.unit_price.toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })
                              : "-"}
                          </TableCell>
                          <TableCell align="center">
                            {detail.hs_code || "-"}
                          </TableCell>
                          <TableCell align="center">
                            {detail.unit_name_2 || "-"}
                          </TableCell>
                          <TableCell align="center">
                            {detail.quantity2 !== undefined
                              ? detail.quantity2.toLocaleString("vi-VN")
                              : "-"}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: "bold",
                              color: "#1976d2",
                            }}
                          >
                            {formatQuantity(convertedDeclarationQty)}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: "bold",
                              color: "#2e7d32",
                            }}
                          >
                            {formatQuantity(convertedAccountingQty)}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: "bold",
                              color:
                                variance === 0
                                  ? "#666"
                                  : variance > 0
                                  ? "#2e7d32"
                                  : "#d32f2f",
                            }}
                          >
                            <Box>{formatQuantity(variance)}</Box>
                            <Box
                              sx={{
                                fontWeight: "bold",
                                fontSize: "0.75rem",
                                color: varianceStatus.color,
                                bgcolor: varianceStatus.bg,
                                borderRadius: 1,
                                px: 1,
                                mt: 0.5,
                              }}
                            >
                              {varianceStatus.label}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={15}
                      align="center"
                      sx={{ py: 10, color: "#999" }}
                    >
                      Chưa có dữ liệu trong hệ thống
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
        <Box
        sx={{
            p: 1,
            display: "flex",
            justifyContent: "flex-end",
        }}
        >
        <PrimaryPagination
            totalItems={
            viewMode === "list"
                ? fiscalExportDeclarationsData?.total ?? 0
                : fiscalExportDeclarationDetailsData?.total ?? 0
            }
            page={viewMode === "list" ? pageList : pageDetail}
            rowsPerPage={
            viewMode === "list" ? rowsPerPageList : rowsPerPageDetail
            }
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleItemsPerPageChange}
        />
        </Box>
    </Container>
  );
}

export default SetupFiscalExportDeclarations;
