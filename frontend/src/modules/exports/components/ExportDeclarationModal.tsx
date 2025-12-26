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
  Button as MuiButton,
  CircularProgress,
  Button,
} from "@mui/material";
import LabelPrimary from "../../../components/Label/Label";
import PrimaryPagination from "../../../components/Pagination/Pagination";
import type {
  IExportCreateDetailPayload,
  IExportDetailView,
} from "../types";
import * as XLSX from "xlsx";
import { parseNumber, normalizeText } from "../utils";
import "./ExportDeclarationModal.css";

type Mode = "create" | "detail";

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
      product_name: readValue(
        row,
        productNameColumn >= 0 ? productNameColumn : productColumn
      ),
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
  const status = data?.header?.status || "draft";
  const [headerData, setHeaderData] = useState<HeaderState>(defaultHeader);
  const [details, setDetails] = useState<IExportCreateDetailPayload[]>([]);
  const [editableDetails, setEditableDetails] = useState<IExportCreateDetailPayload[]>([]);
  const [baseDetails, setBaseDetails] = useState<IExportCreateDetailPayload[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleEditableDetailChange = (
    index: number,
    field: keyof IExportCreateDetailPayload,
    value: string
  ) => {
    setEditableDetails((prev) =>
      prev.map((detail, idx) =>
        idx === index
          ? {
              ...detail,
              [field]:
                field === "quantity"
                  ? value === ""
                    ? undefined
                    : Number(value)
                  : value,
            }
          : detail
      )
    );
  };
  const detailRows = data?.details || [];
  const detailHeader = data?.header;
  const usdExchangeRate = detailHeader?.usd_exchange_rate ?? 0;
  const calculateVndPrice = (value: number) => value * (usdExchangeRate || 0);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const paginatedDetailRows = editableDetails.slice(
    (page - 1) * rowsPerPage,
    (page - 1) * rowsPerPage + rowsPerPage
  );
  const detailHeaderState: HeaderState = {
    export_declaration_number: detailHeader?.export_declaration_number ?? "",
    bill_number: detailHeader?.bill_number ?? "",
    licence_date: detailHeader?.licence_date?.split("T")[0] ?? "",
    importer: detailHeader?.importer ?? "",
    shipping_term: detailHeader?.shipping_term ?? "",
    type_declaration: detailHeader?.type_declaration ?? "",
    type_inventory: detailHeader?.type_inventory ?? "",
    usd_exchange_rate: detailHeader?.usd_exchange_rate?.toString() ?? "",
  };
  useEffect(() => {
    if (!isCreateMode && data?.details) {
      const mappedDetails = data.details.map((detail) => ({
        hs_code: detail.hs_code,
        product_code: detail.product_code,
        product_name: detail.product_name,
        origin_country_name: detail.origin_country_name,
        unit_name: detail.unit_name,
        quantity: detail.quantity,
        unit_price: detail.unit_price,
        status: detail.status ?? "draft",
      }));
      setEditableDetails(mappedDetails);
      setBaseDetails(mappedDetails.map((detail) => ({ ...detail })));
    }
  }, [data?.details, isCreateMode]);

  useEffect(() => {
    if (isCreateMode && open) {
      setHeaderData(defaultHeader);
      setDetails([]);
    }
  }, [isCreateMode, open]);

  useEffect(() => {
    if (!isCreateMode) {
      setPage(1);
    }
  }, [detailRows.length, isCreateMode]);

  const handleHeaderChange = (field: keyof HeaderState, value: string) => {
    if (!isCreateMode) return;
    setHeaderData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImportClick = () => fileInputRef.current?.click();

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
      setDetails(matchedBatch.details);
    };

    reader.readAsArrayBuffer(file);
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleSubmit = () => {
    if (!isCreateMode || !onSubmit) return;
    if (!headerData.export_declaration_number || !details.length) return;
    onSubmit(headerData, details);
  };

  const hasChanges = useMemo(() => {
    if (editableDetails.length !== baseDetails.length) return true;
    return editableDetails.some((detail, idx) => {
      const base = baseDetails[idx];
      return (
        detail.product_code !== base?.product_code ||
        detail.quantity !== base?.quantity
      );
    });
  }, [editableDetails, baseDetails]);

  const handleSave = () => {
    if (isCreateMode || !onSave || !editableDetails.length || !hasChanges) return;
    onSave(detailHeaderState, editableDetails);
  };

  const getHeaderValue = (field: keyof HeaderState) => {
    if (isCreateMode) return headerData[field];
    const value = detailHeader?.[field as keyof typeof detailHeader];
    return value != null ? String(value) : "";
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
        disabled={!isCreateMode}
        className="primary-text__field"
        size="small"
        InputProps={{
          readOnly: !isCreateMode,
        }}
        InputLabelProps={{
          shrink: type === "date" ? true : undefined,
        }}
        onChange={(event) =>
          isCreateMode && handleHeaderChange(field, event.target.value)
        }
      />
    </Grid>
  );

  const createTable =
    details.length === 0 ? null : (
      <TableBody className="primary-tbody">
        {details.map((detail, idx) => (
          <TableRow className="primary-trow" key={`${detail.product_code}-${idx}`}>
            <TableCell className="custom-border-tcell primary-tcell">
              {detail.hs_code}
            </TableCell>
            <TableCell className="custom-border-tcell primary-tcell">
              {detail.product_code}
            </TableCell>
            <TableCell className="custom-border-tcell primary-tcell">
              {detail.product_name}
            </TableCell>
            <TableCell className="custom-border-tcell primary-tcell">
              {detail.unit_name}
            </TableCell>
            <TableCell
              className="custom-border-tcell primary-tcell"
              align="center"
            >
              {detail.quantity}
            </TableCell>
            <TableCell className="custom-border-tcell primary-tcell">
              {detail.unit_price}
            </TableCell>
          </TableRow>
        ))}
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
        </TableRow>
      </TableHead>
      <TableBody className="primary-tbody">
        {paginatedDetailRows.map((detail, idx) => {
          const globalIndex = (page - 1) * rowsPerPage + idx;
          const rowKey =
            detailRows[globalIndex]?.id ?? `detail-${globalIndex}`;
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
                  variant="standard"
                  size="small"
                  InputProps={{ readOnly: true, disableUnderline: true }}
                />
              </TableCell>
              <TableCell className="custom-border-tcell primary-tcell" width={180}>
                <TextField
                  fullWidth
                  value={detail.product_code ?? ""}
                  size="small"
                  onChange={(event) =>
                    handleEditableDetailChange(
                      (page - 1) * rowsPerPage + idx,
                      "product_code",
                      event.target.value
                    )
                  }
                />
              </TableCell>
              <TableCell className="custom-border-tcell primary-tcell" width={250}>
                <TextField
                  fullWidth
                  value={detail.product_name ?? ""}
                  variant="standard"
                  sx={{
                    overflow: "hidden",
                    maxWidth: 250,
                    flexWrap: "wrap"
                  }}
                  size="small"
                  InputProps={{ readOnly: true, disableUnderline: true }}
                />
              </TableCell>
              <TableCell className="custom-border-tcell primary-tcell" width={120}>
                <TextField
                  fullWidth
                  value={detail.unit_name ?? ""}
                  variant="standard"
                  size="small"
                  InputProps={{ readOnly: true, disableUnderline: true }}
                />
              </TableCell>
              <TableCell className="custom-border-tcell primary-tcell" width={100}>
                <TextField
                  fullWidth
                  type="number"
                  value={detail.quantity?.toString() ?? ""}
                  size="small"
                  onChange={(event) =>
                    handleEditableDetailChange(
                      (page - 1) * rowsPerPage + idx,
                      "quantity",
                      event.target.value
                    )
                  }
                />
              </TableCell>
              <TableCell className="custom-border-tcell primary-tcell">
                <TextField
                  fullWidth
                  value={detail.unit_price?.toString() ?? ""}
                  variant="standard"
                  size="small"
                  InputProps={{ readOnly: true, disableUnderline: true }}
                />
              </TableCell>
              <TableCell className="custom-border-tcell primary-tcell">
                <TextField
                  fullWidth
                  value={formatUsd(dgCifUsd)}
                  variant="standard"
                  size="small"
                  InputProps={{ readOnly: true, disableUnderline: true }}
                />
              </TableCell>
              <TableCell className="custom-border-tcell primary-tcell">
                <TextField
                  fullWidth
                  value={formatVnd(dgTinhThueVnd)}
                  variant="standard"
                  size="small"
                  InputProps={{ readOnly: true, disableUnderline: true }}
                />
              </TableCell>
              <TableCell className="custom-border-tcell primary-tcell">
                <TextField
                  fullWidth
                  value={formatUsd(tgCifUsd)}
                  variant="standard"
                  size="small"
                  InputProps={{ readOnly: true, disableUnderline: true }}
                />
              </TableCell>
              <TableCell className="custom-border-tcell primary-tcell">
                <TextField
                  fullWidth
                  value={formatVnd(tgTinhThueVnd)}
                  variant="standard"
                  size="small"
                  InputProps={{ readOnly: true, disableUnderline: true }}
                />
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
              {renderHeaderField({ field: "importer", label: "Người khai" })}
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
              {renderHeaderField({
                field: "usd_exchange_rate",
                label: "Quy đổi tỷ giá (USD->VNĐ)",
              })}
            </Grid>

            <div className="export-form-details-header">
              <span className="create-modal-title__label">
                {isCreateMode ? "DANH SÁCH SẢN PHẨM" : "DANH SÁCH SẢN PHẨM (ĐƠN GIÁ CIF/THUẾ)"}
              </span>
              {isCreateMode && (
                <Button variant="outlined" sx={{ color: "#FFFF"}} onClick={handleImportClick}>
                  Tải lên Excel sản phẩm
                </Button>
              )}
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
                          Đơn vị
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                          Số lượng
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                          Đơn giá
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    {details.length === 0 ? (
                      <TableBody className="primary-tbody">
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            Chưa có sản phẩm nào
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    ) : (
                      createTable
                    )}
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
              disabled={loading || !details.length}
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
              disabled={saving || !editableDetails.length || !hasChanges}
            >
            {saving ? "ĐANG LƯU..." : "LƯU"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
