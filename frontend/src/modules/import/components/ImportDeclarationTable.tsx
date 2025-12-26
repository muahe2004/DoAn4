import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { STATUS_DISPLAY } from "../../../utils/statusDisplay";
import type { ImportDeclarationResponse } from "../types";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface ImportDeclarationTableProps {
    data: ImportDeclarationResponse[];
    onEdit?: (row: ImportDeclarationResponse) => void;
    onDelete?: (row: ImportDeclarationResponse) => void;
}

export default function ImportDeclarationTable({
    data,
    onEdit,
}: ImportDeclarationTableProps) {
    return (
        <TableContainer className="primary-table-container">
            <Table stickyHeader aria-label="import declarations table">
                <TableHead className="primary-thead">
                    <TableRow>
                        <TableCell className="primary-tcell" align="center">
                            Số tờ khai
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                            Số giấy phép
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                            Doanh nghiệp
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                            Loại tờ khai
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                            Ngày tạo
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                            Trạng thái
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody className="primary-tbody">
                    {data.length === 0 && (
                        <TableRow className="primary-trow">
                            <TableCell
                                className="custom-border-tcell primary-tcell"
                                align="center"
                                colSpan={7}
                            >
                                Chưa có dữ liệu tờ khai.
                            </TableCell>
                        </TableRow>
                    )}

                    {data.map((row) => {
                        const statusKey = row.status?.toLowerCase?.() ?? "";
                        const badgeClass = STATUS_DISPLAY[statusKey]
                            ? `status-${statusKey}`
                            : "status-unknown";

                        return (
                            <TableRow className="primary-trow" key={row.id}>
                                <TableCell className="custom-border-tcell primary-tcell" align="center">
                                    <Typography onClick={() => onEdit?.(row)} sx={{ textDecoration: "underline", color: "#1976d2", cursor: "pointer", display: "flex", alignItems: "center", gap: "2px",}} >
                                        {row.import_declaration_number}
                                        <OpenInNewIcon sx={{ fontSize: 16 }} />
                                    </Typography>
                                </TableCell>
                                <TableCell className="custom-border-tcell primary-tcell" align="center">
                                    {row.licence_number}
                                </TableCell>
                                <TableCell className="custom-border-tcell primary-tcell">
                                    {row.exporter}
                                </TableCell>
                                <TableCell className="custom-border-tcell primary-tcell" align="center">
                                    {row.type_declaration}
                                </TableCell>
                                <TableCell className="custom-border-tcell primary-tcell" align="center">
                                    {row.created_at}
                                </TableCell>
                                <TableCell align="center" className="custom-border-tcell primary-tcell">
                                    <span className={`status-badge ${badgeClass}`}>
                                        {STATUS_DISPLAY[statusKey] ?? row.status ?? "Unknown"}
                                    </span>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
