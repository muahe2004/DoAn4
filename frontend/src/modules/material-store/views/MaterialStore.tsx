import React, { useState } from "react";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
} from "@mui/material";
import { FiEdit } from "react-icons/fi";
import { PiTrashSimpleFill } from "react-icons/pi";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import { useGetMaterialInventorys } from "../apis/getMaterialInventorys";
import { useDeleteMaterialInventory } from "../apis/deleteMaterialInventory";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import PrimaryPagination from "../../../components/Pagination/Pagination";
import Button from "../../../components/Button/Button";
import MaterialStoreModal from "../components/MaterialStoreModal";
import type { IMaterialInventory } from "../types";
import "./MaterialStore.css";

const MaterialStore: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInventory, setSelectedInventory] =
    useState<IMaterialInventory | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] =
    useState<IMaterialInventory | null>(null);
  const pageSize = 10;

  const { showSnackbar } = useSnackbar();

  // API calls
  const { data: materialInventorysData, isLoading } = useGetMaterialInventorys({
    skip: (currentPage - 1) * pageSize,
    limit: pageSize,
    search: searchTerm || undefined,
    status: filterStatus === "all" ? undefined : filterStatus,
  });

  const deleteMutation = useDeleteMaterialInventory({
    onSuccess: () => {
      showSnackbar({
        message: "Xóa tồn kho nguyên vật liệu thành công!",
        severity: "success",
      });
      handleCloseDeleteDialog();
    },
    onError: (error) => {
      console.error("Delete failed:", error);
      showSnackbar({
        message: "Xóa tồn kho nguyên vật liệu thất bại. Vui lòng thử lại.",
        severity: "error",
      });
    },
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewDetail = (inventory: IMaterialInventory) => {
    setSelectedInventory(inventory);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedInventory(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedInventory(null);
  };

  const handleOpenDeleteDialog = (inventory: IMaterialInventory) => {
    setInventoryToDelete(inventory);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setInventoryToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!inventoryToDelete?.id) return;

    try {
      await deleteMutation.mutateAsync({ id: inventoryToDelete.id });
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const totalPages = Math.ceil((materialInventorysData?.total || 0) / pageSize);

  return (
    <Container maxWidth={false} className="material-store-container">
      <div className="primary-header">
        <div className="primary-header-title">
          <p className="primary-header-title__label">QUẢN LÝ CHỐT TỒN KHO NGUYÊN VẬT LIỆU</p>
        </div>
        <div className="primary-header-actions">
          <SearchEngine
            placeholder="Tìm kiếm nguyên vật liệu..."
            onSearch={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
          />
          <div className="primary-header-actions__buttons">
            <Button className="primary-header-action-btn" onClick={handleAddNew}>
              Thêm mới
            </Button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <>
          {/* Table */}
          <TableContainer className="material-store-table">
            <Table stickyHeader>
              <TableHead className="primary-thead">
                <TableRow>
                  <TableCell className="primary-tcell" align="center">
                    STT
                  </TableCell>
                  <TableCell className="primary-tcell" align="center">
                    Mã nội bộ
                  </TableCell>
                  <TableCell className="primary-tcell" align="center">
                    Mã hải quan
                  </TableCell>
                  <TableCell className="primary-tcell" align="center">
                    Tên nguyên vật liệu
                  </TableCell>
                  <TableCell className="primary-tcell" align="center">
                    Đơn vị tính
                  </TableCell>
                  <TableCell className="primary-tcell" align="center">
                    Số lượng
                  </TableCell>
                  <TableCell className="primary-tcell" align="center">
                    Giá trị
                  </TableCell>
                  <TableCell className="primary-tcell" align="center">
                    Kho
                  </TableCell>
                  <TableCell className="primary-tcell" align="center">
                    Trạng thái
                  </TableCell>
                  <TableCell
                    className="primary-tcell"
                    align="center"
                  ></TableCell>
                </TableRow>
              </TableHead>
              <TableBody className="primary-tbody">
                {materialInventorysData?.data.map((inventory, index) => (
                  <TableRow key={inventory.id}>
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
                      {inventory.internal_code || "-"}
                    </TableCell>
                    <TableCell
                      className="custom-border-tcell primary-tcell"
                      align="center"
                    >
                      {inventory.external_code || "-"}
                    </TableCell>
                    <TableCell
                      className="custom-border-tcell primary-tcell"
                      align="center"
                    >
                      {inventory.material_name}
                    </TableCell>
                    <TableCell
                      className="custom-border-tcell primary-tcell"
                      align="center"
                    >
                      {inventory.unit_name}
                    </TableCell>
                    <TableCell
                      className="custom-border-tcell primary-tcell"
                      align="center"
                    >
                      {inventory.quantity_on_hand.toLocaleString()}
                    </TableCell>
                    <TableCell
                      className="custom-border-tcell primary-tcell"
                      align="center"
                    >
                      {inventory.total_value
                        ? formatCurrency(inventory.total_value)
                        : "-"}
                    </TableCell>
                    <TableCell
                      className="custom-border-tcell primary-tcell"
                      align="center"
                    >
                      {inventory.store_name}
                    </TableCell>
                    <TableCell
                      className="custom-border-tcell primary-tcell"
                      align="center"
                      width={150}
                    >
                      <span
                        className={`status-badge ${
                          inventory.status === "ACTIVE"
                            ? "status-active"
                            : "status-inactive"
                        }`}
                      >
                        {inventory.status === "ACTIVE"
                          ? "Hoạt động"
                          : "Không hoạt động"}
                      </span>
                    </TableCell>
                    <TableCell
                      className="custom-border-tcell primary-tcell"
                      align="center"
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetail(inventory)}
                        className="edit-btn"
                      >
                        <FiEdit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDeleteDialog(inventory)}
                        className="delete-btn"
                      >
                        <PiTrashSimpleFill />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <PrimaryPagination
              totalItems={materialInventorysData?.total || 0}
              page={currentPage}
              rowsPerPage={pageSize}
              onPageChange={handlePageChange}
              onRowsPerPageChange={() => {}} // Not implemented for simplicity
            />
          )}
        </>
      )}

      {/* Modal */}
      <MaterialStoreModal
        open={modalOpen}
        onClose={handleCloseModal}
        inventory={selectedInventory}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          XÁC NHẬN XÓA TỒN KHO NGUYÊN VẬT LIỆU
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa tồn kho nguyên vật liệu "
            {inventoryToDelete?.material_name}" tại kho "
            {inventoryToDelete?.store_name}" không?
            <br />
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} className="button-cancel">
            HỦY
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            autoFocus
          >
            XÓA
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MaterialStore;
