import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";

// Tuỳ chọn cho hàm export Excel
type ExportExcelOptions<T extends Record<string, unknown>> = {
    sheetName?: string;                // Tên sheet
    headers?: Partial<Record<keyof T & string, string>>; // Map key -> tiêu đề hiển thị
    title?: string;                    // Tiêu đề lớn (merge toàn bảng)
    sectionLabel?: string;             // Nhãn phụ bên dưới tiêu đề
    includeData?: boolean;             // Có xuất dữ liệu hay không
    includeIndexColumn?: boolean;      // Có thêm cột STT hay không
};

// Hàm export Excel tổng quát
export const exportExcel = <T extends Record<string, unknown>>(
    data: T[],                          // Dữ liệu mảng object
    fileName = "report",               // Tên file
    options: ExportExcelOptions<T> = {},// Tuỳ chọn
) => {
    // Kiểm tra dữ liệu đầu vào
    if (!Array.isArray(data)) return;

    const {
        sheetName = "Sheet1",
        headers,
        title,
        sectionLabel,
        includeData = true,
        includeIndexColumn = false,
    } = options;

    // Lấy danh sách key cột: ưu tiên headers, fallback theo data[0]
    const baseHeaderKeys = headers
        ? Object.keys(headers)
        : data[0]
            ? Object.keys(data[0])
            : [];

    // Không có cột nào thì dừng
    if (baseHeaderKeys.length === 0 && !includeIndexColumn) return;

    // Thêm cột STT nếu được bật
    const headerKeys = includeIndexColumn ? ["__index", ...baseHeaderKeys] : baseHeaderKeys;

    // Tiêu đề hiển thị trên Excel
    const displayHeaders = headerKeys.map((k) => {
        if (k === "__index") return "STT";
        return headers?.[k] ?? k; // Ưu tiên label tiếng Việt
    });

    // Tạo worksheet rỗng
    const worksheet = XLSX.utils.aoa_to_sheet([]);

    // Con trỏ dòng hiện tại
    let rowCursor = 0;
    let titleRowIndex: number | null = null;
    let labelRowIndex: number | null = null;

    // ===== TIÊU ĐỀ LỚN =====
    if (title) {
        titleRowIndex = rowCursor;
        const titleCellRef = XLSX.utils.encode_cell({ r: rowCursor, c: 0 });
        worksheet[titleCellRef] = {
            t: "s",
            v: title,
            s: {
                font: { bold: true, sz: 16, color: { rgb: "1F2937" } },
                alignment: { horizontal: "center", vertical: "center" },
            },
        };
        // Merge tiêu đề ngang toàn bảng
        worksheet["!merges"] = [
            ...(worksheet["!merges"] || []),
            { s: { r: rowCursor, c: 0 }, e: { r: rowCursor, c: headerKeys.length - 1 } },
        ];
        rowCursor += 1;
    }

    // ===== NHÃN PHỤ / GHI CHÚ =====
    if (sectionLabel) {
        labelRowIndex = rowCursor;
        const labelCellRef = XLSX.utils.encode_cell({ r: rowCursor, c: 0 });
        worksheet[labelCellRef] = {
            t: "s",
            v: sectionLabel,
            s: {
                font: { bold: true, sz: 12, color: { rgb: "1F2937" } },
                alignment: { horizontal: "center", vertical: "center" },
            },
        };
        // Merge nhãn phụ
        worksheet["!merges"] = [
            ...(worksheet["!merges"] || []),
            { s: { r: rowCursor, c: 0 }, e: { r: rowCursor, c: headerKeys.length - 1 } },
        ];
        rowCursor += 1;
    }

    // ===== HEADER CỘT =====
    const headerRowIndex = rowCursor;
    XLSX.utils.sheet_add_aoa(worksheet, [displayHeaders], {
        origin: { r: headerRowIndex, c: 0 },
    });

    // Gắn STT vào data nếu cần
    const rowsWithIndex = includeIndexColumn
        ? data.map((row, idx) => ({ __index: idx + 1, ...row }))
        : data;

    // ===== DỮ LIỆU =====
    if (includeData && rowsWithIndex.length > 0) {
        XLSX.utils.sheet_add_json(worksheet, rowsWithIndex, {
            header: headerKeys,
            origin: { r: headerRowIndex + 1, c: 0 },
            skipHeader: true, // Không ghi lại header lần nữa
        });
    }

    // ===== STYLE HEADER =====
    headerKeys.forEach((_, i) => {
        const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: i });
        worksheet[cellRef] = worksheet[cellRef] || { t: "s", v: displayHeaders[i] };
        worksheet[cellRef].s = {
            font: { bold: true, color: { rgb: "1F2937" }, sz: 12 },
            fill: { fgColor: { rgb: "C9D9F2" } },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } },
            },
        };
    });

    // Border dùng chung cho data
    const borders = {
        top: { style: "thin", color: { rgb: "D6D6D6" } },
        bottom: { style: "thin", color: { rgb: "D6D6D6" } },
        left: { style: "thin", color: { rgb: "D6D6D6" } },
        right: { style: "thin", color: { rgb: "D6D6D6" } },
    };

    // Chiều cao các dòng
    const rows: Array<{ hpt?: number }> = [];
    if (titleRowIndex !== null) rows[titleRowIndex] = { hpt: 26 };
    if (labelRowIndex !== null) rows[labelRowIndex] = { hpt: 22 };
    rows[headerRowIndex] = { hpt: 26 };

    // ===== STYLE DATA (ZEBRA ROW) =====
    rowsWithIndex.forEach((_, rowIdx) => {
        const sheetRow = headerRowIndex + 1 + rowIdx;
        const isEven = rowIdx % 2 === 0;
        rows[sheetRow] = { hpt: 22 };

        headerKeys.forEach((_, colIdx) => {
            const cellRef = XLSX.utils.encode_cell({ r: sheetRow, c: colIdx });
            const cell = worksheet[cellRef] || { t: "s", v: "" };
            cell.s = {
                font: { color: { rgb: "1F2937" }, sz: 11 },
                fill: isEven ? { fgColor: { rgb: "F3F6FA" } } : undefined,
                alignment: {
                    horizontal: includeIndexColumn && colIdx === 0 ? "center" : "left",
                    vertical: "center",
                    wrapText: true,
                },
                border: borders,
            };
            worksheet[cellRef] = cell;
        });
    });

    // Gán chiều cao dòng
    worksheet["!rows"] = rows;

    // ===== AUTO WIDTH CỘT =====
    worksheet["!cols"] = headerKeys.map((key, idx) => {
        const headerLength = displayHeaders[idx]?.length ?? key.length;
        const values = includeData ? rowsWithIndex.map((row) => String((row as any)[key] ?? "")) : [];
        const maxLength = Math.max(headerLength, ...values.map((v) => v.length), 6);
        return { wch: Math.min(maxLength + 4, 50) }; // Giới hạn max width
    });

    // ===== TẠO FILE =====
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
    });

    const safeName = fileName?.trim() || "report";
    saveAs(
        new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `${safeName}.xlsx`,
    );
};