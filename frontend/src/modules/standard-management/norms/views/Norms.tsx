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
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useState } from "react";
import { useGetNorms } from "../apis/getNorms";
import { FiEdit } from "react-icons/fi";
import { PiTrashSimpleFill } from "react-icons/pi";
import { useSnackbar } from "../../../../components/SnackBar/SnackBar";
import PrimaryPagination from "../../../../components/Pagination/Pagination";
import type { INorm, INormResponse } from "../types";
import NormFormModel from "../components/NormFormModel";
import Button from "../../../../components/Button/Button";
import "./norms.css";
import { useCreateNorm } from "../apis/addNorm";
import { useEditNorm } from "../apis/editNorm";
import { useDeleteNorms } from "../apis/deleteNorm";
import SearchEngine from "../../../../components/SearchEngine/SearchEngine";

export function Norms() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [selectedNorm, setSelectedNorm] = useState<INormResponse | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [normToDelete, setNormToDelete] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();
  const { mutateAsync: createNorm } = useCreateNorm({});
  const { mutateAsync: editNorm } = useEditNorm({});
  const { mutateAsync: deleteNorms } = useDeleteNorms();

  const Params = {
    limit: rowsPerPage,
    skip: (page - 1) * rowsPerPage,
  };

  const { data: norms } = useGetNorms(Params);

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setPage(1);
  };

  const handleOpenEdit = (norm: INormResponse) => {
    setSelectedNorm(norm);
    setOpenModal(true);
  };

  const handleOpenAdd = () => {
    setSelectedNorm(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedNorm(null);
  };

  const handleDeleteClick = (normId: string) => {
    setNormToDelete(normId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (normToDelete) {
      try {
        await deleteNorms([normToDelete]);
        showSnackbar({
          message: "Xóa định mức thành công",
          severity: "success",
        });
      } catch {
        showSnackbar({
          message: "Có lỗi xảy ra khi xóa định mức",
          severity: "error",
        });
      }
    }
    setDeleteConfirmOpen(false);
    setNormToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setNormToDelete(null);
  };

  const handleSubmitNorm = async (data: INorm) => {
    const payload: INorm = {
      norm_name: data.norm_name,
      description: data.description,
      status: data.status,
      norm_details: data.norm_details || [],
    };

    try {
      if (selectedNorm) {
        await editNorm({
          id: data.id!,
          data: payload,
        });
        showSnackbar({
          message: "Cập nhật định mức thành công",
          severity: "success",
        });
      } else {
        await createNorm(payload);
        showSnackbar({
          message: "Thêm định mức thành công",
          severity: "success",
        });
      }
      handleCloseModal();
    } catch {
      showSnackbar({
        message: "Có lỗi xảy ra, vui lòng thử lại",
        severity: "error",
      });
    }
  };

  return (
    <Container maxWidth={false} className="primary-container">
      <div className="norm-header">
          <div className="norm-title">
              <p className="norm-title__label">DANH MỤC ĐỊNH MỨC</p>
          </div>
          <div className="norm-actions">
              {/* <SearchEngine placeholder="Tên nguyên vật liệu, mã..."/> */}
              <div className="norm-actions__buttons">
                  <div className="norm-actions">
                    <Button onClick={handleOpenAdd}>thêm mới</Button>
                  </div>
              </div>
          </div>
      </div>
      

      <TableContainer className="primary-table-container">
        <Table stickyHeader aria-label="norms table">
          <TableHead className="primary-thead">
            <TableRow>
              <TableCell className="primary-tcell" align="center">
                STT
              </TableCell>
              <TableCell className="primary-tcell" align="center">
                Tên định mức
              </TableCell>
              <TableCell className="primary-tcell" align="center">
                Mô tả
              </TableCell>
              <TableCell className="primary-tcell" align="center">
                Trạng thái
              </TableCell>
              <TableCell className="primary-tcell" align="center">
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody className="primary-tbody">
            {norms?.data?.map((norm, index) => (
              <TableRow className="primary-trow" key={norm.id}>
                <TableCell
                  className="custom-border-tcell primary-tcell"
                  align="center"
                >
                  {(page - 1) * rowsPerPage + index + 1}
                </TableCell>
                <TableCell className="custom-border-tcell primary-tcell">
                  {norm.norm_name}
                </TableCell>
                <TableCell className="custom-border-tcell primary-tcell">
                  {norm.description}
                </TableCell>
                <TableCell
                  align="center"
                  className="custom-border-tcell primary-tcell"
                >
                  {norm.status}
                </TableCell>
                <TableCell
                  align="center"
                  className="custom-border-tcell primary-tcell"
                >
                  <IconButton
                    className="primary-edit-btn"
                    size="small"
                    onClick={() => handleOpenEdit(norm)}
                    title="Chỉnh sửa"
                  >
                    <FiEdit />
                  </IconButton>
                  <IconButton
                    className="primary-delete-btn"
                    size="small"
                    onClick={() => handleDeleteClick(norm.id!)}
                    title="Xóa"
                  >
                    <PiTrashSimpleFill />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <PrimaryPagination
        totalItems={norms?.total || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleItemsPerPageChange}
      />

      <NormFormModel
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitNorm}
        initialData={selectedNorm || undefined}
        mode={selectedNorm ? "edit" : "add"}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" className="primary-dialog-title">
          Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa định mức này? Hành động này không thể hoàn
            tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="primary-dialog-actions">
          <Button className="button-cancel" onClick={handleDeleteCancel}>
            Hủy
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
