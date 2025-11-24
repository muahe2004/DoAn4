import * as React from "react";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import type { SelectChangeEvent } from "@mui/material/Select";

import "./Pagination.css";

interface PrimaryPaginationProps {
    totalItems: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rows: number) => void;
}

export default function PrimaryPagination({
    totalItems,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
}: PrimaryPaginationProps) {
    const totalPages = Math.ceil(totalItems / rowsPerPage);

    const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
        onPageChange(value);
    };

    const handleChangeRowsPerPage = (event: SelectChangeEvent<number>) => {
        const newValue = Number(event.target.value);
        onRowsPerPageChange(newValue);
    };

    return (
        <div className="primary-pagination">
            <Stack direction="row" spacing={2} alignItems="center">
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handleChangePage}
                    variant="outlined"
                />

                <span id="rows-per-page-label">Items / trang</span>

                <FormControl className="pagination-unicore__select">
                <Select<number>
                    labelId="rows-per-page-label"
                    value={rowsPerPage}
                    onChange={handleChangeRowsPerPage}
                >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                </Select>
                </FormControl>
            </Stack>
        </div>
    );
}