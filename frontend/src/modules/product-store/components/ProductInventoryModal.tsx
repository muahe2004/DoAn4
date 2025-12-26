import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
import Button from "../../../components/Button/Button";

import type {
  IProductInventoryCreate,
  IProductDropdown,
  IStoreDropdown,
} from "../types";

interface ProductInventoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isEditing: boolean;
  formData: IProductInventoryCreate;
  setFormData: React.Dispatch<React.SetStateAction<IProductInventoryCreate>>;
  products: IProductDropdown[];
  stores: IStoreDropdown[];
}

const ProductInventoryModal: React.FC<ProductInventoryModalProps> = ({
  open,
  onClose,
  onSubmit,
  isEditing,
  formData,
  setFormData,
  products,
  stores,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? "Cập nhật tồn kho" : "Thêm mới tồn kho"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <FormControl fullWidth disabled={isEditing} required>
            <Select
              value={formData.product_id}
              onChange={(e) =>
                setFormData({ ...formData, product_id: e.target.value })
              }
              displayEmpty
              error={!formData.product_id && !isEditing}
            >
              <MenuItem value="" disabled>
                <em>Chọn sản phẩm</em>
              </MenuItem>
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.product_code} - {product.product_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth disabled={isEditing} required>
            <Select
              value={formData.store_id}
              onChange={(e) =>
                setFormData({ ...formData, store_id: e.target.value })
              }
              displayEmpty
              error={!formData.store_id && !isEditing}
            >
              <MenuItem value="" disabled>
                <em>Chọn kho</em>
              </MenuItem>
              {stores.map((store) => (
                <MenuItem key={store.id} value={store.id}>
                  {store.store_code} - {store.store_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Số lượng tồn kho *"
            type="number"
            value={formData.quantity_on_hand}
            onChange={(e) =>
              setFormData({
                ...formData,
                quantity_on_hand: Number(e.target.value),
              })
            }
            fullWidth
            required
            inputProps={{ min: 0 }}
            error={formData.quantity_on_hand < 0}
            helperText={
              formData.quantity_on_hand < 0 ? "Số lượng không được âm" : ""
            }
          />

          <TextField
            label="Mã nội bộ"
            value={formData.internal_code || ""}
            onChange={(e) =>
              setFormData({ ...formData, internal_code: e.target.value })
            }
            fullWidth
            placeholder="Nhập mã nội bộ (tùy chọn)"
          />

          <TextField
            label="Mã hải quan"
            value={formData.external_code || ""}
            onChange={(e) =>
              setFormData({ ...formData, external_code: e.target.value })
            }
            fullWidth
            placeholder="Nhập mã hải quan (tùy chọn)"
          />

          <FormControl fullWidth>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={formData.status || "ACTIVE"}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              label="Trạng thái"
            >
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="INACTIVE">INACTIVE</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={onSubmit} variant="contained">
          {isEditing ? "Cập nhật" : "Tạo mới"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductInventoryModal;
