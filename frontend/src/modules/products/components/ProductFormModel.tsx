import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Autocomplete,
} from '@mui/material';
import type { IProduct, IProductResponse } from '../types';
import LabelPrimary from '../../../components/Label/Label';
import Button from '../../../components/Button/Button';

interface ProductFormModelProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: IProduct) => void;
  initialData?: IProductResponse;
  mode?: 'add' | 'edit';
}

const unitOptions = [
  { id: "uuid-1", label: "Kg" },
  { id: "uuid-2", label: "Gram" },
  { id: "uuid-3", label: "Box" },
];

const normOptions = [
  { id: "uuid-1", label: "Norm 001" },
  { id: "uuid-2", label: "Norm 002" },
  { id: "uuid-3", label: "Norm 003" },
];

const ProductFormModel: React.FC<ProductFormModelProps> = ({ open, onClose, onSubmit, initialData, mode = 'add', }) => {
  const [formData, setFormData] = useState<IProductResponse>({
    product_code: '',
    product_name: '',
    unit_id: '',
    unit_id_2: '',
    norm_id: '',
    description: '',
    is_semi_product: false,
    status: 'active',
    unit_name: "",
    unit_name_2: "",
    norm_name: ""
  });

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        ...initialData,
        unit_id: initialData.unit_id ? String(initialData.unit_id) : "",
        unit_id_2: initialData.unit_id_2 ? String(initialData.unit_id_2) : "",
        norm_id: initialData.norm_id ? String(initialData.norm_id) : "",
        unit_name: initialData.unit_name || "",
        unit_name_2: initialData.unit_name_2 || "",
        norm_name: initialData.norm_name || ""
      });
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
        unit_name: "",
        unit_name_2: "",
        norm_name: ""
      });
    }
  }, [initialData, mode, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className='primary-dialog-title'>{mode === 'edit' ? 'SỬA THÔNG TIN SẢN PHẨM' : 'THÊM SẢN PHẨM'}</DialogTitle>
      <DialogContent className='primary-dialog-content'>
        <Grid container spacing={2} className="myprofile-form">

          {/* PRODUCT CODE */}
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

          {/* NORM ID */}
          <Grid size={6} className="myprofile-form__group">
            <LabelPrimary value="Định mức" required/>
            <Autocomplete
              className='primary-autocomplete'
              options={normOptions}
              value={
                formData.norm_id
                  ? { id: formData.norm_id, label: formData.norm_name }
                  : null
              }
              onChange={(e, val) =>
                setFormData(prev => ({
                  ...prev,
                  norm_id: val ? String(val.id) : "",
                  norm_name: val ? val.label : ""
                }))
              }
              renderInput={(params) => (
                <TextField {...params} variant="outlined" className="primary-text__field" />
              )}
            />
          </Grid>

          {/* PRODUCT NAME */}
          <Grid size={12} className="myprofile-form__group">
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

          {/* UNIT */}
          <Grid size={6} className="myprofile-form__group">
            <LabelPrimary value="Đơn vị tính" required/>
            <Autocomplete
              className='primary-autocomplete'
              options={unitOptions}
              value={
                formData.unit_id
                  ? { id: formData.unit_id, label: formData.unit_name }
                  : null
              }
              onChange={(e, val) =>
                setFormData(prev => ({
                  ...prev,
                  unit_id: val ? String(val.id) : "",
                  unit_name: val ? val.label : ""
                }))
              }
              renderInput={(params) => (
                <TextField {...params} variant="outlined" className="primary-text__field" />
              )}
            />
          </Grid>

          {/* UNIT 2 */}
          <Grid size={6} className="myprofile-form__group">
            <LabelPrimary value="Đơn vị tính 2" />
            <Autocomplete
              className='primary-autocomplete'
              options={unitOptions}
              value={
                formData.unit_id_2
                  ? { id: formData.unit_id_2, label: formData.unit_name_2 }
                  : null
              }
              onChange={(e, val) =>
                setFormData(prev => ({
                  ...prev,
                  unit_id_2: val ? String(val.id) : "",
                  unit_name_2: val ? val.label : ""
                }))
              }
              renderInput={(params) => (
                <TextField {...params} variant="outlined" className="primary-text__field" />
              )}
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
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions className='primary-dialog-actions'>
        <Button className='button-cancel' onClick={onClose}> HUỶ </Button>
        <Button onClick={handleSubmit} variant="contained"> LƯU </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductFormModel;