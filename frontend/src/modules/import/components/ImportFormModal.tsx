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
import PrimaryPagination from "../../../components/Pagination/Pagination";
import ImportFormTable, { type ImportMaterialRow } from "./ImportFormTable";
import type { ImportDeclarationResponse } from "../types";
import { useGetDropdownUnits } from "../../units/apis/dropdown";
import { useGetDropdownCountries } from "../../countries/apis/dropdown";
import { useGetDropdownPartners } from "../../partners/apis/dropdown";
import { useGetDropdownCurrencies } from "../../currencies/apis/dropdown";
import { useGetExchangeRate } from "../../currencies/apis/getExchangeRate";
import AutocompletePrimary from "../../../components/Autocomplete/AutoComplete";
import { exportExcel } from "../../../utils/exportExcel";
import { STATUS_DISPLAY } from "../../../utils/statusDisplay";

export type ImportDeclarationFormValues = {
    import_declaration_number: string;
    licence_number: string;
    bill_number: string;
    exporter: string;
    exporter_id: string;
    type_declaration: string;
    type_inventory: string;
    shipping_term: string;
    currency_id: string;
    currency_name: string;
    usd_exchange_rate: string;
    shipping_fee: string;
    status: string;
};

interface ImportFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit?: (data: ImportDeclarationFormValues & { materials: ImportMaterialRow[] }) => void;
    initialData?: ImportDeclarationResponse | null;
    mode?: "add" | "edit";
}

const defaultFormValues: ImportDeclarationFormValues = {
    import_declaration_number: "",
    licence_number: "",
    bill_number: "",
    exporter: "",
    exporter_id: "",
    type_declaration: "",
    type_inventory: "",
    shipping_term: "",
    currency_id: "",
    currency_name: "",
    usd_exchange_rate: "",
    shipping_fee: "",
    status: STATUS_DISPLAY.active,
};

const createEmptyRow = (): ImportMaterialRow => ({
    id: `row-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    material_code: "",
    material_name: "",
    unit_id: "",
    unit_name: "",
    unit_id_2: "",
    unit_name_2: "",
    quantity: "",
    quantity2: "",
    unit_price: "",
    country_id: "",
    country_name: "",
    country_code: "",
    description: "",
});

const ImportFormModal: React.FC<ImportFormModalProps> = ({
    open,
    onClose,
    onSubmit,
    initialData,
    mode = "add",
}) => {
    const [formData, setFormData] = useState<ImportDeclarationFormValues>(defaultFormValues);
    const [rows, setRows] = useState<ImportMaterialRow[]>([createEmptyRow()]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const paramsUnit = {
        skip: 0,
        limit: 50,
    };

    const paramsCountry = {
        skip: 0,
        limit: 200,
    };

    const { data: units = [] } = useGetDropdownUnits(paramsUnit);
    const { data: countries = [] } = useGetDropdownCountries(paramsCountry);
    const { data: partners = [] } = useGetDropdownPartners({ skip: 0, limit: 50 });
    const { data: currencies = [] } = useGetDropdownCurrencies({ skip: 0, limit: 50 });
    const { data: exchangeRateData } = useGetExchangeRate(
        { base: "USD", target: "VND" },
        { enabled: open }
    );

    useEffect(() => {
        if (!open) return;

        if (mode === "edit" && initialData) {
            setFormData({
                import_declaration_number: initialData.import_declaration_number || "",
                licence_number: initialData.licence_number || "",
                bill_number: initialData.bill_number || "",
                exporter: initialData.exporter || "",
                exporter_id: initialData.exporter_id || "",
                type_declaration: initialData.type_declaration || "",
                type_inventory: initialData.type_inventory || "",
                shipping_term: initialData.shipping_term || "",
                currency_id: initialData.currency_id || "",
                currency_name: initialData.currency_name || "",
                usd_exchange_rate: initialData.usd_exchange_rate?.toString() ?? "",
                shipping_fee: initialData.shipping_fee?.toString() ?? "",
                status: initialData.status || STATUS_DISPLAY.active,
            });

            const mappedDetails = initialData.details.map((detail) => ({
                id: detail.id,
                material_code: detail.hs_code || "",
                material_name: detail.material_name || "",
                unit_id: detail.unit_id || "",
                unit_name: detail.unit_name || "",
                unit_id_2: detail.unit_id_2 || "",
                unit_name_2: detail.unit_name_2 || "",
                quantity: detail.quantity?.toString() ?? "",
                quantity2: detail.quantity2?.toString() ?? "",
                unit_price: detail.unit_price?.toString() ?? "",
                country_id: detail.origin_country_id || "",
                country_name: detail.country_name || "",
                country_code: "",
                description: "",
            }));

            setRows(mappedDetails.length ? mappedDetails : [createEmptyRow()]);
            return;
        }

        setFormData(defaultFormValues);
        setRows([createEmptyRow()]);
    }, [open, mode, initialData]);

    useEffect(() => {
        if (!open || mode !== "add") return;
        if (formData.usd_exchange_rate) return;
        const rate = exchangeRateData?.rate;
        if (rate) {
            setFormData((prev) => ({
                ...prev,
                usd_exchange_rate: rate.toFixed(4),
            }));
        }
    }, [open, mode, formData.usd_exchange_rate, exchangeRateData?.rate]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddRow = () => {
        setRows((prev) => {
            const updated = [...prev, createEmptyRow()];
            if (mode === "edit") {
                setPage(Math.max(1, Math.ceil(updated.length / rowsPerPage)));
            }
            return updated;
        });
    };

    const handleRemoveRow = (id: string) => {
        setRows((prev) => prev.filter((row) => row.id !== id));
    };

    const handleUpdateRow = (id: string, updates: Partial<ImportMaterialRow>) => {
        setRows((prev) =>
            prev.map((row) => (row.id === id ? { ...row, ...updates } : row))
        );
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleExportTemplate = () => {
        const headers = {
            material_code: "HS Code",
            material_name: "Tên NVL",
            unit_name: "ĐVT",
            unit_name_2: "ĐVT 2",
            quantity: "Số lượng",
            quantity2: "SL 2",
            unit_price: "Đơn giá",
            origin_country: "Mã QG",
            description: "Mô tả",
        };

        const templateRow = {
            material_code: "",
            material_name: "",
            unit_name: "",
            unit_name_2: "",
            quantity: "",
            quantity2: "",
            unit_price: "",
            origin_country: "",
            description: "",
        };

        exportExcel([templateRow], "import_materials_template", {
            sheetName: "Template",
            headers,
            title: "TEMPLATE NGUYEN VAT LIEU",
        });
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
                range: 2,
                defval: "",
            });

            const countryLookup = countries.reduce<Record<string, { id: string; name: string }>>(
                (acc, item) => {
                    acc[item.country_name.trim().toUpperCase()] = {
                        id: item.id,
                        name: item.country_name,
                    };
                    return acc;
                },
                {}
            );

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

                    const countryKey = `${origin_country}`.trim().toUpperCase();
                    const matchedCountry = countryLookup[countryKey];

                    return {
                        id: `import-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                        material_code: `${material_code}`.trim(),
                        material_name: `${material_name}`.trim(),
                        unit_id: "",
                        unit_name: `${unit_name}`.trim(),
                        unit_id_2: "",
                        unit_name_2: `${unit_name_2}`.trim(),
                        quantity: `${quantity}`.trim(),
                        quantity2: `${quantity2}`.trim(),
                        unit_price: `${unit_price}`.trim(),
                        country_id: matchedCountry?.id || "",
                        country_name: matchedCountry?.name || `${origin_country}`.trim(),
                        country_code: `${origin_country}`.trim(),
                        description: `${description}`.trim(),
                    } as ImportMaterialRow;
                });

            if (mapped.length) {
                setRows(mapped);
                setPage(1);
            } else {
                setRows([createEmptyRow()]);
                setPage(1);
            }
        };

        reader.readAsArrayBuffer(file);
        event.target.value = "";
    };

    const handleSubmit = () => {
        onSubmit?.({ ...formData, materials: rows });
    };

    const shouldPaginate = mode === "edit";

    useEffect(() => {
        if (!shouldPaginate) return;
        const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [rows.length, rowsPerPage, page, shouldPaginate]);

    const paginatedRows = shouldPaginate
        ? rows.slice(
              (page - 1) * rowsPerPage,
              (page - 1) * rowsPerPage + rowsPerPage
          )
        : rows;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xl"
            fullWidth
            PaperProps={{
                sx: {
                    height: "90vh",
                },
            }}
        >
            <DialogTitle className="primary-dialog-title">
                {mode === "edit" ? "SỬA TỜ KHAI NHẬP KHẨU" : "TẠO TỜ KHAI NHẬP KHẨU"}
            </DialogTitle>
            <DialogContent
                className="primary-dialog-content"
                sx={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
                <Grid container spacing={2} className="myprofile-form">
                    <Grid size={3} className="myprofile-form__group">
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
                    <Grid size={3} className="myprofile-form__group">
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
                    <Grid size={3} className="myprofile-form__group">
                        <LabelPrimary value="Số vận đơn" required />
                        <TextField
                            name="bill_number"
                            value={formData.bill_number}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            className="primary-text__field"
                        />
                    </Grid>
                    <Grid size={3} className="myprofile-form__group">
                        <LabelPrimary value="Doanh nghiệp" required />
                        <AutocompletePrimary
                            labelKey="partner_name"
                            valueKey="id"
                            options={partners}
                            value={
                                formData.exporter
                                    ? { id: formData.exporter_id, partner_name: formData.exporter }
                                    : null
                            }
                            inputValue={formData.exporter}
                            onInputChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    exporter: value,
                                    exporter_id: "",
                                }))
                            }
                            onChange={(val) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    exporter: val.partner_name || "",
                                    exporter_id: val.id || "",
                                }))
                            }
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
                        <LabelPrimary value="Loại hình" required />
                        <TextField
                            name="type_inventory"
                            value={formData.type_inventory}
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
                    <Grid size={3} className="myprofile-form__group">
                        <LabelPrimary value="Tiền tệ" />
                        <AutocompletePrimary
                            labelKey="currency_name"
                            valueKey="id"
                            options={currencies}
                            value={
                                formData.currency_name
                                    ? {
                                          id: formData.currency_id,
                                          currency_name: formData.currency_name,
                                      }
                                    : null
                            }
                            inputValue={formData.currency_name}
                            onInputChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    currency_name: value,
                                    currency_id: "",
                                }))
                            }
                            onChange={(val) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    currency_name: val.currency_name || "",
                                    currency_id: val.id || "",
                                }))
                            }
                        />
                    </Grid>
                    <Grid size={3} className="myprofile-form__group">
                        <LabelPrimary value="Tỷ giá USD" />
                        <TextField
                            name="usd_exchange_rate"
                            value={formData.usd_exchange_rate}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            className="primary-text__field"
                        />
                    </Grid>
                    <Grid size={3} className="myprofile-form__group">
                        <LabelPrimary value="Phí vận chuyển" />
                        <TextField
                            name="shipping_fee"
                            value={formData.shipping_fee}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            className="primary-text__field"
                        />
                    </Grid>
                    <Grid size={3} className="myprofile-form__group">
                        <LabelPrimary value="Trạng thái" />
                        <TextField
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            className="primary-text__field"
                        />
                    </Grid>
                </Grid>

                <div className="product-actions" style={{ marginTop: 16 }}>
                    <div className="product-actions__buttons">
                        <Button className="product-action-btn" onClick={handleExportTemplate}>
                            Xuất mẫu Excel
                        </Button>
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

                <div style={{ marginTop: 16, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <ImportFormTable
                            rows={paginatedRows}
                            unitOptions={units}
                            countryOptions={countries}
                            onUpdateRow={handleUpdateRow}
                            onRemoveRow={handleRemoveRow}
                        />
                    </div>
                    {shouldPaginate && (
                        <PrimaryPagination
                            totalItems={rows.length}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            onPageChange={(value) => setPage(value)}
                            onRowsPerPageChange={(value) => {
                                setRowsPerPage(value);
                                setPage(1);
                            }}
                        />
                    )}
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
