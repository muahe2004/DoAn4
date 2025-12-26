import { Container } from "@mui/material";
import "./reports.css";

export function MaterialInventorySummary() {
    return (
        <Container maxWidth={false} className="primary-container">
            <div className="product-header">
                <div className="product-title">
                    <p className="product-title__label">
                        TỔNG HỢP TỒN NGUYÊN VẬT LIỆU
                    </p>
                    <p className="report-date">Chưa hỗ trợ.</p>
                </div>
            </div>
        </Container>
    );
}
