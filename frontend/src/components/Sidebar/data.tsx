import { productsURL, FiscalImportDeclarationsURL, FiscalExportDeclarationsURL } from "../../routes/urls";
import type { SidebarData } from "./types";
import { FiBox, FiGrid, FiFileText, FiHome } from "react-icons/fi";

export const sidebarData: SidebarData = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <FiHome />,
    path: "/",
  },
  {
    id: "data-sea-management",
    label: "Quản lý dữ liệu hải quan",
    icon: <FiBox />,
    children: [
      {
        id: "nv",
        label: "Danh mục nguyên vật liệu",
        path: "/test",
        icon: <FiGrid />,
      },
      {
        id: "sp-1",
        label: "Danh mục sản phẩm",
        path: productsURL,
        icon: <FiFileText />,
      },
      {
        id: "hoadon-import",
        label: "Quản lý tờ khai nhập",
        path: "/invoice",
        icon: <FiFileText />,
      },
      {
        id: "hoadon-export",
        label: "Quản lý tờ khai xuất",
        path: "/invoice",
        icon: <FiFileText />,
      },
    ],
  },
  {
    id: "warehouse-and-accounting-data",
    label: "Dữ liệu Kho và Kế toán",
    icon: <FiBox />,
    children: [
      {
        id: "nv-warehouse",
        label: "Danh mục nguyên vật liệu",
        path: "/nv",
        icon: <FiGrid />,
      },
      {
        id: "sp-warehouse",
        label: "Danh mục sản phẩm",
        path: "/product",
        icon: <FiFileText />,
      },
      {
        id: "hoadon-vat",
        label: "Quản lý hóa đơn điện tử (VAT)",
        path: "/invoice",
        icon: <FiFileText />,
      },
      {
        id: "semi-product",
        label: "Danh mục bán thành phẩm",
        path: "/product",
        icon: <FiFileText />,
      },
      {
        id: "purchase-book",
        label: "Quản lý sổ mua hàng",
        path: "/invoice",
        icon: <FiFileText />,
      },
      {
        id: "sales-book",
        label: "Quản lý sổ bán hàng",
        path: "/invoice",
        icon: <FiFileText />,
      },
      {
        id: "closing-material",
        label: "Quản lý chốt tồn kho nguyên vật liệu",
        path: "/invoice",
        icon: <FiFileText />,
      },
      {
        id: "closing-semi-product",
        label: "Quản lý chốt tồn kho bán thành phẩm",
        path: "/invoice",
        icon: <FiFileText />,
      },
      {
        id: "closing-product",
        label: "Quản lý chốt tồn kho sản phẩm",
        path: "/invoice",
        icon: <FiFileText />,
      },
    ],
  },
  {
    id: "standard-management",
    label: "Quản lý định mức",
    icon: <FiBox />,
    children: [
      {
        id: "norm",
        label: "Danh mục định mức",
        path: "/nv",
        icon: <FiGrid />,
      },
      {
        id: "norm-product",
        label: "Định mức sản phẩm",
        path: "/product",
        icon: <FiFileText />,
      },
      {
        id: "norm-semi-product",
        label: "Định mức bán thành phẩm",
        path: "/invoice",
        icon: <FiFileText />,
      },
    ],
  },
  {
    id: "data-conversion",
    label: "Chuyển đổi dữ liệu",
    icon: <FiBox />,
    children: [
      {
        id: "units",
        label: "Quản lý đơn vị",
        path: "/units",
        icon: <FiGrid />,
      },
      {
        id: "convert-material",
        label: "Chuyển đổi mã NVL(Nội bộ - Hải quan)",
        path: "/data-conversion/material",
        icon: <FiGrid />,
      },
      {
        id: "convert-product",
        label: "Chuyển đổi mã SP(Nội bộ - Hải quan)",
        path: "/data-conversion/product",
        icon: <FiFileText />,
      },
      {
        id: "unit-conversion",
        label: "Bảng quy đổi đơn vị tính",
        path: "/data-conversion/uom",
        icon: <FiFileText />,
      },
    ],
  },
  {
    id: "apply-data",
    label: "Áp dữ liệu vào năm tài chính",
    icon: <FiFileText />,
    children: [
      {
        id: "apply-import",
        label: "Áp dữ liệu tờ khai nhập",
        path: FiscalImportDeclarationsURL, 
        icon: <FiFileText />,
      },

      {
        id: "apply-export",
        label: "Áp dữ liệu tờ khai xuất",
        path: FiscalExportDeclarationsURL,
        icon: <FiFileText />,
      },
      {
        id: "apply-vat",
        label: "Áp dữ liệu hóa đơn VAT",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "apply-purchase",
        label: "Áp dữ liệu sổ mua hàng",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "apply-sales",
        label: "Áp dữ liệu sổ bán hàng",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "apply-product-norm",
        label: "Áp định mức sản phẩm",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "inventory-material",
        label: "Tổng hợp tồn kho nvl/sổ kế toán 152",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "inventory-product",
        label: "Tổng hợp tồn kho sp/sổ kế toán 155",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "inventory-from-semi-product",
        label: "Tổng hợp tồn nvl từ bán thành phẩm",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
    ],
  },
  {
    id: "factors-affecting-existence",
    label: "Các yếu tố ảnh hưởng tồn",
    icon: <FiFileText />,
    children: [
      {
        id: "user",
        label: "Quản lý nguyên vật liệu tiêu hủy ngoài định mức",
        path: "/settings/users",
        icon: <FiFileText />,
      },
      {
        id: "material-temp-export",
        label: "Quản lý nguyên vật liệu tạm xuất",
        path: "/test",
        icon: <FiFileText />,
      },
      {
        id: "material-reexport",
        label: "Quản lý nguyên vật liệu tái xuất",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "material-reimport",
        label: "Quản lý nguyên vật liệu tái nhập",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "material-dispose",
        label: "Quản lý nguyên vật liệu CĐMĐSD, thiêu thụ nội địa, thanh lý",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "product-temp-import",
        label: "Quản lý sản phẩm tạm nhập",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "product-reimport",
        label: "Quản lý sản phẩm tái nhập",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "product-reexport",
        label: "Quản lý sản phẩm tái xuất",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "product-dispose",
        label: "Quản lý sản phẩm CĐMĐSD, thiêu thụ nội địa, thanh lý",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "product-destroy",
        label: "Quản lý sản phẩm tiêu hủy ngoài định mức",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
    ],
  },
  {
    id: "prepare-settlement-report",
    label: "Lập báo cáo quyết toán",
    icon: <FiFileText />,
    children: [
      {
        id: "user",
        label: "Báo cáo quyết toán tồn nguyên vật liệu",
        path: "/settings/users",
        icon: <FiFileText />,
      },
      {
        id: "inventory-report-product",
        label: "Báo cáo quyết toán tồn sản phẩm",
        path: "/test",
        icon: <FiFileText />,
      },
      {
        id: "inventory-report-summary",
        label: "Tổng hợp tồn nguyên vật liệu",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
    ],
  },
  {
    id: "manage-catalog",
    label: "Quản lý danh mục",
    icon: <FiFileText />,
    children: [
      {
        id: "user",
        label: "Quản lý hợp đồng gia công",
        path: "/settings/users",
        icon: <FiFileText />,
      },
      {
        id: "roles",
        label: "Quản lý danh mục sản phẩm",
        path: "/test",
        icon: <FiFileText />,
      },
    ],
  },
];
