import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import type { MaterialSettlementRow } from "../types";

interface MaterialSettlementTableProps {
    data: MaterialSettlementRow[];
}

const formatNumber = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value);

export default function MaterialSettlementTable({
    data,
}: MaterialSettlementTableProps) {
    return (
        <TableContainer className="primary-table-container">
            <Table stickyHeader aria-label="material settlement report table">
                <TableHead className="primary-thead">
                    <TableRow>
                        <TableCell className="primary-tcell" align="center">
                            Mã NVL
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                            Tên NVL
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                            ĐVT
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                            Tồn đầu kỳ
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                            Nhập trong kỳ
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                            Xuất trong kỳ
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                            Tồn cuối kỳ
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
                                Chưa có dữ liệu báo cáo.
                            </TableCell>
                        </TableRow>
                    )}
                    {data.map((row) => (
                        <TableRow className="primary-trow" key={row.material_id}>
                            <TableCell
                                className="custom-border-tcell primary-tcell"
                                align="center"
                            >
                                {row.material_code}
                            </TableCell>
                            <TableCell
                                className="custom-border-tcell primary-tcell"
                            >
                                {row.material_name}
                            </TableCell>
                            <TableCell
                                className="custom-border-tcell primary-tcell"
                                align="center"
                            >
                                {row.unit_name || "-"}
                            </TableCell>
                            <TableCell
                                className="custom-border-tcell primary-tcell"
                                align="right"
                            >
                                {formatNumber(row.opening_quantity)}
                            </TableCell>
                            <TableCell
                                className="custom-border-tcell primary-tcell"
                                align="right"
                            >
                                {formatNumber(row.import_quantity)}
                            </TableCell>
                            <TableCell
                                className="custom-border-tcell primary-tcell"
                                align="right"
                            >
                                {formatNumber(row.export_quantity)}
                            </TableCell>
                            <TableCell
                                className="custom-border-tcell primary-tcell"
                                align="right"
                            >
                                {formatNumber(row.closing_quantity)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
