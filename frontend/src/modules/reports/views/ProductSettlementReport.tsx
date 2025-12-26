import { Container } from "@mui/material";
import "./reports.css";

export function ProductSettlementReport() {
    return (
        <Container maxWidth={false} className="primary-container">
            <div className="product-header">
                <div className="product-title">
                    <p className="product-title__label">
                        BÁO CÁO QUYẾT TOÁN TỒN SẢN PHẨM
                    </p>
                    <p className="report-date">Chưa hỗ trợ.</p>
                </div>
            </div>
        </Container>
    );
}
