import {
    Container,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import { useState } from "react";
import { FiEdit } from "react-icons/fi";
import { PiTrashSimpleFill } from "react-icons/pi";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import PrimaryPagination from "../../../components/Pagination/Pagination";
import Button from "../../../components/Button/Button";
import "./products.css";

export function ImportDeclarations() {

    return (
        <>
            <h1>Tờ khai nhập khẩu</h1>
        </>
    );
}