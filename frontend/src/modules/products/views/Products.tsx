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
import { useGetProducts } from "../apis/getProducts";
import { FiEdit } from "react-icons/fi";
import { PiTrashSimpleFill } from "react-icons/pi";
import PrimaryPagination from "../../../components/Pagination/Pagination";
import type { IProduct, IProductResponse } from "../types";
import ProductFormModel from "../components/ProductFormModel";
import Button from "../../../components/Button/Button";
import "./products.css";
import { useCreateProduct } from "../apis/addProduct";
import { useEditProduct } from "../apis/editProduct";

export function Products() {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [selectedProduct, setSelectedProduct] = useState<IProductResponse | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const { mutateAsync: createProduct } = useCreateProduct({});
    const { mutateAsync: editProduct } = useEditProduct({});

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
    }

    const handleOpenAdd = () => {
        setSelectedProduct(null);
        setOpenModal(true);
    }

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedProduct(null);
    }

    const handleSubmitProduct = (data: IProduct) => {
        const payload: IProduct = {
            product_code: data.product_code,
            product_name: data.product_name,
            unit_id: data.unit_id,
            unit_id_2: data.unit_id_2,
            norm_id: data.norm_id,
            description: data.description,
            is_semi_product: data.is_semi_product,
            status: data.status,
        };

        if (selectedProduct) {
            editProduct({
                id: data.id!,
                data: payload,
            });
        } else {
            createProduct(payload);
        }
    };

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
                initialData={selectedProduct || undefined}
                mode={selectedProduct ? 'edit' : 'add'}
            />
        </Container>
    );
}