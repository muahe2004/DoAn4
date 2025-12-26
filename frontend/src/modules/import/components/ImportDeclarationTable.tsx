import {
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import { useMemo, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { PiTrashSimpleFill } from "react-icons/pi";
import PrimaryPagination from "../../../components/Pagination/Pagination";
import { STATUS_DISPLAY } from "../../../utils/statusDisplay";

export type ImportDeclarationRow = {
    id: string;
    import_declaration_number: string;
    licence_number: string;
    exporter: string;
    type_declaration: string;
    created_at: string;
    status: string;
};

const mockDeclarations: ImportDeclarationRow[] = [
    {
        id: "IM-0001",
        import_declaration_number: "102938472",
        licence_number: "GP-01",
        exporter: "ABC Textile Co.",
        type_declaration: "A11",
        created_at: "2024-12-01",
        status: "active",
    },
    {
        id: "IM-0002",
        import_declaration_number: "102938473",
        licence_number: "GP-02",
        exporter: "Vina Garment",
        type_declaration: "A12",
        created_at: "2024-12-03",
        status: "inactive",
    },
    {
        id: "IM-0003",
        import_declaration_number: "102938474",
        licence_number: "GP-03",
        exporter: "Sunrise Materials",
        type_declaration: "E31",
        created_at: "2024-12-05",
        status: "active",
    },
];

interface ImportDeclarationTableProps {
    data?: ImportDeclarationRow[];
    onEdit?: (row: ImportDeclarationRow) => void;
    onDelete?: (row: ImportDeclarationRow) => void;
}

export default function ImportDeclarationTable({
    data = mockDeclarations,
    onEdit,
    onDelete,
}: ImportDeclarationTableProps) {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const pagedData = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return data.slice(start, start + rowsPerPage);
    }, [data, page, rowsPerPage]);

    return (
        <>
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
                        {pagedData.map((row) => {
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

            <PrimaryPagination
                totalItems={data.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={(value) => {
                    setRowsPerPage(value);
                    setPage(1);
                }}
            />
        </>
    );
}
