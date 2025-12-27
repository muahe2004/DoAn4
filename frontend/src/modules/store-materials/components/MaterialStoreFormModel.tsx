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
import type { IMaterialStoreResponse } from '../types';
import LabelPrimary from '../../../components/Label/Label';
import Button from '../../../components/Button/Button';
import { STATUS } from '../../../constants/status';
import { useGetMaterials } from '../../materials/apis/getMaterials';
import { useGetStores } from '../apis/getStores';

interface MaterialStoreFormModelProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: IMaterialStoreResponse) => void;
  initialData?: IMaterialStoreResponse;
  mode?: 'add' | 'edit';
}

const MaterialStoreFormModel: React.FC<MaterialStoreFormModelProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData, 
  mode = 'add' 
}) => {
  const [formData, setFormData] = useState<IMaterialStoreResponse>({
    material_id: '',
    store_id: '',
    quantity_on_hand: 0,
    reorder_level: 0,
    safety_stock: 0,
    status: STATUS.ACTIVE,
  });

  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [selectedStore, setSelectedStore] = useState<any>(null);

  // Get materials and stores for dropdowns
  const { data: materialsData, isLoading: materialsLoading } = useGetMaterials({ limit: 1000, skip: 0 });
  const { data: storesData, isLoading: storesLoading } = useGetStores({ limit: 1000, skip: 0 });

  console.log('Materials data:', materialsData);
  console.log('Stores data:', storesData);

  useEffect(() => {
    if (mode === 'edit' && initialData && open) {
      setFormData({
        ...initialData,
      });
      
      // Set selected material and store for edit mode
      // Try to find from API data first, if not found, create from initialData
      if (materialsData?.data && initialData.material_id) {
        const material = materialsData.data.find((m: any) => m.id === initialData.material_id);
        if (material) {
          setSelectedMaterial(material);
        } else if (initialData.material_code && initialData.material_name) {
          // Create a temporary object from initialData
          setSelectedMaterial({
            id: initialData.material_id,
            material_code: initialData.material_code,
            material_name: initialData.material_name,
            unit_name: initialData.unit_name,
            internal_code: initialData.internal_code,
            external_code: initialData.external_code,
          });
        }
      } else if (initialData.material_code && initialData.material_name) {
        // If API data not loaded yet, use initialData
        setSelectedMaterial({
          id: initialData.material_id,
          material_code: initialData.material_code,
          material_name: initialData.material_name,
          unit_name: initialData.unit_name,
          internal_code: initialData.internal_code,
          external_code: initialData.external_code,
        });
      }
      
      if (storesData?.data && initialData.store_id) {
        const store = storesData.data.find((s: any) => s.id === initialData.store_id);
        if (store) {
          setSelectedStore(store);
        } else if (initialData.store_name) {
          // Create a temporary object from initialData
          setSelectedStore({
            id: initialData.store_id,
            store_code: initialData.store_name, // Fallback
            store_name: initialData.store_name,
          });
        }
      } else if (initialData.store_name) {
        // If API data not loaded yet, use initialData
        setSelectedStore({
          id: initialData.store_id,
          store_code: initialData.store_name, // Fallback
          store_name: initialData.store_name,
        });
      }
    } else if (mode === 'add' || !open) {
      setFormData({
        material_id: '',
        store_id: '',
        quantity_on_hand: 0,
        reorder_level: 0,
        safety_stock: 0,
        status: STATUS.ACTIVE,
      });
      setSelectedMaterial(null);
      setSelectedStore(null);
    }
  }, [initialData, mode, open, materialsData, storesData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev, 
      [name]: ['quantity_on_hand', 'reorder_level', 'safety_stock'].includes(name) 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleMaterialChange = (_event: any, newValue: any) => {
    setSelectedMaterial(newValue);
    if (newValue) {
      setFormData((prev) => ({
        ...prev,
        material_id: newValue.id,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        material_id: '',
      }));
    }
  };

  const handleStoreChange = (_event: any, newValue: any) => {
    setSelectedStore(newValue);
    if (newValue) {
      setFormData((prev) => ({
        ...prev,
        store_id: newValue.id,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        store_id: '',
      }));
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className='primary-dialog-title'>
        {mode === 'edit' ? 'SỬA THÔNG TIN CHỐT TỒN KHO' : 'THÊM CHỐT TỒN KHO'}
      </DialogTitle>
      <DialogContent className='primary-dialog-content'>
        <Grid container spacing={2} className="myprofile-form">

          {/* MATERIAL */}
          <Grid size={12} className="myprofile-form__group">
            <LabelPrimary value="Nguyên vật liệu" required />
            <Autocomplete
              value={selectedMaterial}
              onChange={handleMaterialChange}
              options={materialsData?.data || []}
              getOptionLabel={(option) => `${option.material_code} - ${option.material_name}`}
              disabled={mode === 'edit'}
              loading={materialsLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  className="primary-text__field"
                  placeholder="Chọn nguyên vật liệu"
                />
              )}
            />
            {selectedMaterial && (
              <Grid container spacing={2} sx={{ mt: 1, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Grid size={4}>
                  <strong>Đơn vị tính:</strong> {selectedMaterial.unit_name || '-'}
                </Grid>
                <Grid size={4}>
                  <strong>Mã nội bộ:</strong> {selectedMaterial.internal_code || '-'}
                </Grid>
                <Grid size={4}>
                  <strong>Mã hải quan:</strong> {selectedMaterial.external_code || '-'}
                </Grid>
              </Grid>
            )}
          </Grid>

          {/* STORE */}
          <Grid size={12} className="myprofile-form__group">
            <LabelPrimary value="Kho" required />
            <Autocomplete
              value={selectedStore}
              onChange={handleStoreChange}
              options={storesData?.data || []}
              getOptionLabel={(option) => `${option.store_code || option.store_name} - ${option.store_name}`}
              disabled={mode === 'edit'}
              loading={storesLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  className="primary-text__field"
                  placeholder="Chọn kho"
                />
              )}
            />
          </Grid>

          {/* QUANTITY ON HAND */}
          <Grid size={12} className="myprofile-form__group">
            <LabelPrimary value="Số lượng tồn" required />
            <TextField
              value={formData.quantity_on_hand}
              name="quantity_on_hand"
              onChange={handleChange}
              type="number"
              fullWidth
              variant="outlined"
              className="primary-text__field"
            />
          </Grid>

          {/* REORDER LEVEL */}
          <Grid size={6} className="myprofile-form__group">
            <LabelPrimary value="Mức đặt hàng lại" />
            <TextField
              value={formData.reorder_level}
              name="reorder_level"
              onChange={handleChange}
              type="number"
              fullWidth
              variant="outlined"
              className="primary-text__field"
            />
          </Grid>

          {/* SAFETY STOCK */}
          <Grid size={6} className="myprofile-form__group">
            <LabelPrimary value="Tồn kho an toàn" />
            <TextField
              value={formData.safety_stock}
              name="safety_stock"
              onChange={handleChange}
              type="number"
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

export default MaterialStoreFormModel;
