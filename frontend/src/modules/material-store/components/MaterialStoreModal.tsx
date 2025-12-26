import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
    onError: (error: any) => {
      console.error("Create failed:", error);
      const errorMessage =
        error?.response?.data?.detail ||
        "Thêm tồn kho thất bại. Vui lòng thử lại.";
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
    onError: (error: any) => {
      console.error("Update failed:", error);
      const errorMessage =
        error?.response?.data?.detail ||
        "Cập nhật tồn kho thất bại. Vui lòng thử lại.";
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

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
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

  const isFormValid =
    formData.material_id && formData.store_id && formData.quantity_on_hand >= 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {inventory
          ? "Cập nhật tồn kho nguyên vật liệu"
          : "Thêm tồn kho nguyên vật liệu"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Material Selection */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Nguyên vật liệu *</InputLabel>
              <Select
                value={formData.material_id}
                onChange={(e) => handleChange("material_id", e.target.value)}
                label="Nguyên vật liệu *"
              >
                {materials.map((material) => (
                  <MenuItem key={material.id} value={material.id}>
                    {material.material_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Store Selection */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Kho *</InputLabel>
              <Select
                value={formData.store_id}
                onChange={(e) => handleChange("store_id", e.target.value)}
                label="Kho *"
              >
                {stores.map((store) => (
                  <MenuItem key={store.id} value={store.id}>
                    {store.store_name} ({store.store_code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Quantity */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Số lượng *"
              type="number"
              value={formData.quantity_on_hand}
              onChange={(e) =>
                handleChange(
                  "quantity_on_hand",
                  parseFloat(e.target.value) || 0
                )
              }
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>

          {/* Status */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                label="Trạng thái"
              >
                <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                <MenuItem value="INACTIVE">Không hoạt động</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Internal Code */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Mã nội bộ"
              value={formData.internal_code}
              onChange={(e) => handleChange("internal_code", e.target.value)}
            />
          </Grid>

          {/* External Code */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Mã hải quan"
              value={formData.external_code}
              onChange={(e) => handleChange("external_code", e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} className="button-cancel">
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            !isFormValid || createMutation.isPending || updateMutation.isPending
          }
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
