import { Container } from "@mui/material";
import { useCallback, useState } from "react";
import Button from "../../../components/Button/Button";
import PrimaryPagination from "../../../components/Pagination/Pagination";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import ImportDeclarationTable from "../components/ImportDeclarationTable";
import ImportFormModal, {
    type ImportDeclarationFormValues,
} from "../components/ImportFormModal";
import "./products.css";
import { useGetImportDeclarations } from "../apis/getImportDeclarations";
import type { ImportDeclarationResponse } from "../types";
import { useCreateImportDeclaration } from "../apis/addImportDeclaration";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import type { ImportMaterialRow } from "../components/ImportFormTable";

export function ImportDeclarations() {
    const [openModal, setOpenModal] = useState(false);
    const [selectedDeclaration, setSelectedDeclaration] = useState<ImportDeclarationResponse | null>(null);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const { showSnackbar } = useSnackbar();

    const handleOpen = () => setOpenModal(true);
    const handleClose = () => {
        setOpenModal(false);
        setSelectedDeclaration(null);
    };
    const handleEdit = (row: ImportDeclarationResponse) => {
        setSelectedDeclaration(row);
        setOpenModal(true);
    };

    const params = {
        skip: (page - 1) * rowsPerPage,
        limit: rowsPerPage,
        ...(search && { search }),
    };

    const { data: importDeclarations } = useGetImportDeclarations(params);
    const { mutateAsync: createImportDeclaration } = useCreateImportDeclaration({});

    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        setPage(1);
    }, []);

    const handleSubmit = async (
        data: ImportDeclarationFormValues & { materials: ImportMaterialRow[] }
    ) => {
        if (selectedDeclaration) {
            showSnackbar({
                message: "Chưa hỗ trợ cập nhật tờ khai",
                severity: "info",
            });
            return;
        }

        if (!data.bill_number.trim()) {
            showSnackbar({
                message: "Vui lòng nhập số vận đơn",
                severity: "warning",
            });
            return;
        }

        const missingCountry = data.materials.some((row) => !row.country_id);
        if (missingCountry) {
            showSnackbar({
                message: "Vui lòng chọn quốc gia cho tất cả nguyên vật liệu",
                severity: "warning",
            });
            return;
        }

        const missingUnit = data.materials.some(
            (row) => !row.unit_id && !row.unit_name
        );
        if (missingUnit) {
            showSnackbar({
                message: "Vui lòng nhập đơn vị tính cho tất cả nguyên vật liệu",
                severity: "warning",
            });
            return;
        }

        const payload = {
            import_declaration_number: data.import_declaration_number,
            licence_number: data.licence_number || undefined,
            bill_number: data.bill_number || undefined,
            exporter: data.exporter,
            exporter_id: data.exporter_id,
            usd_exchange_rate: data.usd_exchange_rate ? Number(data.usd_exchange_rate) : undefined,
            currency_id: data.currency_id || undefined,
            type_declaration: data.type_declaration,
            type_inventory: data.type_inventory,
            shipping_term: data.shipping_term || undefined,
            shipping_fee: data.shipping_fee ? Number(data.shipping_fee) : undefined,
            status: data.status || undefined,
            materials: data.materials.map((row) => ({
                material_code: row.material_code || undefined,
                material_name: row.material_name || undefined,
                unit_id: row.unit_id || null,
                unit_name: row.unit_name || undefined,
                unit_id_2: row.unit_id_2 || null,
                unit_name_2: row.unit_name_2 || undefined,
                description: row.description || undefined,
                country_id: row.country_id || undefined,
                status: data.status || "active",
                quantity: row.quantity ? Number(row.quantity) : undefined,
                quantity2: row.quantity2 ? Number(row.quantity2) : undefined,
                unit_price: row.unit_price ? Number(row.unit_price) : undefined,
            })),
        };

        try {
            if (!payload.exporter_id) {
                showSnackbar({
                    message: "Vui lòng chọn doanh nghiệp",
                    severity: "warning",
                });
                return;
            }
            await createImportDeclaration(payload);
            showSnackbar({
                message: "Tạo tờ khai nhập khẩu thành công",
                severity: "success",
            });
            handleClose();
        } catch (_error) {
            showSnackbar({
                message: "Có lỗi xảy ra, vui lòng thử lại",
                severity: "error",
            });
        }
    };

    return (
        <Container maxWidth={false} className="primary-container">
            <div className="product-header">
                <div className="product-title">
                    <p className="product-title__label">DANH SÁCH TỜ KHAI NHẬP KHẨU</p>
                </div>
                <div className="product-actions">
                    <SearchEngine placeholder="Số tờ khai..." onSearch={handleSearch} />
                    <div className="product-actions__buttons">
                        <Button className="product-action-btn" onClick={handleOpen}>
                            Tạo tờ khai
                        </Button>
                    </div>
                </div>
            </div>

            <ImportDeclarationTable
                data={importDeclarations?.data || []}
                onEdit={handleEdit}
            />

            <PrimaryPagination
                totalItems={importDeclarations?.total || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={(value) => {
                    setRowsPerPage(value);
                    setPage(1);
                }}
            />

            <ImportFormModal
                open={openModal}
                onClose={handleClose}
                onSubmit={handleSubmit}
                initialData={selectedDeclaration}
                mode={selectedDeclaration ? "edit" : "add"}
            />
        </Container>
    );
}
