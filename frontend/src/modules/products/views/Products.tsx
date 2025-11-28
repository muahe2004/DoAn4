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
import type { IProductResponse } from "../types";
import ProductFormModel from "../components/ProductFormModel";
import Button from "../../../components/Button/Button";
import "./products.css";

export function Products() {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [selectedProduct, setSelectedProduct] = useState<IProductResponse | null>(null);
    const [openModal, setOpenModal] = useState(false);

    const Params = {
        limit: rowsPerPage,
        skip: (page - 1) * rowsPerPage,
    };

    const {
        data: products,
        isLoading: isLoadingproducts,
        error: errorproducts,
    } = useGetProducts(Params);

    const handlePageChange = (page: number) => {
        setPage(page);
    };

    const handleItemsPerPageChange = (value: number) => {
        setRowsPerPage(value);
        setPage(1);
    };

    const handleOpenEdit = (prod: IProductResponse) => {
        setSelectedProduct(prod);
        setOpenModal(true);

        console.log(prod);
    }

    const handleOpenAdd = () => {
        setSelectedProduct(null);
        setOpenModal(true);
    }

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedProduct(null);
    }

    const handleSubmitProduct = () => {
        console.log("Updated product:");
    }

    return (
        <Container maxWidth={false} className="primary-container">
            <div className="product-actions">
                <Button onClick={handleOpenAdd}>thêm mới</Button>
            </div>

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
                                <IconButton className="primary-edit-btn" size="small" onClick={() => handleOpenEdit(prod)}>
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

            <ProductFormModel
                open={openModal}
                onClose={handleCloseModal}
                onSubmit={handleSubmitProduct}
                initialData={selectedProduct ? {
                    id: selectedProduct.id,
                    product_code: selectedProduct.product_code,
                    product_name: selectedProduct.product_name,
                    unit_id: selectedProduct.unit_id,
                    unit_id_2: selectedProduct.unit_id_2,
                    norm_id: selectedProduct.norm_id,
                    description: selectedProduct.description || '',
                    is_semi_product: selectedProduct.is_semi_product,
                    status: selectedProduct.status,
                    unit_name: selectedProduct.unit_name,
                    unit_name_2: selectedProduct.unit_name_2,
                    norm_name: selectedProduct.norm_name,
                    created_at: selectedProduct.created_at,
                    updated_at: selectedProduct.updated_at,
                } : undefined}
                mode={selectedProduct ? 'edit' : 'add'}
            />

        </Container>
    );
}
