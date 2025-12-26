import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
} from '@mui/material';
import type { ICompareMaterialCodeResponse } from '../types';
import LabelPrimary from '../../../components/Label/Label';
import Button from '../../../components/Button/Button';
import { STATUS } from '../../../constants/status';

interface CompareMaterialCodeFormModelProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ICompareMaterialCodeResponse) => void;
  initialData?: ICompareMaterialCodeResponse;
  mode?: 'add' | 'edit';
}

const CompareMaterialCodeFormModel: React.FC<CompareMaterialCodeFormModelProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData, 
  mode = 'add' 
}) => {
  const [formData, setFormData] = useState<ICompareMaterialCodeResponse>({
    material_id: '',
    internal_code: '',
    external_code: '',
    description: '',
    status: STATUS.ACTIVE,
  });

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        ...initialData,
      });
    } else if (mode === 'add') {
      setFormData({
        material_id: '',
        internal_code: '',
        external_code: '',
        description: '',
        status: STATUS.ACTIVE,
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
      <DialogTitle className='primary-dialog-title'>
        {mode === 'edit' ? 'SỬA MÃ SO SÁNH' : 'THÊM MÃ SO SÁNH'}
      </DialogTitle>
      <DialogContent className='primary-dialog-content'>
        <Grid container spacing={2} className="myprofile-form">

          {/* MATERIAL ID */}
          <Grid size={12} className="myprofile-form__group">
            <LabelPrimary value="Mã nguyên vật liệu" required />
            <TextField
              value={formData.material_id}
              name="material_id"
              onChange={handleChange}
              fullWidth
              variant="outlined"
              className="primary-text__field"
              disabled={mode === 'edit'}
            />
          </Grid>

          {/* INTERNAL CODE */}
          <Grid size={6} className="myprofile-form__group">
            <LabelPrimary value="Mã nội bộ" />
            <TextField
              value={formData.internal_code}
              name="internal_code"
              onChange={handleChange}
              fullWidth
              variant="outlined"
              className="primary-text__field"
            />
          </Grid>

          {/* EXTERNAL CODE */}
          <Grid size={6} className="myprofile-form__group">
            <LabelPrimary value="Mã hải quan" />
            <TextField
              value={formData.external_code}
              name="external_code"
              onChange={handleChange}
              fullWidth
              variant="outlined"
              className="primary-text__field"
            />
          </Grid>

          {/* DESCRIPTION */}
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

export default CompareMaterialCodeFormModel;
