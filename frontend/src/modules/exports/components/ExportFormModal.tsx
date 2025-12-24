import * as React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  IconButton,
} from "@mui/material";
import { AiOutlineMinusCircle, AiOutlinePlusCircle } from "react-icons/ai";
import Button from "../../../components/Button/Button";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import type { IExportFormDetailRow, IExportFormPayload } from "../types";

interface ExportFormModalProps {
  open: boolean;
  mode: "add" | "edit";
  initialData?: IExportFormPayload;
  onClose: () => void;
  onSubmit: (data: IExportFormPayload) => void;
}

const emptyDetailRow = (): IExportFormDetailRow => ({
  hs_code: "",
  product_code: "",
  product_name: "",
  origin_country_name: "",
  unit_name: "",
  unit_name_2: "",
  quantity: "",
  quantity2: "",
  unit_price: "",
  unit_price_transport: "",
  invoice_value: "",
  taxable_price: "",
  status: "draft",
});

export default function ExportFormModal({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
}: ExportFormModalProps) {
  const { showSnackbar } = useSnackbar();
  const [formState, setFormState] = React.useState<IExportFormPayload>({
    export_declaration_number: "",
    licence_number: "",
    licence_date: "",
    bill_number: "",
    importer: "",
    type_declaration: "",
    type_inventory: "",
    shipping_term: "",
    usd_exchange_rate: "",
    details: [emptyDetailRow()],
  });

  React.useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormState({
        ...initialData,
        details: initialData.details.map((detail) => ({ ...detail })),
      });
      return;
    }

    if (mode === "add") {
      setFormState({
        export_declaration_number: "",
        licence_number: "",
        licence_date: "",
        bill_number: "",
        importer: "",
        type_declaration: "",
        type_inventory: "",
        shipping_term: "",
        usd_exchange_rate: "",
        details: [emptyDetailRow()],
      });
    }
  }, [initialData, mode, open]);

  const handleHeaderChange = (key: keyof IExportFormPayload, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleDetailChange = (
    index: number,
    key: keyof IExportFormDetailRow,
    value: string,
  ) => {
    setFormState((prev) => {
      const nextDetails = [...prev.details];
      nextDetails[index] = {
        ...nextDetails[index],
        [key]: value,
      };
      return { ...prev, details: nextDetails };
    });
  };

  const handleAddDetail = () => {
    setFormState((prev) => ({
      ...prev,
      details: [...prev.details, emptyDetailRow()],
    }));
  };

  const handleRemoveDetail = (index: number) => {
    setFormState((prev) => {
      if (prev.details.length === 1) return prev;
      const nextDetails = [...prev.details];
      nextDetails.splice(index, 1);
      return { ...prev, details: nextDetails };
    });
  };

  const handleSubmit = () => {
    if (!formState.export_declaration_number || !formState.type_declaration || !formState.type_inventory) {
      showSnackbar({
        message: "Vui lòng điền số tờ khai, mã loại hình và loại tồn",
        severity: "warning",
      });
      return;
    }

    const hasValidDetail = formState.details.some(
      (detail) => detail.product_code.trim() !== "" && detail.hs_code.trim() !== "",
    );
    if (!hasValidDetail) {
      showSnackbar({
        message: "Cần nhập ít nhất một dòng hàng có mã hàng và mã HS",
        severity: "warning",
      });
      return;
    }

    onSubmit(formState);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle className="primary-dialog-title">
        {mode === "add" ? "Tạo tờ khai xuất" : "Sửa tờ khai xuất"}
      </DialogTitle>
      <DialogContent className="primary-dialog-content">
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Số tờ khai"
              value={formState.export_declaration_number}
              onChange={(event) => handleHeaderChange("export_declaration_number", event.target.value)}
              fullWidth
              className="primary-text__field"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Mã loại hình"
              value={formState.type_declaration}
              onChange={(event) => handleHeaderChange("type_declaration", event.target.value)}
              fullWidth
              className="primary-text__field"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Loại tồn"
              value={formState.type_inventory}
              onChange={(event) => handleHeaderChange("type_inventory", event.target.value)}
              fullWidth
              className="primary-text__field"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Người khai"
              value={formState.importer}
              onChange={(event) => handleHeaderChange("importer", event.target.value)}
              fullWidth
              className="primary-text__field"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Ngày khai"
              type="date"
              value={formState.licence_date}
              onChange={(event) => handleHeaderChange("licence_date", event.target.value)}
              fullWidth
              InputLabelProps={{ shrink: Boolean(formState.licence_date) }}
              className="primary-text__field"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Bill"
              value={formState.bill_number}
              onChange={(event) => handleHeaderChange("bill_number", event.target.value)}
              fullWidth
              className="primary-text__field"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Điều kiện"
              value={formState.shipping_term}
              onChange={(event) => handleHeaderChange("shipping_term", event.target.value)}
              fullWidth
              className="primary-text__field"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Tỷ giá USD"
              type="number"
              value={formState.usd_exchange_rate}
              onChange={(event) => handleHeaderChange("usd_exchange_rate", event.target.value)}
              fullWidth
              className="primary-text__field"
            />
          </Grid>
        </Grid>

        <div className="export-form-details-header">
          <span>Chi tiết hàng hóa</span>
          <IconButton onClick={handleAddDetail}>
            <AiOutlinePlusCircle />
          </IconButton>
        </div>

        {formState.details.map((detail, index) => (
          <Grid
            spacing={2}
            container
            key={`detail-row-${index}`}
            className="export-detail-form-row"
          >
            <Grid item xs={3}>
              <TextField
                label="Mã SP"
                value={detail.product_code}
                onChange={(event) => handleDetailChange(index, "product_code", event.target.value)}
                fullWidth
                className="primary-text__field"
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Mã HS"
                value={detail.hs_code}
                onChange={(event) => handleDetailChange(index, "hs_code", event.target.value)}
                fullWidth
                className="primary-text__field"
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Đơn vị tính"
                value={detail.unit_name}
                onChange={(event) => handleDetailChange(index, "unit_name", event.target.value)}
                fullWidth
                className="primary-text__field"
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="SL"
                type="number"
                value={detail.quantity}
                onChange={(event) => handleDetailChange(index, "quantity", event.target.value)}
                fullWidth
                className="primary-text__field"
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Đơn giá"
                type="number"
                value={detail.unit_price}
                onChange={(event) => handleDetailChange(index, "unit_price", event.target.value)}
                fullWidth
                className="primary-text__field"
              />
            </Grid>
            <Grid item xs={1} className="export-detail-remove">
              <IconButton onClick={() => handleRemoveDetail(index)}>
                <AiOutlineMinusCircle />
              </IconButton>
            </Grid>
          </Grid>
        ))}
      </DialogContent>
      <DialogActions className="primary-dialog-actions">
        <Button onClick={onClose} className="button-cancel">
          Hủy
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
