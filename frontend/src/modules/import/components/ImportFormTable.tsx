import {
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from "@mui/material";
import { PiTrashSimpleFill } from "react-icons/pi";

export type ImportMaterialRow = {
    id: string;
    material_code: string;
    material_name: string;
    unit_name: string;
    unit_name_2: string;
    quantity: string;
    quantity2: string;
    unit_price: string;
    origin_country: string;
    description: string;
};

interface ImportFormTableProps {
    rows: ImportMaterialRow[];
    onChangeRow: (id: string, field: keyof ImportMaterialRow, value: string) => void;
    onRemoveRow: (id: string) => void;
}

export default function ImportFormTable({
    rows,
    onChangeRow,
    onRemoveRow,
}: ImportFormTableProps) {
    return (
        <TableContainer className="primary-table-container">
            <Table stickyHeader aria-label="import materials table">
                <TableHead className="primary-thead">
                    <TableRow>
                        <TableCell className="primary-tcell" align="center">
                            HS Code
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                            Tên NVL
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                            ĐVT
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                            ĐVT 2
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
                            Nước XK
                        </TableCell>
                        <TableCell className="primary-tcell" align="center">
                            Mô tả
                        </TableCell>
                        <TableCell className="primary-tcell" align="center"></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.length === 0 && (
                        <TableRow className="primary-trow">
                            <TableCell
                                className="custom-border-tcell primary-tcell"
                                align="center"
                                colSpan={10}
                            >
                                Chưa có dữ liệu nguyên vật liệu.
                            </TableCell>
                        </TableRow>
                    )}

                    {rows.map((row) => (
                        <TableRow className="primary-trow" key={row.id}>
                            <TableCell className="custom-border-tcell primary-tcell" align="center">
                                <TextField
                                    value={row.material_code}
                                    onChange={(event) =>
                                        onChangeRow(row.id, "material_code", event.target.value)
                                    }
                                    size="small"
                                    variant="outlined"
                                    className="primary-text__field"
                                />
                            </TableCell>
                            <TableCell className="custom-border-tcell primary-tcell">
                                <TextField
                                    value={row.material_name}
                                    onChange={(event) =>
                                        onChangeRow(row.id, "material_name", event.target.value)
                                    }
                                    size="small"
                                    variant="outlined"
                                    className="primary-text__field"
                                />
                            </TableCell>
                            <TableCell className="custom-border-tcell primary-tcell" align="center">
                                <TextField
                                    value={row.unit_name}
                                    onChange={(event) =>
                                        onChangeRow(row.id, "unit_name", event.target.value)
                                    }
                                    size="small"
                                    variant="outlined"
                                    className="primary-text__field"
                                />
                            </TableCell>
                            <TableCell className="custom-border-tcell primary-tcell" align="center">
                                <TextField
                                    value={row.unit_name_2}
                                    onChange={(event) =>
                                        onChangeRow(row.id, "unit_name_2", event.target.value)
                                    }
                                    size="small"
                                    variant="outlined"
                                    className="primary-text__field"
                                />
                            </TableCell>
                            <TableCell className="custom-border-tcell primary-tcell" align="center">
                                <TextField
                                    value={row.quantity}
                                    onChange={(event) =>
                                        onChangeRow(row.id, "quantity", event.target.value)
                                    }
                                    size="small"
                                    variant="outlined"
                                    className="primary-text__field"
                                />
                            </TableCell>
                            <TableCell className="custom-border-tcell primary-tcell" align="center">
                                <TextField
                                    value={row.quantity2}
                                    onChange={(event) =>
                                        onChangeRow(row.id, "quantity2", event.target.value)
                                    }
                                    size="small"
                                    variant="outlined"
                                    className="primary-text__field"
                                />
                            </TableCell>
                            <TableCell className="custom-border-tcell primary-tcell" align="center">
                                <TextField
                                    value={row.unit_price}
                                    onChange={(event) =>
                                        onChangeRow(row.id, "unit_price", event.target.value)
                                    }
                                    size="small"
                                    variant="outlined"
                                    className="primary-text__field"
                                />
                            </TableCell>
                            <TableCell className="custom-border-tcell primary-tcell" align="center">
                                <TextField
                                    value={row.origin_country}
                                    onChange={(event) =>
                                        onChangeRow(row.id, "origin_country", event.target.value)
                                    }
                                    size="small"
                                    variant="outlined"
                                    className="primary-text__field"
                                />
                            </TableCell>
                            <TableCell className="custom-border-tcell primary-tcell">
                                <TextField
                                    value={row.description}
                                    onChange={(event) =>
                                        onChangeRow(row.id, "description", event.target.value)
                                    }
                                    size="small"
                                    variant="outlined"
                                    className="primary-text__field"
                                />
                            </TableCell>
                            <TableCell className="custom-border-tcell primary-tcell" align="center">
                                <IconButton
                                    className="primary-delete-btn"
                                    size="small"
                                    onClick={() => onRemoveRow(row.id)}
                                >
                                    <PiTrashSimpleFill />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
