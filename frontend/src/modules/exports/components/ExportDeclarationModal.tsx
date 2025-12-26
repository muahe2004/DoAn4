import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  IconButton,
} from "@mui/material";
import LabelPrimary from "../../../components/Label/Label";
import PrimaryPagination from "../../../components/Pagination/Pagination";
import type {
  IExportCreateDetailPayload,
  IExportDetailView,
} from "../types";
import * as XLSX from "xlsx";
import { parseNumber, normalizeText } from "../utils";
import AutocompletePrimary from "../../../components/Autocomplete/AutoComplete";
import { useGetDropdownUnits } from "../../units/apis/dropdown";
import { useGetDropdownCountries } from "../../countries/apis/dropdown";
import { useGetDropdownPartners } from "../../partners/apis/dropdown";
import { useGetDropdownCurrencies } from "../../currencies/apis/dropdown";
import { exportExcel } from "../../../utils/exportExcel";
import { PiTrashSimpleFill } from "react-icons/pi";
import "./ExportDeclarationModal.css";

type Mode = "create" | "detail";

interface HeaderState {
  export_declaration_number: string;
  bill_number: string;
  licence_date: string;
  importer: string;
  importer_id: string;
  shipping_term: string;
  type_declaration: string;
  type_inventory: string;
  usd_exchange_rate: string;
  currency_id: string;
  currency_name: string;
}

const defaultHeader: HeaderState = {
  export_declaration_number: "",
  bill_number: "",
  licence_date: "",
  importer: "",
  importer_id: "",
  shipping_term: "",
  type_declaration: "",
  type_inventory: "",
  usd_exchange_rate: "",
  currency_id: "",
  currency_name: "",
};

type ExportDetailRow = IExportCreateDetailPayload & { row_id: string };

const createEmptyDetail = (): ExportDetailRow => ({
  row_id: `row-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  hs_code: "",
  product_code: "",
  product_name: "",
  origin_country_id: "",
  origin_country_name: "",
  origin_country_code: "",
  unit_id: "",
  unit_name: "",
  unit_id_2: "",
  unit_name_2: "",
  quantity: undefined,
  quantity2: undefined,
  unit_price: undefined,
  unit_price_transport: undefined,
  invoice_value: undefined,
  taxable_price: undefined,
  status: "active",
});

const detailInputNoUnderlineSx = {
  "& .MuiInput-root:before, & .MuiInput-root:after": {
    borderBottom: "none",
  },
  "& .MuiInput-root:hover:not(.Mui-disabled):before": {
    borderBottom: "none",
  },
};

const HEADER_ALIASES: Record<string, string[]> = {
  export_declaration_number: ["số_tờ_khai", "số tk", "số tờ khai", "số tk"],
  licence_date: ["ngày khai", "ngày đk", "ngày đăng ký"],
  bill_number: ["số hóa đơn", "bill", "số hóa đơn"],
  importer: ["người khai", "người nhập khẩu"],
  shipping_term: ["đkvc", "điều kiện"],
  type_declaration: ["mã loại hình"],
  type_inventory: ["loại tồn"],
  usd_exchange_rate: ["tỷ giá"],
  origin_country_code: ["mã qg", "mã quốc gia", "country code", "origin country"],
  origin_country_name: ["quốc gia", "tên quốc gia", "nước xk", "nuoc xk"],
  hs_code: ["HS Code"],
  product_code: ["Product Code"],
  product_name: ["Product Name"],
  unit_name: ["đơn vị tính"],
  unit_name_2: ["đơn vị tính 2", "đơn vị 2", "đvt2", "đv2"],
  quantity: ["số lượng", "sl"],
  quantity2: ["sl 2", "số lượng 2", "sl2"],
  unit_price: ["Unit Price"],
  unit_price_transport: ["unit price transport", "đơn giá vc", "đơn giá vận chuyển"],
  invoice_value: ["giá hóa đơn", "invoice value"],
  taxable_price: ["giá tính thuế", "taxable price"],
};

const normalizeHeaderCell = (cell: unknown) =>
  normalizeText(cell)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

const detectColumn = (cells: string[], aliases: string[]) => {
  for (const alias of aliases) {
    const normalizedAlias = normalizeHeaderCell(alias);
    const idx = cells.findIndex((cell) => cell.includes(normalizedAlias));
    if (idx >= 0) return idx;
  }
  return -1;
};

const extractDetailsFromSheet = (
  sheet: XLSX.WorkSheet
): {
  number: string;
  details: IExportCreateDetailPayload[];
  header: Partial<HeaderState>;
}[] => {
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  }) as unknown[][];
  const headerRow = (cells: unknown[]) =>
    cells.map((cell) => normalizeHeaderCell(cell));

  const headerIndex = rows.findIndex((row) => {
    const normalized = headerRow(row);
    return (
      detectColumn(normalized, HEADER_ALIASES.product_code) >= 0 &&
      detectColumn(normalized, HEADER_ALIASES.hs_code) >= 0
    );
  });
  if (headerIndex === -1) {
    return [];
  }

  const headerCells = headerRow(rows[headerIndex]);
  const declarationsMap = new Map<
    string,
    {
      details: IExportCreateDetailPayload[];
      header: Partial<HeaderState>;
    }
  >();

  const columnIndex = (aliases: string[]) => detectColumn(headerCells, aliases);
  const hsColumn = columnIndex(HEADER_ALIASES.hs_code);
  const productColumn = columnIndex(HEADER_ALIASES.product_code);
  const productNameColumn = columnIndex(HEADER_ALIASES.product_name ?? []);
  const unitColumn = columnIndex(HEADER_ALIASES.unit_name);
  const unit2Column = columnIndex(HEADER_ALIASES.unit_name_2);
  const quantityColumn = columnIndex(HEADER_ALIASES.quantity);
  const quantity2Column = columnIndex(HEADER_ALIASES.quantity2);
  const unitPriceColumn = columnIndex(HEADER_ALIASES.unit_price);
  const unitPriceTransportColumn = columnIndex(HEADER_ALIASES.unit_price_transport);
  const invoiceValueColumn = columnIndex(HEADER_ALIASES.invoice_value);
  const taxablePriceColumn = columnIndex(HEADER_ALIASES.taxable_price);
  const declarationColumn = columnIndex(HEADER_ALIASES.export_declaration_number);
  const billColumn = columnIndex(HEADER_ALIASES.bill_number);
  const importerColumn = columnIndex(HEADER_ALIASES.importer);
  const shippingColumn = columnIndex(HEADER_ALIASES.shipping_term);
  const typeDeclarationColumn = columnIndex(HEADER_ALIASES.type_declaration);
  const typeInventoryColumn = columnIndex(HEADER_ALIASES.type_inventory);
  const usdColumn = columnIndex(HEADER_ALIASES.usd_exchange_rate);
  const originCountryCodeColumn = columnIndex(HEADER_ALIASES.origin_country_code);
  const originCountryNameColumn = columnIndex(HEADER_ALIASES.origin_country_name);
  const normalizeNumber = (row: unknown[], col: number) =>
    col >= 0 ? parseNumber(row[col]) : undefined;
  const readValue = (row: unknown[], col: number) =>
    col >= 0 ? `${row[col] ?? ""}`.trim() : "";

  for (let i = headerIndex + 1; i < rows.length; i += 1) {
    const row = rows[i] as unknown[];
    const declarationNumber = readValue(row, declarationColumn);
    const groupKey = declarationNumber || "__default_batch";

    const detail: IExportCreateDetailPayload = {
      hs_code: readValue(row, hsColumn),
      product_code: readValue(row, productColumn),
      product_name: readValue(
        row,
        productNameColumn >= 0 ? productNameColumn : productColumn
      ),
      origin_country_name: originCountryNameColumn >= 0
        ? readValue(row, originCountryNameColumn)
        : originCountryCodeColumn >= 0
          ? readValue(row, originCountryCodeColumn)
          : undefined,
      origin_country_code: readValue(row, originCountryCodeColumn),
      unit_name: readValue(row, unitColumn),
      unit_name_2: readValue(row, unit2Column),
      quantity: normalizeNumber(row, quantityColumn),
      quantity2: normalizeNumber(row, quantity2Column),
      unit_price: normalizeNumber(row, unitPriceColumn),
      unit_price_transport: normalizeNumber(row, unitPriceTransportColumn),
      invoice_value: normalizeNumber(row, invoiceValueColumn),
      taxable_price: normalizeNumber(row, taxablePriceColumn),
      status: "draft",
    };

    const headerData: Partial<HeaderState> = {};
    if (billColumn >= 0) {
      headerData.bill_number = readValue(row, billColumn);
    }
    if (importerColumn >= 0) {
      headerData.importer = readValue(row, importerColumn);
    }
    if (shippingColumn >= 0) {
      headerData.shipping_term = readValue(row, shippingColumn);
    }
    if (typeDeclarationColumn >= 0) {
      headerData.type_declaration = readValue(row, typeDeclarationColumn);
    }
    if (typeInventoryColumn >= 0) {
      headerData.type_inventory = readValue(row, typeInventoryColumn);
    }
    if (usdColumn >= 0) {
      headerData.usd_exchange_rate = readValue(row, usdColumn);
    }

    const target = declarationsMap.get(groupKey);
    if (target) {
      target.details.push(detail);
      target.header = { ...target.header, ...headerData };
    } else {
      declarationsMap.set(groupKey, {
        details: [detail],
        header: {
          export_declaration_number: declarationNumber,
          bill_number: readValue(row, billColumn),
          licence_date: "",
          ...headerData,
        },
      });
    }
  }

  return Array.from(declarationsMap.entries()).map(([number, data]) => ({
    number: number === "__default_batch" ? "" : number,
    details: data.details,
    header: data.header,
  }));
};

interface ExportDeclarationModalProps {
  open: boolean;
  mode: Mode;
  onClose: () => void;
  onSubmit?: (
    header: HeaderState,
    details: IExportCreateDetailPayload[]
  ) => void;
  onSave?: (header: HeaderState, details: IExportCreateDetailPayload[]) => void;
  saving?: boolean;
  title?: string;
  loading?: boolean;
  data?: IExportDetailView | null;
  posting?: boolean;
  onPost?: () => void;
}

const formatUsd = (value?: number) =>
  value != null
    ? value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "";
const formatVnd = (value?: number) =>
  value != null ? value.toLocaleString("vi-VN") : "";

export default function ExportDeclarationModal({
  open,
  mode,
  onClose,
  onSubmit,
  title,
  loading = false,
  data,
  posting,
  onPost,
  onSave,
  saving = false,
}: ExportDeclarationModalProps) {
  const isCreateMode = mode === "create";
  const status = data?.header?.status || "active";
  const headerEditable = isCreateMode || status !== "posted";
  const [headerData, setHeaderData] = useState<HeaderState>(defaultHeader);
  const [detailRows, setDetailRows] = useState<ExportDetailRow[]>([]);
  const [baseDetails, setBaseDetails] = useState<ExportDetailRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const paramsUnit = { skip: 0, limit: 50 };
  const paramsCountry = { skip: 0, limit: 200 };
  const { data: units = [] } = useGetDropdownUnits(paramsUnit);
  const { data: countries = [] } = useGetDropdownCountries(paramsCountry);
  const { data: partners = [] } = useGetDropdownPartners({ skip: 0, limit: 50 });
  const { data: currencies = [] } = useGetDropdownCurrencies({ skip: 0, limit: 50 });

  const handleDetailChange = (
    index: number,
    field: keyof IExportCreateDetailPayload,
    value: string
  ) => {
    setDetailRows((prev) =>
      prev.map((detail, idx) => {
        if (idx !== index) return detail;
        const numberFields = [
          "quantity",
          "quantity2",
          "unit_price",
          "unit_price_transport",
          "invoice_value",
          "taxable_price",
        ];
        if (numberFields.includes(field)) {
          return {
            ...detail,
            [field]: value === "" ? undefined : Number(value),
          };
        }
        return {
          ...detail,
          [field]: value,
        };
      })
    );
  };

  const handleDetailUpdate = (
    index: number,
    updates: Partial<ExportDetailRow>
  ) => {
    setDetailRows((prev) =>
      prev.map((detail, idx) => (idx === index ? { ...detail, ...updates } : detail))
    );
  };

  const handleAddRow = () => {
    setDetailRows((prev) => [...prev, createEmptyDetail()]);
  };

  const handleRemoveRow = (rowId: string) => {
    setDetailRows((prev) => prev.filter((row) => row.row_id !== rowId));
  };
  const serverDetailRows = data?.details || [];
  const detailHeader = data?.header;
  const usdExchangeRate = detailHeader?.usd_exchange_rate ?? 0;
  const calculateVndPrice = (value: number) => value * (usdExchangeRate || 0);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const paginatedDetailRows = detailRows.slice(
    (page - 1) * rowsPerPage,
    (page - 1) * rowsPerPage + rowsPerPage
  );
  useEffect(() => {
    if (!isCreateMode && data?.header) {
      setHeaderData({
        export_declaration_number: detailHeader?.export_declaration_number ?? "",
        bill_number: detailHeader?.bill_number ?? "",
        licence_date: detailHeader?.licence_date?.split("T")[0] ?? "",
        importer: detailHeader?.importer ?? "",
        importer_id: detailHeader?.importer_id ?? "",
        shipping_term: detailHeader?.shipping_term ?? "",
        type_declaration: detailHeader?.type_declaration ?? "",
        type_inventory: detailHeader?.type_inventory ?? "",
        usd_exchange_rate: detailHeader?.usd_exchange_rate?.toString() ?? "",
        currency_id: detailHeader?.currency_id ?? "",
        currency_name: "",
      });
    }
    if (!isCreateMode && data?.details) {
      const mappedDetails = data.details.map((detail) => ({
        row_id: `detail-${detail.id}`,
        hs_code: detail.hs_code,
        product_code: detail.product_code,
        product_name: detail.product_name,
        origin_country_name: detail.origin_country_name ?? "",
        origin_country_code: "",
        origin_country_id: "",
        unit_id: "",
        unit_name: detail.unit_name ?? "",
        unit_id_2: "",
        unit_name_2: detail.unit_name_2 ?? "",
        quantity: detail.quantity,
        quantity2: detail.quantity2,
        unit_price: detail.unit_price,
        unit_price_transport: detail.unit_price_transport,
        invoice_value: detail.invoice_value,
        taxable_price: detail.taxable_price,
        status: detail.status ?? "active",
      }));
      setDetailRows(mappedDetails);
      setBaseDetails(mappedDetails.map((detail) => ({ ...detail })));
    }
  }, [data?.details, data?.header, detailHeader, isCreateMode]);

  useEffect(() => {
    if (isCreateMode && open) {
      setHeaderData(defaultHeader);
      setDetailRows([createEmptyDetail()]);
    }
  }, [isCreateMode, open]);

  useEffect(() => {
    if (!isCreateMode) {
      setPage(1);
    }
  }, [serverDetailRows.length, isCreateMode]);

  const handleHeaderChange = (field: keyof HeaderState, value: string) => {
    setHeaderData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleExportTemplate = () => {
    const headers = {
      hs_code: "HS Code",
      product_code: "Mã sản phẩm",
      product_name: "Tên sản phẩm",
      origin_country: "Nước XK",
      unit_name: "Đơn vị",
      unit_name_2: "Đơn vị 2",
      quantity: "Số lượng",
      quantity2: "SL 2",
      unit_price: "Đơn giá",
      unit_price_transport: "Đơn giá VC",
      invoice_value: "Giá hóa đơn",
      taxable_price: "Giá tính thuế",
    };

    const templateRow = {
      hs_code: "",
      product_code: "",
      product_name: "",
      origin_country: "",
      unit_name: "",
      unit_name_2: "",
      quantity: "",
      quantity2: "",
      unit_price: "",
      unit_price_transport: "",
      invoice_value: "",
      taxable_price: "",
    };

    exportExcel([templateRow], "export_products_template", {
      sheetName: "Template",
      headers,
      title: "TEMPLATE TO KHAI XUAT",
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;
      const workbook = XLSX.read(new Uint8Array(data as ArrayBuffer), {
        type: "array",
      });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet) return;
      const batches = extractDetailsFromSheet(sheet);
      if (!batches.length) return;
      const matchedBatch = batches[0];
      setDetailRows(
        matchedBatch.details.map((detail) => ({
          ...detail,
          row_id: `import-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        }))
      );
      setHeaderData((prev) => ({
        ...prev,
        export_declaration_number:
          matchedBatch.header.export_declaration_number || prev.export_declaration_number,
        bill_number: matchedBatch.header.bill_number || prev.bill_number,
        importer: matchedBatch.header.importer || prev.importer,
        shipping_term: matchedBatch.header.shipping_term || prev.shipping_term,
        type_declaration: matchedBatch.header.type_declaration || prev.type_declaration,
        type_inventory: matchedBatch.header.type_inventory || prev.type_inventory,
        usd_exchange_rate: matchedBatch.header.usd_exchange_rate || prev.usd_exchange_rate,
      }));
    };

    reader.readAsArrayBuffer(file);
    if (event.target) {
      event.target.value = "";
    }
  };

  const normalizeDetailRows = (rows: ExportDetailRow[]) =>
    rows.map(({ row_id: _rowId, ...rest }) => ({
      ...rest,
      origin_country_id: rest.origin_country_id || undefined,
      origin_country_name: rest.origin_country_name || undefined,
      origin_country_code: rest.origin_country_code || undefined,
      unit_id: rest.unit_id || undefined,
      unit_name: rest.unit_name || undefined,
      unit_id_2: rest.unit_id_2 || undefined,
      unit_name_2: rest.unit_name_2 || undefined,
      product_name: rest.product_name || undefined,
    }));

  const handleSubmit = () => {
    if (!isCreateMode || !onSubmit) return;
    if (!headerData.export_declaration_number || !detailRows.length) return;
    onSubmit(headerData, normalizeDetailRows(detailRows));
  };

  const hasChanges = useMemo(() => {
    if (isCreateMode) return false;
    if (detailRows.length !== baseDetails.length) return true;
    return detailRows.some((detail, idx) => {
      const base = baseDetails[idx];
      if (!base) return true;
      const { row_id: _rowId, ...rest } = detail;
      const { row_id: _baseRowId, ...baseRest } = base;
      return JSON.stringify(rest) !== JSON.stringify(baseRest);
    });
  }, [detailRows, baseDetails, isCreateMode]);

  const handleSave = () => {
    if (isCreateMode || !onSave || !detailRows.length || !hasChanges) return;
    onSave(headerData, normalizeDetailRows(detailRows));
  };

  const getHeaderValue = (field: keyof HeaderState) => {
    return headerData[field] ?? "";
  };

  const renderHeaderField = ({
    field,
    label,
    type = "text",
    required = false,
  }: {
    field: keyof HeaderState;
    label: string;
    type?: "text" | "date" | "number";
    required?: boolean;
  }) => (
    <Grid size={3} mt={2}>
      <LabelPrimary value={label} required={required && isCreateMode} />
      <TextField
        type={type}
        fullWidth
        value={getHeaderValue(field)}
        disabled={!headerEditable}
        className="primary-text__field"
        size="small"
        InputProps={{
          readOnly: !headerEditable,
        }}
        InputLabelProps={{
          shrink: type === "date" ? true : undefined,
        }}
        onChange={(event) =>
          headerEditable && handleHeaderChange(field, event.target.value)
        }
      />
    </Grid>
  );

  const createTable = (
    <TableBody className="primary-tbody">
      {detailRows.length === 0 ? (
        <TableRow>
          <TableCell colSpan={13} align="center">
            Chưa có sản phẩm nào
          </TableCell>
        </TableRow>
      ) : (
        detailRows.map((detail, idx) => (
          <TableRow className="primary-trow" key={detail.row_id}>
            <TableCell className="custom-border-tcell primary-tcell">
              <TextField
                fullWidth
                value={detail.hs_code}
                size="small"
                onChange={(event) =>
                  handleDetailChange(idx, "hs_code", event.target.value)
                }
              />
            </TableCell>
            <TableCell className="custom-border-tcell primary-tcell">
              <TextField
                fullWidth
                value={detail.product_code}
                size="small"
                onChange={(event) =>
                  handleDetailChange(idx, "product_code", event.target.value)
                }
              />
            </TableCell>
            <TableCell className="custom-border-tcell primary-tcell">
              <TextField
                fullWidth
                value={detail.product_name ?? ""}
                size="small"
                onChange={(event) =>
                  handleDetailChange(idx, "product_name", event.target.value)
                }
              />
            </TableCell>
            <TableCell className="custom-border-tcell primary-tcell">
              <AutocompletePrimary
                labelKey="country_name"
                valueKey="id"
                options={countries}
                value={
                  detail.origin_country_name
                    ? {
                        id: detail.origin_country_id,
                        country_name: detail.origin_country_name,
                      }
                    : null
                }
                inputValue={detail.origin_country_name ?? ""}
                onInputChange={(value) =>
                  handleDetailUpdate(idx, {
                    origin_country_name: value,
                    origin_country_code: value,
                    origin_country_id: "",
                  })
                }
                onChange={(val) =>
                  handleDetailUpdate(idx, {
                    origin_country_id: val.id || "",
                    origin_country_name: val.country_name || "",
                    origin_country_code: "",
                  })
                }
              />
            </TableCell>
            <TableCell className="custom-border-tcell primary-tcell">
              <AutocompletePrimary
                labelKey="unit_name"
                valueKey="id"
                freeSolo
                options={units}
                value={
                  detail.unit_name
                    ? { id: detail.unit_id, unit_name: detail.unit_name }
                    : null
                }
                inputValue={detail.unit_name ?? ""}
                onInputChange={(value) =>
                  handleDetailUpdate(idx, { unit_name: value, unit_id: "" })
                }
                onChange={(val) =>
                  handleDetailUpdate(idx, {
                    unit_id: val.id || "",
                    unit_name: val.unit_name || "",
                  })
                }
              />
            </TableCell>
            <TableCell className="custom-border-tcell primary-tcell">
              <AutocompletePrimary
                labelKey="unit_name"
                valueKey="id"
                freeSolo
                options={units}
                value={
                  detail.unit_name_2
                    ? { id: detail.unit_id_2, unit_name: detail.unit_name_2 }
                    : null
                }
                inputValue={detail.unit_name_2 ?? ""}
                onInputChange={(value) =>
                  handleDetailUpdate(idx, { unit_name_2: value, unit_id_2: "" })
                }
                onChange={(val) =>
                  handleDetailUpdate(idx, {
                    unit_id_2: val.id || "",
                    unit_name_2: val.unit_name || "",
                  })
                }
              />
            </TableCell>
            <TableCell className="custom-border-tcell primary-tcell">
              <TextField
                fullWidth
                value={detail.quantity?.toString() ?? ""}
                size="small"
                onChange={(event) =>
                  handleDetailChange(idx, "quantity", event.target.value)
                }
              />
            </TableCell>
            <TableCell className="custom-border-tcell primary-tcell">
              <TextField
                fullWidth
                value={detail.quantity2?.toString() ?? ""}
                size="small"
                onChange={(event) =>
                  handleDetailChange(idx, "quantity2", event.target.value)
                }
              />
            </TableCell>
            <TableCell className="custom-border-tcell primary-tcell">
              <TextField
                fullWidth
                value={detail.unit_price?.toString() ?? ""}
                size="small"
                onChange={(event) =>
                  handleDetailChange(idx, "unit_price", event.target.value)
                }
              />
            </TableCell>
            <TableCell className="custom-border-tcell primary-tcell">
              <TextField
                fullWidth
                value={detail.unit_price_transport?.toString() ?? ""}
                size="small"
                onChange={(event) =>
                  handleDetailChange(idx, "unit_price_transport", event.target.value)
                }
              />
            </TableCell>
            <TableCell className="custom-border-tcell primary-tcell">
              <TextField
                fullWidth
                value={detail.invoice_value?.toString() ?? ""}
                size="small"
                onChange={(event) =>
                  handleDetailChange(idx, "invoice_value", event.target.value)
                }
              />
            </TableCell>
            <TableCell className="custom-border-tcell primary-tcell">
              <TextField
                fullWidth
                value={detail.taxable_price?.toString() ?? ""}
                size="small"
                onChange={(event) =>
                  handleDetailChange(idx, "taxable_price", event.target.value)
                }
              />
            </TableCell>
            <TableCell className="custom-border-tcell primary-tcell" align="center">
              <IconButton
                className="primary-delete-btn"
                size="small"
                onClick={() => handleRemoveRow(detail.row_id)}
              >
                <PiTrashSimpleFill />
              </IconButton>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  );

  const detailTable = (
    <>
      <TableHead className="primary-thead">
        <TableRow>
          <TableCell className="primary-tcell" align="center">
            Mã HS
          </TableCell>
          <TableCell className="primary-tcell" align="center">
            Mã sẩn phẩm
          </TableCell>
          <TableCell className="primary-tcell" align="center">
            Tên sản phẩm
          </TableCell>
          <TableCell className="primary-tcell" align="center">
            Mã quốc gia
          </TableCell>
          <TableCell className="primary-tcell" align="center">
            Đơn vị
          </TableCell>
          <TableCell className="primary-tcell" align="center">
            Số lượng
          </TableCell>
          <TableCell className="primary-tcell" align="center">
            Đơn giá
          </TableCell>
          <TableCell className="primary-tcell" align="center">
            ĐG CIF (USD)
          </TableCell>
          <TableCell className="primary-tcell" align="center">
            ĐG tính thuế (VND)
          </TableCell>
          <TableCell className="primary-tcell" align="center">
            TG CIF (USD)
          </TableCell>
          <TableCell className="primary-tcell" align="center">
            TG tính thuế (VND)
          </TableCell>
          <TableCell className="primary-tcell" align="center"></TableCell>
        </TableRow>
      </TableHead>
      <TableBody className="primary-tbody">
        {paginatedDetailRows.map((detail, idx) => {
          const globalIndex = (page - 1) * rowsPerPage + idx;
          const rowKey =
            detailRows[globalIndex]?.row_id ?? `detail-${globalIndex}`;
          const quantity = detail.quantity ?? 0;
          const unitPrice = detail.unit_price ?? 0;
          const dgCifUsd = unitPrice;
          const dgTinhThueVnd = calculateVndPrice(dgCifUsd);
          const tgCifUsd = dgCifUsd * quantity;
          const tgTinhThueVnd = dgTinhThueVnd * quantity;
          return (
            <TableRow key={rowKey}>
              <TableCell className="custom-border-tcell primary-tcell">
                <TextField
                  fullWidth
                  value={detail.hs_code ?? ""}
                  size="small"
                  sx={detailInputNoUnderlineSx}
                  onChange={(event) =>
                    handleDetailChange(globalIndex, "hs_code", event.target.value)
                  }
                />
              </TableCell>
              <TableCell className="custom-border-tcell primary-tcell" width={180}>
                <TextField
                  fullWidth
                  value={detail.product_code ?? ""}
                  size="small"
                  sx={detailInputNoUnderlineSx}
                  onChange={(event) =>
                    handleDetailChange(globalIndex, "product_code", event.target.value)
                  }
                />
              </TableCell>
              <TableCell className="custom-border-tcell primary-tcell" width={250}>
                <TextField
                  fullWidth
                  value={detail.product_name ?? ""}
                  sx={{
                    ...detailInputNoUnderlineSx,
                    overflow: "hidden",
                    maxWidth: 250,
                    flexWrap: "wrap",
                  }}
                  size="small"
                  onChange={(event) =>
                    handleDetailChange(globalIndex, "product_name", event.target.value)
                  }
                />
              </TableCell>
              <TableCell className="custom-border-tcell primary-tcell" width={150}>
                <TextField
                  fullWidth
                  value={detail.origin_country_code ?? detail.origin_country_name ?? ""}
                  size="small"
                  sx={detailInputNoUnderlineSx}
                  onChange={(event) =>
                    handleDetailUpdate(globalIndex, {
                      origin_country_name: event.target.value,
                      origin_country_code: event.target.value,
                      origin_country_id: "",
                    })
                  }
                />
              </TableCell>
              <TableCell className="custom-border-tcell primary-tcell" width={120}>
                <TextField
                  fullWidth
                  value={detail.unit_name ?? ""}
                  size="small"
                  sx={detailInputNoUnderlineSx}
                  onChange={(event) =>
                    handleDetailUpdate(globalIndex, {
                      unit_name: event.target.value,
                      unit_id: "",
                    })
                  }
                />
              </TableCell>
              <TableCell className="custom-border-tcell primary-tcell" width={100}>
                <TextField
                  fullWidth
                  type="number"
                  value={detail.quantity?.toString() ?? ""}
                  size="small"
                  sx={detailInputNoUnderlineSx}
                  onChange={(event) =>
                    handleDetailChange(globalIndex, "quantity", event.target.value)
                  }
                />
              </TableCell>
              <TableCell className="custom-border-tcell primary-tcell">
                <TextField
                  fullWidth
                  value={detail.unit_price?.toString() ?? ""}
                  size="small"
                  sx={detailInputNoUnderlineSx}
                  onChange={(event) =>
                    handleDetailChange(globalIndex, "unit_price", event.target.value)
                  }
                />
              </TableCell>
              <TableCell className="custom-border-tcell primary-tcell">
                <TextField
                  fullWidth
                  value={formatUsd(dgCifUsd)}
                  variant="standard"
                  size="small"
                  sx={detailInputNoUnderlineSx}
                  InputProps={{ readOnly: true, disableUnderline: true }}
                />
              </TableCell>
              <TableCell className="custom-border-tcell primary-tcell">
                <TextField
                  fullWidth
                  value={formatVnd(dgTinhThueVnd)}
                  variant="standard"
                  size="small"
                  sx={detailInputNoUnderlineSx}
                  InputProps={{ readOnly: true, disableUnderline: true }}
                />
              </TableCell>
              <TableCell className="custom-border-tcell primary-tcell">
                <TextField
                  fullWidth
                  value={formatUsd(tgCifUsd)}
                  variant="standard"
                  size="small"
                  sx={detailInputNoUnderlineSx}
                  InputProps={{ readOnly: true, disableUnderline: true }}
                />
              </TableCell>
              <TableCell className="custom-border-tcell primary-tcell">
                <TextField
                  fullWidth
                  value={formatVnd(tgTinhThueVnd)}
                  variant="standard"
                  size="small"
                  sx={detailInputNoUnderlineSx}
                  InputProps={{ readOnly: true, disableUnderline: true }}
                />
              </TableCell>
              <TableCell className="custom-border-tcell primary-tcell" align="center">
                <IconButton
                  className="primary-delete-btn"
                  size="small"
                  onClick={() => handleRemoveRow(detail.row_id)}
                >
                  <PiTrashSimpleFill />
                </IconButton>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isCreateMode ? "lg" : "xl"}
      fullWidth
    >
      <DialogTitle className="primary-dialog-title">
        {title ??
          (isCreateMode ? "TẠO TỜ KHAI XUẤT" : "CHI TIẾT TỜ KHAI XUẤT")}
      </DialogTitle>
      <DialogContent className="primary-dialog-content">
        {loading && !data ? (
          <div className="exports-loading">
            <CircularProgress />
          </div>
        ) : (
          <>
            <Grid container spacing={2} className="export-header-grid">
              {renderHeaderField({
                field: "export_declaration_number",
                label: "Số tờ khai",
                required: true,
              })}
              {renderHeaderField({
                field: "licence_date",
                label: "Ngày khai",
                type: "date",
                required: true,
              })}
              {renderHeaderField({ field: "bill_number", label: "Bill" })}
              <Grid size={3} mt={2}>
                <LabelPrimary value="Người khai" />
                <AutocompletePrimary
                  labelKey="partner_name"
                  valueKey="id"
                  options={partners}
                  value={
                    headerData.importer
                      ? {
                          id: headerData.importer_id,
                          partner_name: headerData.importer,
                        }
                      : null
                  }
                  inputValue={headerData.importer}
                  onInputChange={(value) =>
                    headerEditable &&
                    setHeaderData((prev) => ({
                      ...prev,
                      importer: value,
                      importer_id: "",
                    }))
                  }
                  onChange={(val) =>
                    headerEditable &&
                    setHeaderData((prev) => ({
                      ...prev,
                      importer: val.partner_name || "",
                      importer_id: val.id || "",
                    }))
                  }
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} className="export-header-grid">
              {renderHeaderField({
                field: "type_declaration",
                label: "Mã loại hình",
                required: true,
              })}
              {renderHeaderField({
                field: "type_inventory",
                label: "Loại tồn",
                required: true,
              })}
              {renderHeaderField({ field: "shipping_term", label: "Điều kiện" })}
              <Grid size={3} mt={2}>
                <LabelPrimary value="Tiền tệ" />
                <AutocompletePrimary
                  labelKey="currency_name"
                  valueKey="id"
                  options={currencies}
                  value={
                    headerData.currency_name || headerData.currency_id
                      ? {
                          id: headerData.currency_id,
                          currency_name:
                            headerData.currency_name ||
                            currencies.find((c) => c.id === headerData.currency_id)
                              ?.currency_name ||
                            "",
                        }
                      : null
                  }
                  inputValue={
                    headerData.currency_name ||
                    currencies.find((c) => c.id === headerData.currency_id)?.currency_name ||
                    ""
                  }
                  onInputChange={(value) =>
                    headerEditable &&
                    setHeaderData((prev) => ({
                      ...prev,
                      currency_name: value,
                      currency_id: "",
                    }))
                  }
                  onChange={(val) =>
                    headerEditable &&
                    setHeaderData((prev) => ({
                      ...prev,
                      currency_name: val.currency_name || "",
                      currency_id: val.id || "",
                    }))
                  }
                />
              </Grid>
              {renderHeaderField({
                field: "usd_exchange_rate",
                label: "Quy đổi tỷ giá (USD->VNĐ)",
              })}
            </Grid>

            <div className="export-form-details-header">
              <span className="create-modal-title__label">
                {isCreateMode ? "DANH SÁCH SẢN PHẨM" : "DANH SÁCH SẢN PHẨM (ĐƠN GIÁ CIF/THUẾ)"}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                {isCreateMode && (
                  <Button variant="outlined" onClick={handleExportTemplate}>
                    Xuất mẫu Excel
                  </Button>
                )}
                {isCreateMode && (
                  <Button variant="outlined" onClick={handleImportClick}>
                    Tải lên Excel sản phẩm
                  </Button>
                )}
                <Button variant="outlined" onClick={handleAddRow}>
                  Thêm dòng
                </Button>
              </div>
            </div>

            <TableContainer className="primary-table-container table-modal">
              <Table size="small" stickyHeader>
                {isCreateMode ? (
                  <>
                    <TableHead className="primary-thead">
                      <TableRow>
                        <TableCell className="primary-tcell" align="center">
                          HS
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                          Mã sản phẩm
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                          Tên sản phẩm
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                          Quốc gia
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                          Đơn vị
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                          Đơn vị 2
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                          Số lượng
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                          SL 2
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                          Đơn giá
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                          ĐG VC
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                          Giá HĐ
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                          Giá thuế
                        </TableCell>
                        <TableCell className="primary-tcell" align="center"></TableCell>
                      </TableRow>
                    </TableHead>
                    {createTable}
                  </>
                ) : (
                  <>
                    {detailTable}
                  </>
                )}
              </Table>
            </TableContainer>

            <input
              type="file"
              accept=".xls,.xlsx"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {!isCreateMode && detailRows.length > 0 && (
              <PrimaryPagination
                totalItems={detailRows.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(value) => setPage(value)}
                onRowsPerPageChange={(value) => {
                  setRowsPerPage(value);
                  setPage(1);
                }}
              />
            )}
          </>
        )}
      </DialogContent>
      <DialogActions className="primary-dialog-actions">
        {isCreateMode ? (
          <>
            <Button onClick={onClose} className="button-cancel" disabled={loading}>
              HUỶ
            </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !detailRows.length}
              >
                {loading ? "ĐANG LƯU..." : "LƯU TỜ KHAI"}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onClose} className="button-cancel" disabled={saving}>
                HUỶ
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving || !detailRows.length || !hasChanges}
              >
            {saving ? "ĐANG LƯU..." : "LƯU"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
