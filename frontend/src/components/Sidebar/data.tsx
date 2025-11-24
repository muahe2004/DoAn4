import { productsURL } from "../../routes/urls";
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
        id: "sp",
        label: "Danh mục sản phẩm",
        path: productsURL,
        icon: <FiFileText />,
      },
      {
        id: "hoadon",
        label: "Quản lý tờ khai nhập",
        path: "/invoice",
        icon: <FiFileText />,
      },
      {
        id: "hoadon",
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
        id: "nv",
        label: "Danh mục nguyên vật liệu",
        path: "/nv",
        icon: <FiGrid />,
      },
      {
        id: "sp",
        label: "Danh mục sản phẩm",
        path: "/product",
        icon: <FiFileText />,
      },
      {
        id: "hoadon",
        label: "Quản lý hóa đơn điện tử (VAT)",
        path: "/invoice",
        icon: <FiFileText />,
      },
      {
        id: "sp",
        label: "Danh mục bán thành phẩm",
        path: "/product",
        icon: <FiFileText />,
      },
      {
        id: "hoadon",
        label: "Quản lý sổ mua hàng",
        path: "/invoice",
        icon: <FiFileText />,
      },
      {
        id: "hoadon",
        label: "Quản lý sổ bán hàng",
        path: "/invoice",
        icon: <FiFileText />,
      },
      {
        id: "hoadon",
        label: "Quản lý chốt tồn kho nguyên vật liệu",
        path: "/invoice",
        icon: <FiFileText />,
      },
      {
        id: "hoadon",
        label: "Quản lý chốt tồn kho bán thành phẩm",
        path: "/invoice",
        icon: <FiFileText />,
      },
      {
        id: "hoadon",
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
        id: "nv",
        label: "Danh mục định mức",
        path: "/nv",
        icon: <FiGrid />,
      },
      {
        id: "sp",
        label: "Định mức sản phẩm",
        path: "/product",
        icon: <FiFileText />,
      },
      {
        id: "hoadon",
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
        id: "nv",
        label: "Chuyển đổi mã NVL(Nội bộ - Hải quan)",
        path: "/nv",
        icon: <FiGrid />,
      },
      {
        id: "sp",
        label: "Chuyển đổi mã SP(Nội bộ - Hải quan)",
        path: "/product",
        icon: <FiFileText />,
      },
      {
        id: "hoadon",
        label: "Bảng quy đổi đơn vị tính",
        path: "/invoice",
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
        id: "user",
        label: "Áp dữ liệu tờ khai nhập",
        path: "/settings/users",
        icon: <FiFileText />,
      },
      {
        id: "roles",
        label: "Áp dữ liệu tờ khai xuất",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "roles",
        label: "Áp dữ liệu hóa đơn VAT",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "roles",
        label: "Áp dữ liệu sổ mua hàng",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "roles",
        label: "Áp dữ liệu sổ bán hàng",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "roles",
        label: "Áp định mức sản phẩm",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "roles",
        label: "Tổng hợp tồn kho nvl/sổ kế toán 152",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "roles",
        label: "Tổng hợp tồn kho sp/sổ kế toán 155",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "roles",
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
        id: "roles",
        label: "Quản lý nguyên vật liệu tạm xuất",
        path: "/test",
        icon: <FiFileText />,
      },
      {
        id: "roles",
        label: "Quản lý nguyên vật liệu tái xuất",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "roles",
        label: "Quản lý nguyên vật liệu tái nhập",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "roles",
        label: "Quản lý nguyên vật liệu CĐMĐSD, thiêu thụ nội địa, thanh lý",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "roles",
        label: "Quản lý sản phẩm tạm nhập",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "roles",
        label: "Quản lý sản phẩm tái nhập",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "roles",
        label: "Quản lý sản phẩm tái xuất",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "roles",
        label: "Quản lý sản phẩm CĐMĐSD, thiêu thụ nội địa, thanh lý",
        path: "/settings/roles",
        icon: <FiFileText />,
      },
      {
        id: "roles",
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
        id: "roles",
        label: "Báo cáo quyết toán tồn sản phẩm",
        path: "/test",
        icon: <FiFileText />,
      },
      {
        id: "roles",
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
