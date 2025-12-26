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
import { type ChangeEvent, useRef, useState } from "react";
import { useGetProducts } from "../apis/getProducts";
import { FiEdit } from "react-icons/fi";
import { PiTrashSimpleFill } from "react-icons/pi";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import PrimaryPagination from "../../../components/Pagination/Pagination";
import type { IProduct, IProductResponse } from "../types";
import ProductFormModel from "../components/ProductFormModel";
import Button from "../../../components/Button/Button";
import "./products.css";
import { useCreateProduct } from "../apis/addProduct";
import { useEditProduct } from "../apis/editProduct";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import * as XLSX from "xlsx";
import { STATUS } from "../../../constants/status";
import { STATUS_DISPLAY } from "../../../utils/statusDisplay";
import { useCreateProductMulti } from "../apis/addProductMulti";
import { exportExcel } from "../../../utils/exportExcel";

type ImportedProduct = Omit<IProductResponse, "unit_id" | "unit_id_2" | "norm_id"> & {
    unit_id: string | null;
    unit_id_2: string | null;
    norm_id: string | null;
};

export function Products() {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [selectedProduct, setSelectedProduct] = useState<IProductResponse | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const { showSnackbar } = useSnackbar();
    const { mutateAsync: createProduct } = useCreateProduct({});
    const { mutateAsync: editProduct } = useEditProduct({});
    const { mutateAsync: createProductMulti } = useCreateProductMulti({});

    const Params = {
        limit: rowsPerPage,
        skip: (page - 1) * rowsPerPage,
        ...(search && { search }),
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

    const normalizeProductPayload = (data: IProductResponse): IProduct => {
        const fixId = (v: string | null) => (v === "" ? null : v);

        const {
            id,
            product_code,
            product_name,
            description,
            is_semi_product,
            status,
            unit_id,
            unit_id_2,
            norm_id,
            unit_name,
            unit_name_2,
            norm_name,
        } = data;

        return {
            id,
            product_code,
            product_name,
            description,
            is_semi_product,
            status,
            unit_id: fixId(unit_id as string | null),
            unit_id_2: fixId(unit_id_2 as string | null),
            norm_id: fixId(norm_id as string | null),
            unit_name,
            unit_name_2,
            norm_name,
        };
    };

    const handleSubmitProduct = async (data: IProductResponse) => {
        const payload = normalizeProductPayload(data);
        console.log(payload);
        try {
            if (selectedProduct) {
                await editProduct({
                    id: data.id!,
                    data: payload,
                });
                showSnackbar({ message: "Cập nhật sản phẩm thành công", severity: "success" });
            } else {
                await createProduct(payload);
                showSnackbar({ message: "Thêm sản phẩm thành công", severity: "success" });
            }
            handleCloseModal();
        } catch (_error) {
            showSnackbar({ message: "Có lỗi xảy ra, vui lòng thử lại", severity: "error" });
        }
    };

    const handleImportProducts = async (data: IProductResponse[]) => {
        const payload = {
            products: data.map(product => ({
                product_code: product.product_code,
                product_name: product.product_name,
                unit_id: product.unit_id,
                unit_name: product.unit_name,
                unit_id_2: product.unit_id_2,
                unit_name_2: product.unit_name_2,
                norm_id: product.norm_id,
                norm_name: product.norm_name,
                description: product.description,
                is_semi_product: product.is_semi_product,
                status: product.status,
            }))
        };

        try {
            await createProductMulti(payload);
            showSnackbar({ message: "Thêm sản phẩm thành công", severity: "success" });
            handleCloseModal();
        } catch (error) {
            showSnackbar({ message: "Có lỗi xảy ra, vui lòng thử lại", severity: "error" });
        }
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    }

    const handleImport = () => {
        fileInputRef.current?.click();
    }

    const handleExport = () => {
        const headers = {
            number: "STT",
            product_code: "Mã sản phẩm",
            product_name: "Tên sản phẩm",
            unit_name: "Đơn vị tính",
            unit_name_2: "Đơn vị tính 2",
            norm_name: "Định mức",
            description: "Mô tả",
        };

        const templateRow = {
            number: "",
            product_code: "",
            product_name: "",
            unit_name: "",
            unit_name_2: "",
            norm_name: "",
            description: "",
        };

        exportExcel([templateRow], "products_template", {
            sheetName: "Template",
            headers,
            title: "DANH MỤC SẢN PHẨM",
        });
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (evt) => {
            const data = evt.target?.result;
            if (!data) return;

            const workbook = XLSX.read(new Uint8Array(data as ArrayBuffer), { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
                header: 1,
                range: 2,
                defval: "",
            });

            const mapped: ImportedProduct[] = rows
                .filter((row) => row.some((cell) => `${cell}`.trim() !== ""))
                .map((row) => {
                    const [
                        product_code_raw = "",
                        product_name_raw = "",
                        unit_name = "",
                        unit_name_2 = "",
                        norm_name = "",
                        description_raw = "",
                        is_semi_product_raw = false,
                        status_raw = STATUS.ACTIVE,
                    ] = row;

                    const is_semi_product =
                        typeof is_semi_product_raw === "string"
                            ? is_semi_product_raw.toLowerCase() === "true"
                            : Boolean(is_semi_product_raw);

                    const product_code = `${product_code_raw}`.trim();
                    const product_name = `${product_name_raw}`.trim();
                    const description = `${description_raw}`.trim();
                    const status = `${status_raw}`.trim() || STATUS.ACTIVE;

                    return {
                        product_code,
                        product_name,
                        unit_id: null,
                        unit_name,
                        unit_id_2: null,
                        unit_name_2,
                        norm_id: null,
                        norm_name,
                        description,
                        is_semi_product,
                        status,
                    };
                });

            handleImportProducts(mapped);
        };

        reader.readAsArrayBuffer(file);
        event.target.value = "";
    };


    return (
        <Container maxWidth={false} className="primary-container">
            <div className="product-header">
                <div className="product-title">
                    <p className="product-title__label">DANH MỤC SẢN PHẨM</p>
                </div>
                <div className="product-actions">
                    <SearchEngine placeholder="Tên sản phẩm, mã..." onSearch={handleSearch} />
                    <div className="product-actions__buttons">
                        <Button className="product-action-btn" onClick={handleExport}>
                            Xuất mẫu excel
                        </Button>
                        <Button className="product-action-btn" onClick={handleImport}>
                            Tải lên
                        </Button>
                        <Button className="product-action-btn" onClick={handleOpenAdd}>
                            Thêm mới
                        </Button>
                    </div>
                </div>
            </div>
            <input
                type="file"
                accept=".xlsx,.xls,.xlsm,.xlsb"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
            />

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

                    <TableBody  className="primary-tbody">
                        {products?.data.map((prod) => {
                            const statusKey = prod.status?.toLowerCase?.() ?? "";
                            const badgeClass = STATUS_DISPLAY[statusKey] ? `status-${statusKey}` : "status-unknown";

                            return (
                                <TableRow className="primary-trow" key={prod.id}>
                                    <TableCell className="custom-border-tcell primary-tcell">{prod.product_code}</TableCell>
                                    <TableCell className="custom-border-tcell primary-tcell">{prod.product_name}</TableCell>
                                    <TableCell className="custom-border-tcell primary-tcell">{prod.unit_name}</TableCell>
                                    <TableCell className="custom-border-tcell primary-tcell">{prod.unit_name_2}</TableCell>
                                    <TableCell className="custom-border-tcell primary-tcell">{prod.norm_name}</TableCell>
                                    <TableCell align="center" className="custom-border-tcell primary-tcell">
                                        <span className={`status-badge ${badgeClass}`}>
                                            {STATUS_DISPLAY[statusKey] ?? prod.status ?? "Unknown"}
                                        </span>
                                    </TableCell>
                                    <TableCell align="center" className="custom-border-tcell primary-tcell"  width={150}>
                                        <IconButton className="primary-edit-btn" size="small" onClick={() => handleOpenEdit(prod)}>
                                            <FiEdit />
                                        </IconButton>
                                        <IconButton className="primary-delete-btn" size="small" onClick={() => console.log("Delete clicked")}>
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
