import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  Autocomplete,
} from '@mui/material';
import type { IProduct } from '../types';
import LabelPrimary from '../../../components/Label/Label';

interface ProductFormModelProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: IProduct) => void;
  initialData?: IProduct;
  mode?: 'add' | 'edit';
}

const unitOptions = [
  { id: 1, label: "Kg" },
  { id: 2, label: "Gram" },
  { id: 3, label: "Box" },
];

const normOptions = [
  { id: 1, label: "Norm 001" },
  { id: 2, label: "Norm 002" },
  { id: 3, label: "Norm 003" },
];


const ProductFormModel: React.FC<ProductFormModelProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode = 'add',
}) => {
  const [formData, setFormData] = useState<IProduct>({
    product_code: '',
    product_name: '',
    unit_id: '',
    unit_id_2: '',
    norm_id: '',
    description: '',
    is_semi_product: false,
    status: 'active',
  });

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData(initialData);
    } else if (mode === 'add') {
      setFormData({
        product_code: '',
        product_name: '',
        unit_id: '',
        unit_id_2: '',
        norm_id: '',
        description: '',
        is_semi_product: false,
        status: 'active',
      });
    }
  }, [initialData, mode, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'edit' ? 'Edit Product' : 'Add Product'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} className="myprofile-form">
          {/* Mã sản phẩm */}
          <Grid size={6} className="myprofile-form__group">
            <LabelPrimary value="Mã sản phẩm" required />
            <TextField
              value={formData.product_code}
              name="product_code"
              onChange={handleChange}
              fullWidth
              variant="outlined"
              className="primary-text__field"
            />
          </Grid>

          {/* Tên sản phẩm */}
          <Grid size={6} className="myprofile-form__group">
            <LabelPrimary value="Tên sản phẩm" required />
            <TextField
              value={formData.product_name}
              name="product_name"
              onChange={handleChange}
              fullWidth
              variant="outlined"
              className="primary-text__field"
            />
          </Grid>

          {/* UNIT ID */}
          <Grid size={6} className="myprofile-form__group">
            <LabelPrimary value="Unit ID" />
            <Autocomplete
              className='primary-autocomplete'
              options={unitOptions}
              value={
                unitOptions.find(u => u.id === Number(formData.unit_id)) || null
              }
              onChange={(e, val) =>
                setFormData(prev => ({
                  ...prev,
                  unit_id: val ? String(val.id) : ""
                }))
              }

              fullWidth
              renderInput={(params) => (
                <TextField {...params} variant="outlined" className="primary-text__field" />
              )}
            />
          </Grid>

          {/* UNIT ID 2 */}
          <Grid size={6} className="myprofile-form__group">
            <LabelPrimary value="Unit ID 2" />
            <Autocomplete
              className='primary-autocomplete'
              options={unitOptions}
              value={
                unitOptions.find(u => u.id === Number(formData.unit_id_2)) || null
              }
              onChange={(e, val) =>
                setFormData(prev => ({
                  ...prev,
                  unit_id_2: val ? String(val.id) : ""
                }))
              }

              fullWidth
              renderInput={(params) => (
                <TextField {...params} variant="outlined" className="primary-text__field" />
              )}
            />
          </Grid>

          {/* NORM ID */}
          <Grid size={6} className="myprofile-form__group">
            <LabelPrimary value="Norm ID" />
            <Autocomplete
              className='primary-autocomplete'
              options={normOptions}
              value={
                normOptions.find(n => n.id === Number(formData.norm_id)) || null
              }
              onChange={(e, val) =>
                setFormData(prev => ({
                  ...prev,
                  norm_id: val ? String(val.id) : ""
                }))
              }

              fullWidth
              renderInput={(params) => (
                <TextField {...params} variant="outlined" className="primary-text__field" />
              )}
            />
          </Grid>

          {/* Status */}
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
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Grid>

          {/* Description */}
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
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {mode === 'edit' ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductFormModel;