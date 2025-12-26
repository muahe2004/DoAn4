import {
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import { FiEdit } from "react-icons/fi";
import { PiTrashSimpleFill } from "react-icons/pi";
import { STATUS_DISPLAY } from "../../../utils/statusDisplay";
import type { ImportDeclarationResponse } from "../types";

interface ImportDeclarationTableProps {
    data: ImportDeclarationResponse[];
    onEdit?: (row: ImportDeclarationResponse) => void;
    onDelete?: (row: ImportDeclarationResponse) => void;
}

export default function ImportDeclarationTable({
    data,
    onEdit,
    onDelete,
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
                        <TableCell className="primary-tcell" align="center"></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
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
                                    {row.import_declaration_number}
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
                                <TableCell align="center" className="custom-border-tcell primary-tcell">
                                    <IconButton
                                        className="primary-edit-btn"
                                        size="small"
                                        onClick={() => onEdit?.(row)}
                                    >
                                        <FiEdit />
                                    </IconButton>
                                    <IconButton
                                        className="primary-delete-btn"
                                        size="small"
                                        onClick={() => onDelete?.(row)}
                                    >
                                        <PiTrashSimpleFill />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
