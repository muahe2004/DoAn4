import React, { useState } from "react";
import { useGetNormProducts, useExportNormProducts } from "../apis";
import "./NormProductInventorys.css";
import Button from "../../../../components/Button/Button";
import SearchEngine from "../../../../components/SearchEngine/SearchEngine";
import {
  MenuItem,
  Select,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import NormDetailModal from "../components/NormProductDetailModal";

const NormProductInventorys: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNormId, setSelectedNormId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const pageSize = 10;

  // API call
  const { data: normProductsData, isLoading } = useGetNormProducts({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    status: filterStatus === "all" ? undefined : filterStatus,
  });

  const exportMutation = useExportNormProducts({
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `norm-products-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error("Export failed:", error);
      alert("Xuấất bại. Vui lòng thử lại.");
    },
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleExport = () => {
    exportMutation.mutate({
      search: searchTerm,
      status: filterStatus === "all" ? undefined : filterStatus,
      format: "excel",
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewDetail = (normId: string) => {
    setSelectedNormId(normId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedNormId(null);
  };

  const totalPages = Math.ceil((normProductsData?.total || 0) / pageSize);

  return (
    <div className="norm-product-inventorys">
      {/* Header */}
      <div className="norm-product-header">
        <div className="norm-product-controls">
          <Select
            value={filterStatus}
            onChange={(e) => handleFilterChange(e.target.value)}
            size="small"
            variant="outlined"
            className="primary-text__field"
            MenuProps={{
              disableScrollLock: true,
            }}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="ACTIVE">Hoạt động</MenuItem>
            <MenuItem value="INACTIVE">Không hoạt động</MenuItem>
          </Select>
          <div className="product-actions">
            <SearchEngine placeholder="Tìm kiếm" onSearch={handleSearch} />
            <Button onClick={handleExport}>
              {exportMutation.isPending
                ? "Đang xuất..."
                : "Kết xuất định mức sản phẩm"}
            </Button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="norm-product-table-section">
        {isLoading ? (
          <div className="loading-state">Đang tải dữ liệu...</div>
        ) : (
          <>
            <div className="table-container">
              <Table stickyHeader aria-label="norms table">
                <TableHead className="primary-thead">
                  <TableRow>
                    <TableCell className="primary-tcell" align="center">
                      STT
                    </TableCell>
                    <TableCell className="primary-tcell" align="center">
                      Mã sản phẩm xuất khẩu
                    </TableCell>
                    <TableCell className="primary-tcell" align="center">
                      Tên sản phẩm xuất khẩu
                    </TableCell>
                    <TableCell className="primary-tcell" align="center">
                      Đơn vị tính
                    </TableCell>
                    <TableCell className="primary-tcell" align="center">
                      Định mức
                    </TableCell>
                    <TableCell className="primary-tcell" align="center">
                      Hành động
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {normProductsData?.data?.map((item, index) => (
                    <tr key={item.id}>
                      <TableCell
                        className="custom-border-tcell primary-tcell"
                        align="center"
                      >
                        {(currentPage - 1) * pageSize + index + 1}
                      </TableCell>
                      <TableCell
                        className="custom-border-tcell primary-tcell"
                        align="center"
                      >
                        {item.product_code}
                      </TableCell>
                      <TableCell
                        className="custom-border-tcell primary-tcell"
                        align="center"
                      >
                        {item.product_name}
                      </TableCell>
                      <TableCell
                        className="custom-border-tcell primary-tcell"
                        align="center"
                      >
                        {item.unit_name}
                      </TableCell>
                      <TableCell
                        className="custom-border-tcell primary-tcell"
                        align="center"
                      >
                        <span className="norm-name">{item.norm_name}</span>
                      </TableCell>
                      <TableCell
                        className="custom-border-tcell primary-tcell"
                        align="center"
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetail(item.id)}
                          className="view-btn-action"
                          title="Xem chi tiết"
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </tr>
                  )) || []}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`pagination-btn ${
                        currentPage === page ? "active" : ""
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal chi tiết */}
      <NormDetailModal
        open={modalOpen}
        onClose={handleCloseModal}
        normProductId={selectedNormId}
      />
    </div>
  );
};

export default NormProductInventorys;
