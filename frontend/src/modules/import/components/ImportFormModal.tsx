import React, { useEffect, useRef, useState } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
} from "@mui/material";
import * as XLSX from "xlsx";
import Button from "../../../components/Button/Button";
import LabelPrimary from "../../../components/Label/Label";
import ImportFormTable, { type ImportMaterialRow } from "./ImportFormTable";

type ImportDeclarationFormValues = {
    import_declaration_number: string;
    licence_number: string;
    bill_number: string;
    exporter: string;
    type_declaration: string;
    shipping_term: string;
};

interface ImportFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit?: (data: ImportDeclarationFormValues & { materials: ImportMaterialRow[] }) => void;
}

const defaultFormValues: ImportDeclarationFormValues = {
    import_declaration_number: "",
    licence_number: "",
    bill_number: "",
    exporter: "",
    type_declaration: "",
    shipping_term: "",
};

const createEmptyRow = (): ImportMaterialRow => ({
    id: `row-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    material_code: "",
    material_name: "",
    unit_name: "",
    unit_name_2: "",
    quantity: "",
    quantity2: "",
    unit_price: "",
    origin_country: "",
    description: "",
});

const mockRows: ImportMaterialRow[] = [
    {
        id: "mock-1",
        material_code: "5208.39",
        material_name: "Vải cotton",
        unit_name: "M",
        unit_name_2: "KG",
        quantity: "1200",
        quantity2: "850",
        unit_price: "3.2",
        origin_country: "CN",
        description: "Khổ 1.5m",
    },
    {
        id: "mock-2",
        material_code: "5509.21",
        material_name: "Sợi polyester",
        unit_name: "KG",
        unit_name_2: "",
        quantity: "500",
        quantity2: "",
        unit_price: "2.4",
        origin_country: "KR",
        description: "Loại 36/1",
    },
];

const ImportFormModal: React.FC<ImportFormModalProps> = ({ open, onClose, onSubmit }) => {
    const [formData, setFormData] = useState<ImportDeclarationFormValues>(defaultFormValues);
    const [rows, setRows] = useState<ImportMaterialRow[]>(mockRows);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!open) return;
        setFormData(defaultFormValues);
        setRows(mockRows);
    }, [open]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddRow = () => {
        setRows((prev) => [...prev, createEmptyRow()]);
    };

    const handleRemoveRow = (id: string) => {
        setRows((prev) => prev.filter((row) => row.id !== id));
    };

    const handleChangeRow = (id: string, field: keyof ImportMaterialRow, value: string) => {
        setRows((prev) =>
            prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
        );
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (evt) => {
            const data = evt.target?.result;
            if (!data) return;

            const workbook = XLSX.read(new Uint8Array(data as ArrayBuffer), { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            const rowsFromExcel: any[][] = XLSX.utils.sheet_to_json(sheet, {
                header: 1,
                range: 1,
                defval: "",
            });

            const mapped = rowsFromExcel
                .filter((row) => row.some((cell) => `${cell}`.trim() !== ""))
                .map((row) => {
                    const [
                        material_code = "",
                        material_name = "",
                        unit_name = "",
                        unit_name_2 = "",
                        quantity = "",
                        quantity2 = "",
                        unit_price = "",
                        origin_country = "",
                        description = "",
                    ] = row;

                    return {
                        id: `import-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                        material_code: `${material_code}`.trim(),
                        material_name: `${material_name}`.trim(),
                        unit_name: `${unit_name}`.trim(),
                        unit_name_2: `${unit_name_2}`.trim(),
                        quantity: `${quantity}`.trim(),
                        quantity2: `${quantity2}`.trim(),
                        unit_price: `${unit_price}`.trim(),
                        origin_country: `${origin_country}`.trim(),
                        description: `${description}`.trim(),
                    } as ImportMaterialRow;
                });

            setRows(mapped.length ? mapped : [createEmptyRow()]);
        };

        reader.readAsArrayBuffer(file);
        event.target.value = "";
    };

    const handleSubmit = () => {
        onSubmit?.({ ...formData, materials: rows });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle className="primary-dialog-title">TẠO TỜ KHAI NHẬP KHẨU</DialogTitle>
            <DialogContent className="primary-dialog-content">
                <Grid container spacing={2} className="myprofile-form">
                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Số tờ khai" required />
                        <TextField
                            name="import_declaration_number"
                            value={formData.import_declaration_number}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            className="primary-text__field"
                        />
                    </Grid>
                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Số giấy phép" />
                        <TextField
                            name="licence_number"
                            value={formData.licence_number}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            className="primary-text__field"
                        />
                    </Grid>
                    <Grid size={4} className="myprofile-form__group">
                        <LabelPrimary value="Số vận đơn" />
                        <TextField
                            name="bill_number"
                            value={formData.bill_number}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            className="primary-text__field"
                        />
                    </Grid>
                    <Grid size={6} className="myprofile-form__group">
                        <LabelPrimary value="Doanh nghiệp" required />
                        <TextField
                            name="exporter"
                            value={formData.exporter}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            className="primary-text__field"
                        />
                    </Grid>
                    <Grid size={3} className="myprofile-form__group">
                        <LabelPrimary value="Loại tờ khai" required />
                        <TextField
                            name="type_declaration"
                            value={formData.type_declaration}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            className="primary-text__field"
                        />
                    </Grid>
                    <Grid size={3} className="myprofile-form__group">
                        <LabelPrimary value="Điều kiện giao hàng" />
                        <TextField
                            name="shipping_term"
                            value={formData.shipping_term}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            className="primary-text__field"
                        />
                    </Grid>
                </Grid>

                <div className="product-actions" style={{ marginTop: 16 }}>
                    <div className="product-actions__buttons">
                        <Button className="product-action-btn" onClick={handleImportClick}>
                            Tải lên Excel
                        </Button>
                        <Button className="product-action-btn" onClick={handleAddRow}>
                            Thêm dòng
                        </Button>
                    </div>
                </div>

                <input
                    type="file"
                    accept=".xlsx,.xls,.xlsm,.xlsb"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                />

                <div style={{ marginTop: 16 }}>
                    <ImportFormTable rows={rows} onChangeRow={handleChangeRow} onRemoveRow={handleRemoveRow} />
                </div>
            </DialogContent>

            <DialogActions className="primary-dialog-actions">
                <Button className="button-cancel" onClick={onClose}>
                    HỦY
                </Button>
                <Button onClick={handleSubmit} variant="contained">
                    LƯU
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ImportFormModal;
