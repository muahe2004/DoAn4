import React, { useState } from "react";
import { useGetNormProducts, useExportNormProducts } from "../apis";
import "./NormProductInventorys.css";
import Button from "../../../../components/Button/Button";
import SearchEngine from "../../../../components/SearchEngine/SearchEngine";
import {
  MenuItem,
  Select,
  IconButton,
  TableHead,
  TableRow,
  TableCell,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import NormDetailModal from "../components/NormProductDetailModal";

const NormProductInventorys: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
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
        <div className="table-header">
          <h2 className="table-title">
            DANH SÁCH CÁC SẢN PHẨM ĐƯỢC ÁP ĐỊNH MỨC
          </h2>

          <div className="table-controls">
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === "table" ? "active" : ""}`}
                onClick={() => setViewMode("table")}
              >
                <span className="table-icon">⊞</span>
              </button>
              <button
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <span className="grid-icon">⊡</span>
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-state">Đang tải dữ liệu...</div>
        ) : (
          <>
            <div className="table-container">
              <table className="norm-product-table">
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
                <tbody>
                  {normProductsData?.data?.map((item, index) => (
                    <tr key={item.id}>
                      <td>{(currentPage - 1) * pageSize + index + 1}</td>
                      <td>{item.product_code}</td>
                      <td>{item.product_name}</td>
                      <td>{item.unit_name}</td>
                      <td>
                        <span className="norm-name">{item.norm_name}</span>
                      </td>
                      <td>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetail(item.id)}
                          className="view-btn-action"
                          title="Xem chi tiết"
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </td>
                    </tr>
                  )) || []}
                </tbody>
              </table>
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
