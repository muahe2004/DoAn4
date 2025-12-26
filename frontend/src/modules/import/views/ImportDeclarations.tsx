import { Container } from "@mui/material";
import { useState } from "react";
import Button from "../../../components/Button/Button";
import ImportDeclarationTable from "../components/ImportDeclarationTable";
import ImportFormModal from "../components/ImportFormModal";
import "./products.css";

export function ImportDeclarations() {
    const [openModal, setOpenModal] = useState(false);

    const handleOpen = () => setOpenModal(true);
    const handleClose = () => setOpenModal(false);

    return (
        <Container maxWidth={false} className="primary-container">
            <div className="product-header">
                <div className="product-title">
                    <p className="product-title__label">TỜ KHAI NHẬP KHẨU</p>
                </div>
                <div className="product-actions">
                    <div className="product-actions__buttons">
                        <Button className="product-action-btn" onClick={handleOpen}>
                            Tạo tờ khai
                        </Button>
                    </div>
                </div>
            </div>

            <ImportDeclarationTable />

            <ImportFormModal open={openModal} onClose={handleClose} />
        </Container>
    );
}
