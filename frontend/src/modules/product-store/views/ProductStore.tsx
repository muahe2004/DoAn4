import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Box,
  Pagination,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import Button from "../../../components/Button/Button";

import { getProductInventorys } from "../apis/getProductInventorys";
import { createProductInventory } from "../apis/createProductInventory";
import { updateProductInventory } from "../apis/updateProductInventory";
import { deleteProductInventory } from "../apis/deleteProductInventory";
import {
  getProductsDropdown,
  getStoresDropdown,
} from "../apis/getDropdownData";

import {
  type IProductInventory,
  type IProductInventoryCreate,
  type IProductInventoryUpdate,
  type IProductDropdown,
  type IStoreDropdown,
} from "../types";

import ProductInventoryModal from "../components/ProductInventoryModal";
import "./ProductStore.css";

const ProductStore: React.FC = () => {
  const [inventories, setInventories] = useState<IProductInventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const pageSize = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingInventory, setEditingInventory] =
    useState<IProductInventory | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState<IProductInventoryCreate>({
    product_id: "",
    store_id: "",
    quantity_on_hand: 0,
    status: "ACTIVE",
    internal_code: "",
    external_code: "",
  });

  const [products, setProducts] = useState<IProductDropdown[]>([]);
  const [stores, setStores] = useState<IStoreDropdown[]>([]);

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    inventoryId: string | null;
    inventoryName: string;
  }>({
    open: false,
    inventoryId: null,
    inventoryName: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await getProductInventorys({
          skip: (currentPage - 1) * pageSize,
          limit: pageSize,
          search: searchTerm,
        });
        setInventories(response.data);
        setTotalCount(response.total);
      } catch (error) {
        console.error("Error loading inventories:", error);
        setToast({
          open: true,
          message: "Lỗi khi tải dữ liệu tồn kho",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
    loadDropdownData();
  }, [currentPage, searchTerm]);

  const loadDropdownData = async () => {
    try {
      const [productsData, storesData] = await Promise.all([
        getProductsDropdown(),
        getStoresDropdown(),
      ]);
      setProducts(productsData);
      setStores(storesData);
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      setToast({
        open: true,
        message: "Lỗi khi tải dữ liệu dropdown",
        severity: "error",
      });
    }
  };

  const handleCreate = () => {
    setIsEditing(false);
    setEditingInventory(null);
    setFormData({
      product_id: "",
      store_id: "",
      quantity_on_hand: 0,
      status: "ACTIVE",
      internal_code: "",
      external_code: "",
    });
    setModalOpen(true);
  };

  const handleEdit = (inventory: IProductInventory) => {
    setIsEditing(true);
    setEditingInventory(inventory);
    setFormData({
      product_id: inventory.product_id,
      store_id: inventory.store_id,
      quantity_on_hand: inventory.quantity_on_hand,
      status: inventory.status,
      internal_code: inventory.internal_code || "",
      external_code: inventory.external_code || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!isEditing) {
      if (!formData.product_id || !formData.store_id) {
        setToast({
          open: true,
          message: "Vui lòng chọn sản phẩm và kho",
          severity: "error",
        });
        return;
      }
      if (formData.quantity_on_hand < 0) {
        setToast({
          open: true,
          message: "Số lượng tồn kho không được âm",
          severity: "error",
        });
        return;
      }
    }

    try {
      if (isEditing && editingInventory) {
        const updateData: IProductInventoryUpdate = {
          quantity_on_hand: formData.quantity_on_hand,
          status: formData.status,
          internal_code: formData.internal_code,
          external_code: formData.external_code,
        };
        await updateProductInventory(editingInventory.id, updateData);
        setToast({
          open: true,
          message: "Cập nhật tồn kho thành công!",
          severity: "success",
        });
      } else {
        await createProductInventory(formData);
        setToast({
          open: true,
          message: "Tạo mới tồn kho thành công!",
          severity: "success",
        });
      }
      setModalOpen(false);
      const response = await getProductInventorys({
        skip: (currentPage - 1) * pageSize,
        limit: pageSize,
        search: searchTerm,
      });
      setInventories(response.data);
      setTotalCount(response.total);
    } catch (error: unknown) {
      console.error("Error saving inventory:", error);
      let errorMessage = "Lỗi khi lưu dữ liệu";

      if (error && typeof error === "object") {
        if (
          "response" in error &&
          error.response &&
          typeof error.response === "object"
        ) {
          const response = error.response as { data?: { detail?: string } };
          if (response.data?.detail) {
            const backendMessage = response.data.detail;
            if (backendMessage.includes("already exists")) {
              errorMessage =
                "Bản ghi tồn kho cho sản phẩm và kho này đã tồn tại";
            } else if (backendMessage.includes("Product not found")) {
              errorMessage = "Không tìm thấy sản phẩm";
            } else if (backendMessage.includes("Store not found")) {
              errorMessage = "Không tìm thấy kho";
            } else {
              errorMessage = backendMessage;
            }
          }
        }
      }

      setToast({ open: true, message: errorMessage, severity: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProductInventory(id);
      setToast({
        open: true,
        message: "Xóa tồn kho thành công!",
        severity: "success",
      });
      const response = await getProductInventorys({
        skip: (currentPage - 1) * pageSize,
        limit: pageSize,
        search: searchTerm,
      });
      setInventories(response.data);
      setTotalCount(response.total);
    } catch (error: unknown) {
      console.error("Error deleting inventory:", error);
      let errorMessage = "Lỗi khi xóa dữ liệu";

      if (error && typeof error === "object") {
        if (
          "response" in error &&
          error.response &&
          typeof error.response === "object"
        ) {
          const response = error.response as { data?: { detail?: string } };
          if (response.data?.detail) {
            const backendMessage = response.data.detail;
            if (backendMessage.includes("not found")) {
              errorMessage = "Không tìm thấy bản ghi cần xóa";
            } else {
              errorMessage = backendMessage;
            }
          }
        }
      }

      setToast({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setDeleteDialog({ open: false, inventoryId: null, inventoryName: "" });
    }
  };

  const handleDeleteClick = (inventory: IProductInventory) => {
    setDeleteDialog({
      open: true,
      inventoryId: inventory.id,
      inventoryName: `${inventory.product_name} - ${inventory.store_name}`,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.inventoryId) {
      handleDelete(deleteDialog.inventoryId);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, inventoryId: null, inventoryName: "" });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div className="product-store-container">
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Tìm kiếm"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên sản phẩm, mã sản phẩm..."
            sx={{ minWidth: 300, flexGrow: 1 }}
          />
          <Button variant="contained" onClick={handleCreate} color="primary">
            Thêm mới
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
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
                Tên sản phẩm
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
              <TableCell className="primary-tcell" align="center"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : inventories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              inventories.map((inventory, index) => (
                <TableRow key={inventory.id}>
                  <TableCell className="custom-border-tcell primary-tcell">
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell className="custom-border-tcell primary-tcell">
                    {inventory.internal_code || "-"}
                  </TableCell>
                  <TableCell className="custom-border-tcell primary-tcell">
                    {inventory.external_code || "-"}
                  </TableCell>
                  <TableCell className="custom-border-tcell primary-tcell">
                    {inventory.product_name}
                  </TableCell>
                  <TableCell className="custom-border-tcell primary-tcell">
                    {inventory.unit_name}
                  </TableCell>
                  <TableCell className="custom-border-tcell primary-tcell">
                    {inventory.quantity_on_hand}
                  </TableCell>
                  <TableCell className="custom-border-tcell primary-tcell">
                    {formatCurrency(inventory.total_value)}
                  </TableCell>
                  <TableCell className="custom-border-tcell primary-tcell">
                    {inventory.store_name}
                  </TableCell>
                  <TableCell className="custom-border-tcell primary-tcell">
                    <span
                      className={`status ${inventory.status.toLowerCase()}`}
                    >
                      {inventory.status}
                    </span>
                  </TableCell>
                  <TableCell className="custom-border-tcell primary-tcell">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(inventory)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(inventory)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalCount > pageSize && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={Math.ceil(totalCount / pageSize)}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}

      <ProductInventoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isEditing={isEditing}
        formData={formData}
        setFormData={setFormData}
        products={products}
        stores={stores}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa bản ghi tồn kho:{" "}
            <strong>{deleteDialog.inventoryName}</strong>?
            <br />
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProductStore;
