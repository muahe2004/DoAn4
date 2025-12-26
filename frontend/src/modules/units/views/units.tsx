import {
  Container,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { type ChangeEvent, useRef, useState } from "react";
import { useGetUnits } from "../apis/getUnits";
import { FiEdit } from "react-icons/fi";
import { PiTrashSimpleFill } from "react-icons/pi";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import PrimaryPagination from "../../../components/Pagination/Pagination";
import type { IUnit, IUnitResponse } from "../types";
import UnitFormModel from "../components/UnitFormModel";
import Button from "../../../components/Button/Button";
import "./units.css";
import { useCreateUnit } from "../apis/addUnit";
import { useEditUnit } from "../apis/editUnit";
import { useDeleteUnit } from "../apis/deleteUnit";
import SearchEngine from "../../../components/SearchEngine/SearchEngine";
import * as XLSX from "xlsx";
import { STATUS } from "../../../constants/status";
import { STATUS_DISPLAY } from "../../../utils/statusDisplay";
import { useCreateUnitMulti } from "../apis/addUnitMulti";

type ImportedUnit = Omit<IUnitResponse, "id"> & {
  id?: string;
};

export function Units() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedUnit, setSelectedUnit] = useState<IUnitResponse | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<IUnitResponse | null>(null);

  const { showSnackbar } = useSnackbar();
  const { mutateAsync: createUnit } = useCreateUnit({});
  const { mutateAsync: editUnit } = useEditUnit({});
  const { mutateAsync: deleteUnit } = useDeleteUnit({});
  const { mutateAsync: createUnitMulti } = useCreateUnitMulti({});

  const Params = {
    limit: rowsPerPage,
    skip: (page - 1) * rowsPerPage,
    ...(search && { search }),
  };

  const { data: units } = useGetUnits(Params);

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setPage(1);
  };

  const handleOpenEdit = (unit: IUnitResponse) => {
    setSelectedUnit(unit);
    setOpenModal(true);
  };

  const handleOpenAdd = () => {
    setSelectedUnit(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUnit(null);
  };

  const handleOpenDeleteDialog = (unit: IUnitResponse) => {
    setUnitToDelete(unit);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUnitToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!unitToDelete?.id) return;

    try {
      await deleteUnit({ id: unitToDelete.id });
      showSnackbar({
        message: "Xóa đơn vị tính thành công!",
        severity: "success",
      });
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Delete failed:", error);
      showSnackbar({
        message: "Xóa đơn vị tính thất bại. Vui lòng thử lại.",
        severity: "error",
      });
    }
  };

  const normalizeUnitPayload = (data: IUnitResponse): IUnit => {
    const { id, unit_name, description, type, status } = data;

    return {
      id,
      unit_name,
      description,
      type,
      status,
    };
  };

  const handleSubmitUnit = async (data: IUnitResponse) => {
    const payload = normalizeUnitPayload(data);
    console.log(payload);
    try {
      if (selectedUnit) {
        await editUnit({
          id: data.id!,
          data: payload,
        });
        showSnackbar({
          message: "Cập nhật đơn vị tính thành công",
          severity: "success",
        });
      } else {
        await createUnit(payload);
        showSnackbar({
          message: "Thêm đơn vị tính thành công",
          severity: "success",
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error("Submit unit failed:", error);
      showSnackbar({
        message: "Có lỗi xảy ra, vui lòng thử lại",
        severity: "error",
      });
    }
  };

  const handleImportUnits = async (data: IUnitResponse[]) => {
    const payload = {
      units: data.map((unit) => ({
        unit_name: unit.unit_name,
        description: unit.description,
        type: unit.type,
        status: unit.status,
      })),
    };

    try {
      await createUnitMulti(payload);
      showSnackbar({
        message: "Thêm đơn vị tính thành công",
        severity: "success",
      });
      handleCloseModal();
    } catch (error) {
      console.error("Import units failed:", error);
      showSnackbar({
        message: "Có lỗi xảy ra, vui lòng thử lại",
        severity: "error",
      });
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;

      const workbook = XLSX.read(new Uint8Array(data as ArrayBuffer), {
        type: "array",
      });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows: (string | number)[][] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        range: 2,
        defval: "",
      });

      const mapped: ImportedUnit[] = rows
        .filter((row) => row.some((cell) => `${cell}`.trim() !== ""))
        .map((row) => {
          const [
            unit_name_raw = "",
            description_raw = "",
            type_raw = "",
            status_raw = STATUS.ACTIVE,
          ] = row;

          const unit_name = `${unit_name_raw}`.trim();
          const description = `${description_raw}`.trim();
          const type = `${type_raw}`.trim();
          const status = `${status_raw}`.trim() || STATUS.ACTIVE;

          return {
            unit_name,
            description,
            type,
            status,
          };
        });

      handleImportUnits(mapped);
    };

    reader.readAsArrayBuffer(file);
    event.target.value = "";
  };

  return (
    <Container maxWidth={false} className="primary-container">
      <div className="unit-actions">
        <SearchEngine placeholder="Tìm kiếm" onSearch={handleSearch} />
        {/* <Button onClick={handleExport} className="unit-upload-button">
          Xuất mẫu excel
        </Button>
        <Button onClick={handleImport} className="unit-upload-button">
          tải lên
        </Button> */}
        <Button onClick={handleOpenAdd}>thêm mới</Button>
      </div>
      <input
        type="file"
        accept=".xlsx,.xls,.xlsm,.xlsb"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <TableContainer className="primary-table-container">
        <Table stickyHeader aria-label="units table">
          <TableHead className="primary-thead">
            <TableRow>
              <TableCell className="primary-tcell" align="center">
                Tên đơn vị tính
              </TableCell>
              <TableCell className="primary-tcell" align="center">
                Mô tả
              </TableCell>
              <TableCell className="primary-tcell" align="center">
                Loại
              </TableCell>
              <TableCell className="primary-tcell" align="center">
                Trạng thái
              </TableCell>
              <TableCell className="primary-tcell" align="center"></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {units?.data.map((unit) => {
              const statusKey = unit.status?.toLowerCase?.() ?? "";
              const badgeClass = STATUS_DISPLAY[statusKey]
                ? `status-${statusKey}`
                : "status-unknown";

              return (
                <TableRow className="primary-trow" key={unit.id}>
                  <TableCell className="custom-border-tcell primary-tcell">
                    {unit.unit_name}
                  </TableCell>
                  <TableCell className="custom-border-tcell primary-tcell">
                    {unit.description}
                  </TableCell>
                  <TableCell className="custom-border-tcell primary-tcell">
                    {unit.type}
                  </TableCell>
                  <TableCell
                    align="center"
                    className="custom-border-tcell primary-tcell"
                  >
                    <span className={`status-badge ${badgeClass}`}>
                      {STATUS_DISPLAY[statusKey] ?? unit.status ?? "Unknown"}
                    </span>
                  </TableCell>
                  <TableCell
                    align="center"
                    className="custom-border-tcell primary-tcell"
                  >
                    <IconButton
                      className="primary-edit-btn"
                      size="small"
                      onClick={() => handleOpenEdit(unit)}
                    >
                      <FiEdit />
                    </IconButton>
                    <IconButton
                      className="primary-delete-btn"
                      size="small"
                      onClick={() => handleOpenDeleteDialog(unit)}
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
        totalItems={units?.total || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleItemsPerPageChange}
      />

      <UnitFormModel
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitUnit}
        initialData={selectedUnit || undefined}
        mode={selectedUnit ? "edit" : "add"}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" className="primary-dialog-title">
          XÁC NHẬN XÓA ĐƠN VỊ TÍNH
        </DialogTitle>
        <DialogContent className="primary-dialog-content">
          <DialogContentText id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa đơn vị tính "{unitToDelete?.unit_name}"
            không?
            <br />
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="primary-dialog-actions">
          <Button onClick={handleCloseDeleteDialog} className="button-cancel">
            HỦY
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            autoFocus
          >
            XÓA
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
