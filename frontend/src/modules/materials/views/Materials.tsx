import {
  Container,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { useState } from "react";
import { FiEdit } from "react-icons/fi";
import { PiTrashSimpleFill } from "react-icons/pi";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import Button from "../../../components/Button/Button";
import PrimaryPagination from "../../../components/Pagination/Pagination";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import { STATUS_DISPLAY } from "../../../utils/statusDisplay";
import { STATUS } from "../../../constants/status";
import { exportExcel } from "../../../utils/exportExcel";
import MaterialFormModal from "../components/MaterialFormModal";
import { useGetMaterials } from "../apis/getMaterials";
import { useMaterialHandlers } from "../services/materialServices";
import type { IMaterialResponse } from "../types";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import "./materials.css";

export function Materials() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] =
    useState<IMaterialResponse | null>(null);
  const { showSnackbar } = useSnackbar();
  const params = {
    limit: rowsPerPage,
    skip: (page - 1) * rowsPerPage,
    ...(search && { search }),
  };

  const { data: materials } = useGetMaterials(params);

  const handleOpenAdd = () => {
    setSelectedMaterial(null);
    setOpenModal(true);
  };

  const handleOpenEdit = (material: IMaterialResponse) => {
    setSelectedMaterial(material);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setSelectedMaterial(null);
    setOpenModal(false);
  };

  const { handleSubmitMaterial, handleDeleteMaterial, isSubmitting } =
    useMaterialHandlers({
      selectedMaterial,
      onClose: handleCloseModal,
      showSnackbar,
    });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleExportTemplate = () => {
    const headers = {
      material_code: "Mã nguyên vật liệu",
      material_name: "Tên nguyên vật liệu",
      unit_name: "Đơn vị tính",
      description: "Mô tả",
      status: "Trạng thái",
    };

    const templateRow = {
      material_code: "",
      material_name: "",
      unit_name: "",
      description: "",
      status: STATUS.ACTIVE,
    };

    exportExcel([templateRow], "materials_template", {
      sheetName: "Template",
      headers,
      title: "DANH MỤC NGUYÊN VẬT LIỆU",
      includeIndexColumn: true,
    });
  };

  return (
    <Container maxWidth={false} className="primary-container">
      <div className="material-header page-header">
        <div className="material-title">
          <p className="material-title__label">
            DANH MỤC NGUYÊN VẬT LIỆU KHO/KẾ TOÁN
          </p>
        </div>
        <div className="material-actions">
          <SearchEngine
            placeholder="Tên nguyên vật liệu, mã..."
            onSearch={handleSearch}
          />
          <div className="material-actions__buttons">
            <Button
              className="material-action-btn"
              onClick={handleExportTemplate}
            >
              Mẫu nhập danh mục NVL
            </Button>
            <Button
              className="material-action-btn"
              variant="outlined"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={() =>
                showSnackbar({
                  message: "Chức năng import đang được phát triển",
                  severity: "info",
                })
              }
            >
              Import danh mục NVL
            </Button>
            <Button className="material-action-btn" onClick={handleOpenAdd}>
              Thêm mới
            </Button>
          </div>
        </div>
      </div>

      <TableContainer className="primary-table-container">
        <Table stickyHeader aria-label="materials table">
          <TableHead className="primary-thead">
            <TableRow>
              <TableCell className="primary-tcell" align="center">
                STT
              </TableCell>
              <TableCell className="primary-tcell" align="center">
                Mã nguyên vật liệu
              </TableCell>
              <TableCell className="primary-tcell" align="center">
                Tên nguyên vật liệu
              </TableCell>
              <TableCell className="primary-tcell" align="center">
                Đơn vị tính
              </TableCell>
              <TableCell className="primary-tcell" align="center">
                Quốc gia
              </TableCell>
              <TableCell className="primary-tcell" align="center">
                Trạng thái
              </TableCell>
              <TableCell className="primary-tcell" align="center"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="primary-tbody">
            {materials?.data?.map((material, index) => {
              const serial = (page - 1) * rowsPerPage + index + 1;
              const statusKey = material.status?.toLowerCase?.() ?? "";
              const badgeClass = STATUS_DISPLAY[statusKey]
                ? `status-${statusKey}`
                : "status-unknown";
              if (materials.data.length === 0) {
                return (
                  <TableRow key="no-data">
                    <TableCell
                      className="custom-border-tcell primary-tcell"
                      align="center"
                      colSpan={6}
                    >
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                );
              }

              return (
                <TableRow className="primary-trow" key={material.id ?? index}>
                  <TableCell
                    className="custom-border-tcell primary-tcell"
                    align="center"
                  >
                    {serial}
                  </TableCell>
                  <TableCell className="custom-border-tcell primary-tcell">
                    {material.material_code}
                  </TableCell>
                    <Tooltip title={material.material_name || ""} arrow placement="top">
                        <TableCell className="custom-border-tcell primary-tcell tcell-lg">
                            {material.material_name}
                        </TableCell>
                    </Tooltip>  
                  <TableCell className="custom-border-tcell primary-tcell">
                    {material.unit_name}
                  </TableCell>
                  <TableCell className="custom-border-tcell primary-tcell">
                    {material.country_name}
                  </TableCell>
                  <TableCell
                    className="custom-border-tcell primary-tcell"
                    align="center"
                    width={150}
                  >
                    <span className={`status-badge ${badgeClass}`}>
                      {STATUS_DISPLAY[statusKey] ??
                        material.status ??
                        "Unknown"}
                    </span>
                  </TableCell>

                  <TableCell
                    className="custom-border-tcell primary-tcell"
                    align="center"
                    width={100}
                  >
                    <IconButton
                      className="primary-edit-btn"
                      size="small"
                      onClick={() => handleOpenEdit(material)}
                    >
                      <FiEdit />
                    </IconButton>
                    <IconButton
                      className="primary-delete-btn"
                      size="small"
                      onClick={() => handleDeleteMaterial(material)}
                    >
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
        totalItems={materials?.total || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(value) => setPage(value)}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setPage(1);
        }}
      />

      <MaterialFormModal
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitMaterial}
        initialData={selectedMaterial || undefined}
        mode={selectedMaterial ? "edit" : "add"}
        isSubmitting={isSubmitting}
      />
    </Container>
  );
}
