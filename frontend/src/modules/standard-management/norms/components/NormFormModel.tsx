import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Divider,
} from "@mui/material";
import type { INorm, INormResponse, INormDetail } from "../types";
import LabelPrimary from "../../../../components/Label/Label";
import Button from "../../../../components/Button/Button";
import NormDetailsTable from "./NormDetailsTable";
import { useGetNorm } from "../apis/getNorm";

interface NormFormModelProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: INorm) => void;
  initialData?: INormResponse;
  mode?: "add" | "edit";
}

const NormFormModel: React.FC<NormFormModelProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode = "add",
}) => {
  const [formData, setFormData] = useState<INormResponse>({
    norm_name: "",
    description: "",
    status: "active",
    norm_details: [],
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Get full norm data if editing
  const { data: fullNormData } = useGetNorm(initialData?.id || "");

  useEffect(() => {
    if (mode === "edit") {
      if (fullNormData) {
        // Use full data from API (includes norm_details)
        setFormData({
          ...fullNormData,
        });
      } else if (initialData) {
        // Fallback to initialData if API hasn't loaded yet
        setFormData({
          ...initialData,
          norm_details: initialData.norm_details || [],
        });
      }
    } else if (mode === "add") {
      setFormData({
        norm_name: "",
        description: "",
        status: "active",
        norm_details: [],
      });
    }
  }, [fullNormData, initialData, mode, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = () => {
    // Reset errors
    setErrors({});

    const validationErrors: { [key: string]: string } = {};
    const alertErrors: string[] = [];

    // Validate norm_name
    if (!formData.norm_name?.trim()) {
      validationErrors.norm_name = "Vui lòng nhập tên định mức";
    } else if (formData.norm_name.trim().length > 100) {
      validationErrors.norm_name = "Tên định mức không được vượt quá 100 ký tự";
    }

    // Validate description length
    if (formData.description && formData.description.length > 500) {
      validationErrors.description = "Mô tả không được vượt quá 500 ký tự";
    }

    // Validate norm_details
    if (formData.norm_details.length > 0) {
      // Check for duplicate materials
      const materialIds = formData.norm_details.map(
        (detail) => detail.material_id
      );
      const uniqueMaterialIds = new Set(materialIds);
      if (materialIds.length !== uniqueMaterialIds.size) {
        alertErrors.push(
          "Không được có nguyên vật liệu trùng lặp trong chi tiết định mức"
        );
      }

      // Validate each norm detail
      formData.norm_details.forEach((detail, index) => {
        if (!detail.material_id) {
          alertErrors.push(
            `Chi tiết ${index + 1}: Vui lòng chọn nguyên vật liệu`
          );
        }
        if (!detail.unit_id) {
          alertErrors.push(`Chi tiết ${index + 1}: Vui lòng chọn đơn vị tính`);
        }
        if (!detail.norm_value || detail.norm_value <= 0) {
          alertErrors.push(`Chi tiết ${index + 1}: Định mức phải lớn hơn 0`);
        }
        if (detail.description && detail.description.length > 500) {
          alertErrors.push(
            `Chi tiết ${index + 1}: Mô tả không được vượt quá 500 ký tự`
          );
        }
      });
    }

    // Set field errors
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    }

    // Show alert for norm details errors
    if (alertErrors.length > 0) {
      alert(alertErrors.join("\n"));
    }

    // If any errors, don't submit
    if (Object.keys(validationErrors).length > 0 || alertErrors.length > 0) {
      return;
    }

    onSubmit(formData);
    onClose();
  };

  const handleAddNormDetail = (detail: Omit<INormDetail, "id">) => {
    // Check for duplicate material
    const existingMaterial = formData.norm_details.find(
      (existing) => existing.material_id === detail.material_id
    );

    if (existingMaterial) {
      alert("Nguyên vật liệu này đã được thêm vào chi tiết định mức");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      norm_details: [
        ...prev.norm_details,
        { ...detail, id: `temp-${Date.now()}` },
      ],
    }));
  };

  const handleEditNormDetail = (
    id: string,
    updatedDetail: Partial<INormDetail>
  ) => {
    // If material_id is being changed, check for duplicates
    if (updatedDetail.material_id) {
      const existingMaterial = formData.norm_details.find(
        (existing) =>
          existing.id !== id &&
          existing.material_id === updatedDetail.material_id
      );

      if (existingMaterial) {
        alert(
          "Nguyên vật liệu này đã được sử dụng trong chi tiết định mức khác"
        );
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      norm_details: prev.norm_details.map((detail) =>
        detail.id === id ? { ...detail, ...updatedDetail } : detail
      ),
    }));
  };

  const handleDeleteNormDetail = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      norm_details: prev.norm_details.filter((detail) => detail.id !== id),
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle className="primary-dialog-title">
        {mode === "edit" ? "SỬA THÔNG TIN ĐỊNH MỨC" : "THÊM ĐỊNH MỨC"}
      </DialogTitle>
      <DialogContent className="primary-dialog-content">
        <Grid container spacing={2} className="myprofile-form">
          {/* NORM NAME */}
          <Grid size={12} className="myprofile-form__group">
            <LabelPrimary value="Tên định mức" required />
            <TextField
              value={formData.norm_name}
              name="norm_name"
              onChange={handleChange}
              fullWidth
              variant="outlined"
              className="primary-text__field"
              error={!!errors.norm_name}
              helperText={errors.norm_name}
              inputProps={{ maxLength: 100 }}
            />
          </Grid>

          {/* DESC */}
          <Grid size={12} className="myprofile-form__group">
            <LabelPrimary value="Mô tả" />
            <TextField
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              className="primary-text__field"
              error={!!errors.description}
              helperText={errors.description}
              inputProps={{ maxLength: 500 }}
            />
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ my: 3 }}>
          <h3>Chi tiết định mức</h3>
        </Divider>

        <NormDetailsTable
          normDetails={formData.norm_details}
          onAdd={handleAddNormDetail}
          onEdit={handleEditNormDetail}
          onDelete={handleDeleteNormDetail}
        />
      </DialogContent>

      <DialogActions className="primary-dialog-actions">
        <Button className="button-cancel" onClick={onClose}>
          {" "}
          HUỶ{" "}
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          {" "}
          LƯU{" "}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NormFormModel;
