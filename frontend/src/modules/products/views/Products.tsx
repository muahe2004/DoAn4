import * as React from "react";
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
import { useEffect, useState } from "react";
import { useGetProducts } from "../apis/getProducts";
import { FiEdit } from "react-icons/fi";
import { PiTrashSimpleFill } from "react-icons/pi";
import PrimaryPagination from "../../../components/Pagination/Pagination";

export function Products() {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const rows = [
    {
        id: 1,
        tenSanPham: "Áo thun nam",
        gia: 150000,
        soLuong: 20,
        danhMuc: "Thời trang",
    },
    {
        id: 2,
        tenSanPham: "Điện thoại Samsung",
        gia: 6500000,
        soLuong: 5,
        danhMuc: "Điện tử",
    },
    {
        id: 3,
        tenSanPham: "Giày sneaker nữ",
        gia: 1200000,
        soLuong: 12,
        danhMuc: "Thời trang",
    },
    {
        id: 4,
        tenSanPham: "Laptop Dell Inspiron",
        gia: 15500000,
        soLuong: 7,
        danhMuc: "Điện tử",
    },
    {
        id: 5,
        tenSanPham: "Sách kỹ năng sống",
        gia: 95000,
        soLuong: 42,
        danhMuc: "Sách",
    },
    {
        id: 6,
        tenSanPham: "Bàn phím cơ AKKO",
        gia: 1290000,
        soLuong: 9,
        danhMuc: "Điện tử",
    },
    {
        id: 7,
        tenSanPham: "Tạ tay 10kg",
        gia: 450000,
        soLuong: 15,
        danhMuc: "Thể thao",
    },
    {
        id: 8,
        tenSanPham: "Sữa rửa mặt",
        gia: 175000,
        soLuong: 33,
        danhMuc: "Mỹ phẩm",
    },
    {
        id: 9,
        tenSanPham: "Đồ chơi xếp hình",
        gia: 220000,
        soLuong: 18,
        danhMuc: "Trẻ em",
    },
    {
        id: 10,
        tenSanPham: "Thức ăn cho mèo",
        gia: 89000,
        soLuong: 50,
        danhMuc: "Thú cưng",
    },
    
    ];

    const Params = {
        limit: rowsPerPage,
        skip: (page - 1) * rowsPerPage,
    };

    const {
        data: products,
        isLoading: isLoadingproducts,
        error: errorproducts,
    } = useGetProducts(Params);

    useEffect(() => {
        console.log(products);
    }, [products])


    const handlePageChange = (page: number) => {
        setPage(page);
    };

    const handleItemsPerPageChange = (value: number) => {
        setRowsPerPage(value);
        setPage(1);
    };

    return (
        <Container maxWidth={false} className="primary-container">
            <TableContainer className="primary-table-container">
                <Table stickyHeader aria-label="majors table">
                    <TableHead className="primary-thead">
                        <TableRow>
                            <TableCell className="primary-tcell" align="center">Mã sản phẩm</TableCell>
                            <TableCell className="primary-tcell" align="center">Tên sản phẩm</TableCell>
                            <TableCell className="primary-tcell" align="center">Đơn vị tính</TableCell>
                            <TableCell className="primary-tcell" align="center">Đơn vị tính 2</TableCell>
                            <TableCell className="primary-tcell" align="center">Định mức</TableCell>
                            <TableCell className="primary-tcell" align="center">Trạng thái</TableCell>
                            <TableCell className="primary-tcell" align="center"></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {products?.data.map((prod) => (
                            <TableRow className="primary-trow" key={prod.id}>
                            <TableCell className="custom-border-tcell primary-tcell">{prod.product_code}</TableCell>
                            <TableCell className="custom-border-tcell primary-tcell">{prod.product_name}</TableCell>
                            <TableCell className="custom-border-tcell primary-tcell">{prod.unit_name}</TableCell>
                            <TableCell className="custom-border-tcell primary-tcell">{prod.unit_name_2}</TableCell>
                            <TableCell className="custom-border-tcell primary-tcell">{prod.norm_name}</TableCell>
                            <TableCell align="center" className="custom-border-tcell primary-tcell">{prod.status}</TableCell>
                            <TableCell align="center" className="custom-border-tcell primary-tcell">
                                <IconButton className="primary-edit-btn" size="small" onClick={() => console.log("Edit clicked")}>
                                    <FiEdit />
                                </IconButton>
                                <IconButton className="primary-delete-btn" size="small" onClick={() => console.log("Delete clicked")}>
                                    <PiTrashSimpleFill />
                                </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <PrimaryPagination
                totalItems={products?.total || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleItemsPerPageChange}
            />
        </Container>
    );
}