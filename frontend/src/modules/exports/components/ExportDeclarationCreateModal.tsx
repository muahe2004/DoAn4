import { useRef, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Button as MuiButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import LabelPrimary from "../../../components/Label/Label";
import { type IExportCreateDetailPayload } from "../types";
import * as XLSX from "xlsx";
import { parseNumber, normalizeText } from "../utils";
import "./ExportDeclarationCreateModal.css";

interface HeaderState {
  export_declaration_number: string;
  bill_number: string;
  licence_date: string;
  importer: string;
  shipping_term: string;
  type_declaration: string;
  type_inventory: string;
  usd_exchange_rate: string;
}

const defaultHeader: HeaderState = {
  export_declaration_number: "",
  bill_number: "",
  licence_date: "",
  importer: "",
  shipping_term: "",
  type_declaration: "",
  type_inventory: "",
  usd_exchange_rate: "",
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
  hs_code: ["mã hs"],
  product_code: ["mã hàng hóa", "mã sp", "mã npl", "mã npl/sp"],
  unit_name: ["đơn vị tính"],
  quantity: ["số lượng", "sl"],
  unit_price: ["đơn giá"],
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
  sheet: XLSX.WorkSheet,
): { number: string; details: IExportCreateDetailPayload[]; header: Partial<HeaderState> }[] => {
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as unknown[][];
  const headerRow = (cells: unknown[]) => cells.map((cell) => normalizeHeaderCell(cell));

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
  const quantityColumn = columnIndex(HEADER_ALIASES.quantity);
  const unitPriceColumn = columnIndex(HEADER_ALIASES.unit_price);
  const declarationColumn = columnIndex(HEADER_ALIASES.export_declaration_number);
  const billColumn = columnIndex(HEADER_ALIASES.bill_number);
  const importerColumn = columnIndex(HEADER_ALIASES.importer);
  const shippingColumn = columnIndex(HEADER_ALIASES.shipping_term);
  const typeDeclarationColumn = columnIndex(HEADER_ALIASES.type_declaration);
  const typeInventoryColumn = columnIndex(HEADER_ALIASES.type_inventory);
  const usdColumn = columnIndex(HEADER_ALIASES.usd_exchange_rate);
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
      product_name: readValue(row, productNameColumn >= 0 ? productNameColumn : productColumn),
      origin_country_name: undefined,
      unit_name: readValue(row, unitColumn),
      quantity: normalizeNumber(row, quantityColumn),
      unit_price: normalizeNumber(row, unitPriceColumn),
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

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (header: HeaderState, details: IExportCreateDetailPayload[]) => void;
  title?: string;
  loading?: boolean;
}

export default function ExportDeclarationCreateModal({
  open,
  onClose,
  onSubmit,
  title = "Tạo tờ khai xuất",
  loading = false,
}: Props) {
  const [headerData, setHeaderData] = useState<HeaderState>(defaultHeader);
  const [details, setDetails] = useState<IExportCreateDetailPayload[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // const [availableDeclarations, setAvailableDeclarations] = useState<string[]>([]);

  const handleHeaderChange = (field: keyof HeaderState, value: string) => {
    setHeaderData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;
      const workbook = XLSX.read(new Uint8Array(data as ArrayBuffer), { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet) return;
      const batches = extractDetailsFromSheet(sheet);
      if (!batches.length) return;
      const matchedBatch = batches[0];
      setDetails(matchedBatch.details);
    };

    reader.readAsArrayBuffer(file);
    event.target.value = "";
  };

  const handleSubmit = () => {
    if (!headerData.export_declaration_number || !details.length) return;
    onSubmit(headerData, details);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle className="primary-dialog-title">{title}</DialogTitle>
      <DialogContent className="primary-dialog-content">
        <Grid container spacing={2} className="myprofile-form">
          <Grid className="myprofile-form__group" xs={6}>
            <LabelPrimary value="Số tờ khai" required />
            <TextField
              fullWidth
              value={headerData.export_declaration_number}
              onChange={(event) => handleHeaderChange("export_declaration_number", event.target.value)}
              className="primary-text__field"
            />
          </Grid>
          <Grid item xs={6}>
            <LabelPrimary value="Bill/ Số hóa đơn" />
            <TextField
              fullWidth
              value={headerData.bill_number}
              onChange={(event) => handleHeaderChange("bill_number", event.target.value)}
              className="primary-text__field"
            />
          </Grid>
          <Grid item xs={6}>
            <LabelPrimary value="Ngày khai" />
            <TextField
              type="date"
              fullWidth
              InputLabelProps={{ shrink: Boolean(headerData.licence_date) }}
              value={headerData.licence_date}
              onChange={(event) => handleHeaderChange("licence_date", event.target.value)}
              className="primary-text__field"
            />
          </Grid>
          <Grid item xs={6}>
            <LabelPrimary value="Người khai" />
            <TextField
              fullWidth
              value={headerData.importer}
              onChange={(event) => handleHeaderChange("importer", event.target.value)}
              className="primary-text__field"
            />
          </Grid>
          <Grid item xs={6}>
            <LabelPrimary value="Điều kiện vận chuyển" />
            <TextField
              fullWidth
              value={headerData.shipping_term}
              onChange={(event) => handleHeaderChange("shipping_term", event.target.value)}
              className="primary-text__field"
            />
          </Grid>
          <Grid item xs={6}>
            <LabelPrimary value="Mã loại hình" required />
            <TextField
              fullWidth
              value={headerData.type_declaration}
              onChange={(event) => handleHeaderChange("type_declaration", event.target.value)}
              className="primary-text__field"
            />
          </Grid>
          <Grid item xs={6}>
            <LabelPrimary value="Loại tồn" required />
            <TextField
              fullWidth
              value={headerData.type_inventory}
              onChange={(event) => handleHeaderChange("type_inventory", event.target.value)}
              className="primary-text__field"
            />
          </Grid>
          <Grid item xs={6}>
            <LabelPrimary value="Tỷ giá USD" />
            <TextField
              fullWidth
              value={headerData.usd_exchange_rate}
              onChange={(event) => handleHeaderChange("usd_exchange_rate", event.target.value)}
              className="primary-text__field"
            />
          </Grid>
        </Grid>

        <div className="export-form-details-header">
          <span>Danh sách sản phẩm</span>
          <MuiButton
            variant="outlined"
            onClick={handleImportClick}
          >
            Import sản phẩm
          </MuiButton>
        </div>

        <TableContainer>
          <Table size="small">
            <TableHead className="primary-thead">
              <TableRow>
                <TableCell>HS</TableCell>
                <TableCell>Mã hàng</TableCell>
                <TableCell>Tên hàng</TableCell>
                <TableCell>Đơn vị</TableCell>
                <TableCell>SL</TableCell>
                <TableCell>Đơn giá</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {details.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Chưa có sản phẩm nào
                  </TableCell>
                </TableRow>
              ) : (
                details.map((detail, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{detail.hs_code}</TableCell>
                    <TableCell>{detail.product_code}</TableCell>
                    <TableCell>{detail.product_name}</TableCell>
                    <TableCell>{detail.unit_name}</TableCell>
                    <TableCell>{detail.quantity}</TableCell>
                    <TableCell>{detail.unit_price}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <input
          type="file"
          accept=".xls,.xlsx"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </DialogContent>
      <DialogActions className="primary-dialog-actions export-detail-actions">
        <MuiButton onClick={onClose} disabled={loading}>
          Hủy
        </MuiButton>
        <MuiButton variant="contained" onClick={handleSubmit} disabled={loading || !details.length}>
          {loading ? "Đang lưu..." : "Lưu tờ khai"}
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
}
