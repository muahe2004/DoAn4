import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Grid,
} from "@mui/material";
import { STATUS, STATUS_OPTIONS } from "../../../constants/status";
import Button from "../../../components/Button/Button";
import LabelPrimary from "../../../components/Label/Label";
import AutocompletePrimary from "../../../components/Autocomplete/AutoComplete";
import { useGetDropdownUnits } from "../../units/apis/dropdown";
import type { IMaterialResponse } from "../types";

export interface MaterialFormValues {
  material_code: string;
  material_name: string;
  unit_id: string;
  unit_name?: string;
  description?: string;
  status: string;
}

interface MaterialFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MaterialFormValues) => void;
  initialData?: IMaterialResponse;
  mode?: "add" | "edit";
  isSubmitting?: boolean;
}

const defaultValues: MaterialFormValues = {
  material_code: "",
  material_name: "",
  unit_id: "",
  unit_name: "",
  description: "",
  status: STATUS.ACTIVE,
};

const MaterialFormModal: React.FC<MaterialFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode = "add",
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<MaterialFormValues>(defaultValues);

  const paramsUnit = {
    skip: 0,
    limit: 20,
  };

  const { data: units = [] } = useGetDropdownUnits(paramsUnit);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        material_code: initialData.material_code,
        material_name: initialData.material_name,
        unit_id: initialData.unit_id || "",
        unit_name: initialData.unit_name || "",
        description: initialData.description || "",
        status: initialData.status || STATUS.ACTIVE,
      });
      return;
    }

    setFormData(defaultValues);
  }, [initialData, mode, open]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUnitChange = (value: { id?: string; unit_name?: string }) => {
    setFormData((prev) => ({
      ...prev,
      unit_id: value.id || "",
      unit_name: value.unit_name || "",
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="primary-dialog-title">
        {mode === "edit" ? "SỬA NGUYÊN VẬT LIỆU" : "THÊM NGUYÊN VẬT LIỆU"}
      </DialogTitle>
      <DialogContent className="primary-dialog-content">
        <Grid container spacing={2} className="myprofile-form">
            <Grid size={6} className="myprofile-form__group">
            <LabelPrimary value="Mã nguyên vật liệu" required />
            <TextField
              name="material_code"
              value={formData.material_code}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              className="primary-text__field"
            />
          </Grid>

          <Grid size={6} className="myprofile-form__group">
            <LabelPrimary value="Đơn vị tính" required />
            <AutocompletePrimary
              labelKey="unit_name"
              valueKey="id"
              options={units}
              value={
                formData.unit_name
                  ? {
                      id: formData.unit_id,
                      unit_name: formData.unit_name,
                    }
                  : null
              }
              onChange={(val) => handleUnitChange(val)}
              inputValue={formData.unit_name}
              onInputChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  unit_name: value,
                }))
              }
              freeSolo
            />
          </Grid>

          <Grid size={6} className="myprofile-form__group">
            <LabelPrimary value="Tên nguyên vật liệu" required />
            <TextField
              name="material_name"
              value={formData.material_name}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              className="primary-text__field"
            />
          </Grid>
          
          <Grid size={6} className="myprofile-form__group">
            <LabelPrimary value="Trạng thái" />
            <TextField
              select
              name="status"
              value={formData.status}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              className="primary-text__field"
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={12} className="myprofile-form__group">
            <LabelPrimary value="Mô tả" />
            <TextField
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              className="primary-text__field"
            />
          </Grid>

        </Grid>
      </DialogContent>

      <DialogActions className="primary-dialog-actions">
        <Button className="button-cancel" onClick={onClose} disabled={isSubmitting}>
          HỦY
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Đang lưu..." : "LƯU"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaterialFormModal;
