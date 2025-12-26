import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useCreateMaterialInventory } from "../apis/createMaterialInventory";
import { useUpdateMaterialInventory } from "../apis/updateMaterialInventory";
import {
  getMaterialsDropdown,
  getStoresDropdown,
} from "../apis/getDropdownData";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import Button from "../../../components/Button/Button";
import type {
  IMaterialInventory,
  MaterialInventoryCreate,
  MaterialInventoryUpdate,
} from "../types";

interface MaterialStoreModalProps {
  open: boolean;
  onClose: () => void;
  inventory?: IMaterialInventory | null;
}

const MaterialStoreModal: React.FC<MaterialStoreModalProps> = ({
  open,
  onClose,
  inventory,
}) => {
  const [formData, setFormData] = useState({
    material_id: "",
    store_id: "",
    quantity_on_hand: 0,
    status: "ACTIVE",
    internal_code: "",
    external_code: "",
  });

  const { showSnackbar } = useSnackbar();

  // API calls for dropdowns
  const { data: materials = [] } = useQuery({
    queryKey: ["materials-dropdown"],
    queryFn: getMaterialsDropdown,
  });

  const { data: stores = [] } = useQuery({
    queryKey: ["stores-dropdown"],
    queryFn: getStoresDropdown,
  });

  // Mutations
  const createMutation = useCreateMaterialInventory({
    onSuccess: () => {
      showSnackbar({
        message: "Thêm tồn kho nguyên vật liệu thành công!",
        severity: "success",
      });
      onClose();
    },
    onError: (error: Error) => {
      console.error("Create failed:", error);
      const errorMessage =
        (error as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Thêm tồn kho thất bại. Vui lòng thử lại.";
      showSnackbar({
        message: errorMessage,
        severity: "error",
      });
    },
  });

  const updateMutation = useUpdateMaterialInventory({
    onSuccess: () => {
      showSnackbar({
        message: "Cập nhật tồn kho nguyên vật liệu thành công!",
        severity: "success",
      });
      onClose();
    },
    onError: (error: Error) => {
      console.error("Update failed:", error);
      const errorMessage =
        (error as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Cập nhật tồn kho thất bại. Vui lòng thử lại.";
      showSnackbar({
        message: errorMessage,
        severity: "error",
      });
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (inventory) {
        // Edit mode
        setFormData({
          material_id: inventory.material_id,
          store_id: inventory.store_id,
          quantity_on_hand: inventory.quantity_on_hand,
          status: inventory.status,
          internal_code: inventory.internal_code || "",
          external_code: inventory.external_code || "",
        });
      } else {
        // Add mode
        setFormData({
          material_id: "",
          store_id: "",
          quantity_on_hand: 0,
          status: "ACTIVE",
          internal_code: "",
          external_code: "",
        });
      }
    }
  }, [open, inventory]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.material_id) {
      showSnackbar({
        message: "Vui lòng chọn nguyên vật liệu!",
        severity: "error",
      });
      return;
    }

    if (!formData.store_id) {
      showSnackbar({
        message: "Vui lòng chọn kho!",
        severity: "error",
      });
      return;
    }

    if (formData.quantity_on_hand < 0) {
      showSnackbar({
        message: "Số lượng không được âm!",
        severity: "error",
      });
      return;
    }

    try {
      if (inventory) {
        // Update
        const updateData: MaterialInventoryUpdate = {
          material_id: formData.material_id,
          store_id: formData.store_id,
          quantity_on_hand: formData.quantity_on_hand,
          status: formData.status,
          internal_code: formData.internal_code || undefined,
          external_code: formData.external_code || undefined,
        };
        await updateMutation.mutateAsync({
          id: inventory.id!,
          data: updateData,
        });
      } else {
        // Create
        const createData: MaterialInventoryCreate = {
          material_id: formData.material_id,
          store_id: formData.store_id,
          quantity_on_hand: formData.quantity_on_hand,
          status: formData.status,
          internal_code: formData.internal_code || undefined,
          external_code: formData.external_code || undefined,
        };
        await createMutation.mutateAsync(createData);
      }
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {inventory
          ? "Cập nhật tồn kho nguyên vật liệu"
          : "Thêm tồn kho nguyên vật liệu"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {/* Material Selection */}
          <FormControl fullWidth disabled={!!inventory} required>
            <Select
              value={formData.material_id}
              onChange={(e) => handleChange("material_id", e.target.value)}
              displayEmpty
              error={!formData.material_id}
            >
              <MenuItem value="" disabled>
                <em>Chọn nguyên vật liệu</em>
              </MenuItem>
              {materials.map((material) => (
                <MenuItem key={material.id} value={material.id}>
                  {material.material_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Store Selection */}
          <FormControl fullWidth disabled={!!inventory} required>
            <Select
              value={formData.store_id}
              onChange={(e) => handleChange("store_id", e.target.value)}
              displayEmpty
              error={!formData.store_id}
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

          {/* Quantity */}
          <TextField
            fullWidth
            label="Số lượng tồn kho *"
            type="number"
            value={formData.quantity_on_hand}
            onChange={(e) =>
              handleChange("quantity_on_hand", parseFloat(e.target.value) || 0)
            }
            required
            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
            error={formData.quantity_on_hand < 0}
            helperText={
              formData.quantity_on_hand < 0 ? "Số lượng không được âm" : ""
            }
          />

          {/* Internal Code */}
          <TextField
            fullWidth
            label="Mã nội bộ"
            value={formData.internal_code}
            onChange={(e) => handleChange("internal_code", e.target.value)}
            placeholder="Nhập mã nội bộ (tùy chọn)"
          />

          {/* External Code */}
          <TextField
            fullWidth
            label="Mã hải quan"
            value={formData.external_code}
            onChange={(e) => handleChange("external_code", e.target.value)}
            placeholder="Nhập mã hải quan (tùy chọn)"
          />

          {/* Status */}
          <FormControl fullWidth>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
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
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending
            ? "Đang xử lý..."
            : inventory
            ? "Cập nhật"
            : "Thêm mới"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaterialStoreModal;
