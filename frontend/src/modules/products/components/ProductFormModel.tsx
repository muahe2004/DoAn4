import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
} from '@mui/material';
import type { IProduct, IProductResponse } from '../types';
import LabelPrimary from '../../../components/Label/Label';
import Button from '../../../components/Button/Button';
import { useGetDropdownUnits } from '../../units/apis/dropdown';
import { useGetDropdownNorms } from '../../norms/apis/dropdown';
import AutocompletePrimary from '../../..//components/Autocomplete/AutoComplete';
interface ProductFormModelProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: IProduct) => void;
  initialData?: IProductResponse;
  mode?: 'add' | 'edit';
}

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

  const ParamsUnit = {
    limit: 5,
    skip: 0,
  };

  const {
    data: dropdownUnits,
    isLoading: isLoadingUnits,
    error: errorUnits,
  } = useGetDropdownUnits(ParamsUnit);

  const ParamsNorm = {
    limit: 5,
    skip: 0,
  };

  const {
    data: dropdownNorms,
    isLoading: isLoadingNorms,
    error: errorNorms,
  } = useGetDropdownNorms(ParamsNorm);

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

  const handleUnitInputChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      unit_name: value,
      unit_id: "",
    }));
  };

  const handleUnit2InputChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      unit_name_2: value,
      unit_id_2: "",
    }));
  };

  const handleNormInputChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      norm_name: value,
      norm_id: "",
    }));
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
            <LabelPrimary value="Định mức" required />
            <AutocompletePrimary
              labelKey="norm_name"
              valueKey="id"
              freeSolo
              options={dropdownNorms || []}
              value={
                formData.norm_name
                  ? {
                      id: formData.norm_id,
                      norm_name: formData.norm_name
                    }
                  : null
              }
              inputValue={formData.norm_name}
              onInputChange={handleNormInputChange}
              onChange={(val) =>
                setFormData(prev => ({
                  ...prev,
                  norm_id: val.id || "",
                  norm_name: val.norm_name
                }))
              }
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
            <LabelPrimary value="Đơn vị tính" />
            <AutocompletePrimary
              labelKey="unit_name"
              valueKey="id"
              freeSolo
              options={dropdownUnits || []}
              value={
                formData.unit_name
                  ? {
                      id: formData.unit_id,
                      unit_name: formData.unit_name
                    }
                  : null
              }
              inputValue={formData.unit_name}
              onInputChange={handleUnitInputChange}
              onChange={(val) =>
                setFormData(prev => ({
                  ...prev,
                  unit_id: val.id || "",
                  unit_name: val.unit_name
                }))
              }
            />
          </Grid>

          {/* UNIT 2 */}
          <Grid size={6} className="myprofile-form__group">
            <LabelPrimary value="Đơn vị tính 2" />
            <AutocompletePrimary
              labelKey="unit_name"
              valueKey="id"
              freeSolo
              options={dropdownUnits || []}
              value={
                formData.unit_name_2
                  ? {
                      id: formData.unit_id_2,
                      unit_name: formData.unit_name_2
                    }
                  : null
              }
              inputValue={formData.unit_name_2}
              onInputChange={handleUnit2InputChange}
              onChange={(val) =>
                setFormData(prev => ({
                  ...prev,
                  unit_id_2: val.id || "",
                  unit_name_2: val.unit_name
                }))
              }
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