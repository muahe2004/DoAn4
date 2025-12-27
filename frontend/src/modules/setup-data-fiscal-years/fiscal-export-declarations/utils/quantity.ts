/**
 * Format số lượng để hiển thị (làm tròn 2 chữ số thập phân)
 */
export const formatQuantity = (quantity: number): string => {
    if (quantity === 0) return "0";
    if (Math.abs(quantity) < 0.01) return quantity.toExponential(2);
    return quantity.toFixed(2);
};

/**
 * Lấy chuỗi trạng thái sai lệch dùng cho chi tiết bảng
 */
export const getVarianceStatus = (variance: number, base: number) => {
    if (variance === 0) {
        return {
            label: "✓ Khớp chính xác",
            color: "#2e7d32",
            bg: "#e8f5e9",
        };
    }

    const percent =
        base !== 0 ? ((Math.abs(variance) / base) * 100).toFixed(1) : "0.0";

    if (variance > 0) {
        return {
            label: `↑ Thừa ${formatQuantity(Math.abs(variance))} (${percent}%)`,
            color: "#1976d2",
            bg: "#e3f2fd",
        };
    }

    return {
        label: `↓ Thiếu ${formatQuantity(Math.abs(variance))} (${percent}%)`,
        color: "#d32f2f",
        bg: "#ffebee",
    };
};
