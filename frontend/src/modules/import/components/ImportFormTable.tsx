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
import AutocompletePrimary from "../../../components/Autocomplete/AutoComplete";

export type ImportMaterialRow = {
    id: string;
    material_code: string;
    material_name: string;
    unit_id: string;
    unit_name: string;
    unit_id_2: string;
    unit_name_2: string;
    quantity: string;
    quantity2: string;
    unit_price: string;
    country_id: string;
    country_name: string;
    country_code: string;
    description: string;
};

interface ImportFormTableProps {
    rows: ImportMaterialRow[];
    unitOptions: { id: string; unit_name: string }[];
    countryOptions: { id: string; country_name: string }[];
    onUpdateRow: (id: string, updates: Partial<ImportMaterialRow>) => void;
    onRemoveRow: (id: string) => void;
}

export default function ImportFormTable({
    rows,
    unitOptions,
    countryOptions,
    onUpdateRow,
    onRemoveRow,
}: ImportFormTableProps) {
    const colSx = {
        hs: { minWidth: 110 },
        name: { minWidth: 180 },
        unit: { minWidth: 130 },
        unit2: { minWidth: 130 },
        qty: { minWidth: 110 },
        qty2: { minWidth: 110 },
        price: { minWidth: 120 },
        country: { minWidth: 150 },
        desc: { minWidth: 200 },
        action: { width: 60 },
    };

    return (
        <TableContainer
            className="primary-table-container"
            sx={{ maxHeight: "45vh" }}
        >
            <Table stickyHeader aria-label="import materials table">
                <TableHead className="primary-thead">
                    <TableRow>
                        <TableCell className="primary-tcell" align="center" sx={colSx.hs}>
                            HS Code
                        </TableCell>
                        <TableCell className="primary-tcell" align="center" sx={colSx.name}>
                            Tên NVL
                        </TableCell>
                        <TableCell className="primary-tcell" align="center" sx={colSx.unit}>
                            ĐVT
                        </TableCell>
                        <TableCell className="primary-tcell" align="center" sx={colSx.unit2}>
                            ĐVT 2
                        </TableCell>
                        <TableCell className="primary-tcell" align="center" sx={colSx.qty}>
                            Số lượng
                        </TableCell>
                        <TableCell className="primary-tcell" align="center" sx={colSx.qty2}>
                            SL 2
                        </TableCell>
                        <TableCell className="primary-tcell" align="center" sx={colSx.price}>
                            Đơn giá
                        </TableCell>
                        <TableCell className="primary-tcell" align="center" sx={colSx.country}>
                            Nước XK
                        </TableCell>
                        <TableCell className="primary-tcell" align="center" sx={colSx.desc}>
                            Mô tả
                        </TableCell>
                        <TableCell className="primary-tcell" align="center" sx={colSx.action}></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody className="primary-tbody">
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
                            <TableCell
                                className="custom-border-tcell primary-tcell"
                                align="center"
                                sx={colSx.hs}
                            >
                                <TextField
                                    value={row.material_code}
                                    onChange={(event) =>
                                        onUpdateRow(row.id, { material_code: event.target.value })
                                    }
                                        size="small"
                                        variant="outlined"
                                        className="primary-text__field"
                                    />
                                </TableCell>
                            <TableCell className="custom-border-tcell primary-tcell" sx={colSx.name}>
                                <TextField
                                    value={row.material_name}
                                    onChange={(event) =>
                                        onUpdateRow(row.id, { material_name: event.target.value })
                                    }
                                        size="small"
                                        variant="outlined"
                                        className="primary-text__field"
                                    />
                                </TableCell>
                            <TableCell
                                className="custom-border-tcell primary-tcell"
                                align="center"
                                sx={colSx.unit}
                            >
                                <AutocompletePrimary
                                        labelKey="unit_name"
                                        valueKey="id"
                                        freeSolo
                                        options={unitOptions}
                                        value={
                                            row.unit_name
                                                ? { id: row.unit_id, unit_name: row.unit_name }
                                                : null
                                        }
                                        inputValue={row.unit_name}
                                        onInputChange={(value) =>
                                            onUpdateRow(row.id, { unit_name: value, unit_id: "" })
                                        }
                                        onChange={(val) =>
                                            onUpdateRow(row.id, {
                                                unit_id: val.id || "",
                                                unit_name: val.unit_name || "",
                                            })
                                        }
                                    />
                                </TableCell>
                            <TableCell
                                className="custom-border-tcell primary-tcell"
                                align="center"
                                sx={colSx.unit2}
                            >
                                <AutocompletePrimary
                                        labelKey="unit_name"
                                        valueKey="id"
                                        freeSolo
                                        options={unitOptions}
                                        value={
                                            row.unit_name_2
                                                ? { id: row.unit_id_2, unit_name: row.unit_name_2 }
                                                : null
                                        }
                                        inputValue={row.unit_name_2}
                                        onInputChange={(value) =>
                                            onUpdateRow(row.id, { unit_name_2: value, unit_id_2: "" })
                                        }
                                        onChange={(val) =>
                                            onUpdateRow(row.id, {
                                                unit_id_2: val.id || "",
                                                unit_name_2: val.unit_name || "",
                                            })
                                        }
                                    />
                                </TableCell>
                            <TableCell
                                className="custom-border-tcell primary-tcell"
                                align="center"
                                sx={colSx.qty}
                            >
                                <TextField
                                    value={row.quantity}
                                    onChange={(event) =>
                                        onUpdateRow(row.id, { quantity: event.target.value })
                                    }
                                        size="small"
                                        variant="outlined"
                                        className="primary-text__field"
                                    />
                                </TableCell>
                            <TableCell
                                className="custom-border-tcell primary-tcell"
                                align="center"
                                sx={colSx.qty2}
                            >
                                <TextField
                                    value={row.quantity2}
                                    onChange={(event) =>
                                        onUpdateRow(row.id, { quantity2: event.target.value })
                                    }
                                        size="small"
                                        variant="outlined"
                                        className="primary-text__field"
                                    />
                                </TableCell>
                            <TableCell
                                className="custom-border-tcell primary-tcell"
                                align="center"
                                sx={colSx.price}
                            >
                                <TextField
                                    value={row.unit_price}
                                    onChange={(event) =>
                                        onUpdateRow(row.id, { unit_price: event.target.value })
                                    }
                                        size="small"
                                        variant="outlined"
                                        className="primary-text__field"
                                    />
                                </TableCell>
                            <TableCell
                                className="custom-border-tcell primary-tcell"
                                align="center"
                                sx={colSx.country}
                            >
                                    <AutocompletePrimary
                                        labelKey="country_name"
                                        valueKey="id"
                                        options={countryOptions}
                                        value={
                                            row.country_name
                                                ? { id: row.country_id, country_name: row.country_name }
                                                : null
                                        }
                                        inputValue={row.country_name}
                                        onInputChange={(value) =>
                                            onUpdateRow(row.id, {
                                                country_name: value,
                                                country_code: value,
                                                country_id: "",
                                            })
                                        }
                                        onChange={(val) =>
                                            onUpdateRow(row.id, {
                                                country_id: val.id || "",
                                                country_name: val.country_name || "",
                                                country_code: "",
                                            })
                                        }
                                    />
                                </TableCell>
                            <TableCell className="custom-border-tcell primary-tcell" sx={colSx.desc}>
                                <TextField
                                    value={row.description}
                                    onChange={(event) =>
                                        onUpdateRow(row.id, { description: event.target.value })
                                    }
                                        size="small"
                                        variant="outlined"
                                        className="primary-text__field"
                                    />
                                </TableCell>
                            <TableCell
                                className="custom-border-tcell primary-tcell"
                                align="center"
                                sx={colSx.action}
                            >
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
