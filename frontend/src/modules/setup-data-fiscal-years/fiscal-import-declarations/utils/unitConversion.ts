/**
 * Tính số lượng đã quy đổi theo đơn vị chuẩn
 * Sử dụng hệ số quy đổi từ bảng convert_units
 * 
 * @param quantity - Số lượng từ tờ khai (quantity)
 * @param conversionFactor - Hệ số quy đổi từ DB (convert_units.conversion)
 * @returns Số lượng đã quy đổi về đơn vị chuẩn
 */
export const calculateConvertedQuantity = (
  quantity: number | undefined,
  conversionFactor: number | undefined | null
): number => {
  // Nếu không có số lượng
  if (!quantity || quantity === 0) {
    return 0;
  }

  // Nếu không có hệ số quy đổi, giữ nguyên số lượng
  if (!conversionFactor || conversionFactor === 0) {
    return quantity;
  }

  // Tính số lượng đã quy đổi
  return quantity * conversionFactor;
};

/**
 * Format số lượng để hiển thị (làm tròn 2 chữ số thập phân)
 */
export const formatQuantity = (quantity: number): string => {
  if (quantity === 0) return "0";
  if (quantity < 0.01) return quantity.toExponential(2);
  return quantity.toFixed(2);
};
