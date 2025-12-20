import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
} from '@mui/material';
import type { IUnitResponse } from '../types';
import LabelPrimary from '../../../components/Label/Label';
import Button from '../../../components/Button/Button';
import { STATUS } from '../../../constants/status';

interface UnitFormModelProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: IUnitResponse) => void;
  initialData?: IUnitResponse;
  mode?: 'add' | 'edit';
}

const UnitFormModel: React.FC<UnitFormModelProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData, 
  mode = 'add' 
}) => {
  const [formData, setFormData] = useState<IUnitResponse>({
    unit_code: '',
    unit_name: '',
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
        unit_code: '',
        unit_name: '',
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
        {mode === 'edit' ? 'SỬA THÔNG TIN ĐƠN VỊ TÍNH' : 'THÊM ĐƠN VỊ TÍNH'}
      </DialogTitle>
      <DialogContent className='primary-dialog-content'>
        <Grid container spacing={2} className="myprofile-form">

          {/* UNIT CODE */}
          <Grid size={6} className="myprofile-form__group">
            <LabelPrimary value="Mã đơn vị tính" required />
            <TextField
              value={formData.unit_code}
              name="unit_code"
              onChange={handleChange}
              fullWidth
              variant="outlined"
              className="primary-text__field"
            />
          </Grid>

          {/* UNIT NAME */}
          <Grid size={6} className="myprofile-form__group">
            <LabelPrimary value="Tên đơn vị tính" required />
            <TextField
              value={formData.unit_name}
              name="unit_name"
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

export default UnitFormModel;