import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Autocomplete,
  TextField,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import Button from "../../../../components/Button/Button";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import type { INormDetail } from "../types";
import { useGetDropdownMaterials } from "../apis/materialsDropdown";
import { useGetDropdownUnits } from "../../../units/apis/dropdown";
import { STATUS } from "../../../../constants/status";

interface NormDetailsTableProps {
  normDetails: INormDetail[];
  onAdd: (detail: Omit<INormDetail, "id">) => void;
  onEdit: (id: string, detail: Partial<INormDetail>) => void;
  onDelete: (id: string) => void;
}

const NormDetailsTable: React.FC<NormDetailsTableProps> = ({
  normDetails,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDetail, setEditingDetail] = useState<INormDetail | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string;
    materialName: string;
  }>({
    open: false,
    id: "",
    materialName: "",
  });
  const [newDetail, setNewDetail] = useState<Omit<INormDetail, "id">>({
    unit_id: "",
    material_id: "",
    description: "",
    norm_value: 0,
    status: STATUS.ACTIVE,
  });

  // Dropdown data
  const {
    data: materials,
    isLoading: materialsLoading,
    error: materialsError,
  } = useGetDropdownMaterials({ skip: 0, limit: 5, status: STATUS.ACTIVE });

  const {
    data: units,
    isLoading: unitsLoading,
    error: unitsError,
  } = useGetDropdownUnits({ skip: 0, limit: 5 });

  const handleAddClick = () => {
    if (editingId) return; // Don't allow add when editing
    setIsAdding(true);
  };

  const handleSaveNew = () => {
    // Validation
    const errors: string[] = [];

    if (!newDetail.material_id) {
      errors.push("Vui lòng chọn nguyên vật liệu");
    }
    if (!newDetail.unit_id) {
      errors.push("Vui lòng chọn đơn vị tính");
    }
    if (!newDetail.norm_value || newDetail.norm_value <= 0) {
      errors.push("Định mức phải lớn hơn 0");
    }

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    onAdd(newDetail);
    setNewDetail({
      unit_id: "",
      material_id: "",
      description: "",
      norm_value: 0,
      status: STATUS.ACTIVE,
    });
    setIsAdding(false);
  };

  const handleCancelNew = () => {
    setIsAdding(false);
    setNewDetail({
      unit_id: "",
      material_id: "",
      description: "",
      norm_value: 0,
      status: STATUS.ACTIVE,
    });
  };

  const getMaterialName = (materialId: string) => {
    return materials?.find((m) => m.id === materialId)?.material_name || "";
  };

  const getUnitName = (unitId: string) => {
    return units?.find((u) => u.id === unitId)?.unit_name || "";
  };

  const formatNormValue = (value: number) => {
    if (value % 1 === 0) {
      return value.toString();
    }
    return parseFloat(value.toFixed(2)).toString();
  };

  const handleConfirmDelete = () => {
    onDelete(deleteDialog.id);
    setDeleteDialog({ open: false, id: "", materialName: "" });
  };

  const handleEditClick = (detail: INormDetail) => {
    setEditingId(detail.id!);
    setEditingDetail({ ...detail });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingDetail(null);
  };

  const handleEditSave = () => {
    if (!editingDetail || !editingId) return;

    // Validation
    const errors: string[] = [];

    if (!editingDetail.material_id) {
      errors.push("Vui lòng chọn nguyên vật liệu");
    }
    if (!editingDetail.unit_id) {
      errors.push("Vui lòng chọn đơn vị tính");
    }
    if (!editingDetail.norm_value || editingDetail.norm_value <= 0) {
      errors.push("Định mức phải lớn hơn 0");
    }

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    onEdit(editingId, editingDetail);
    setEditingId(null);
    setEditingDetail(null);
  };

  const handleEditChange = (
    field: keyof INormDetail,
    value: string | number
  ) => {
    if (!editingDetail) return;
    setEditingDetail((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  // Show loading if dropdowns are loading
  if (materialsLoading || unitsLoading) {
    return (
      <Paper elevation={1} className="norm-loading-container">
        <CircularProgress />
        <div className="norm-loading-text">Đang tải dữ liệu...</div>
      </Paper>
    );
  }

  // Show error if dropdowns failed to load
  if (materialsError || unitsError) {
    return (
      <Paper elevation={1} className="norm-error-container">
        <Alert severity="error">
          Không thể tải dữ liệu dropdown. Vui lòng thử lại sau.
          {materialsError && <div>Materials: {materialsError.message}</div>}
          {unitsError && <div>Units: {unitsError.message}</div>}
        </Alert>
      </Paper>
    );
  }

  return (
    <>
      <Paper elevation={1}>
        <div className="norm-details-header">
          <h3>Chi tiết định mức</h3>
          <div className="norm-actions">
            <Button
              startIcon={<FiPlus />}
              onClick={handleAddClick}
              disabled={editingId !== null}
            >
              Thêm nguyên vật liệu
            </Button>
          </div>
        </div>

        <TableContainer className="primary-table-container">
          <Table size="small" stickyHeader aria-label="norms table">
            <TableHead className="primary-thead">
              <TableRow>
                <TableCell className="primary-tcell" align="center">
                  STT
                </TableCell>
                <TableCell className="primary-tcell" align="center">
                  Nguyên vật liệu
                </TableCell>
                <TableCell className="primary-tcell" align="center">
                  Đơn vị tính
                </TableCell>
                <TableCell className="primary-tcell" align="center">
                  Định mức
                </TableCell>
                <TableCell className="primary-tcell" align="center">
                  Mô tả
                </TableCell>
                <TableCell className="primary-tcell" align="center">
                  Hành động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {normDetails.map((detail, index) => {
                const isEditing = editingId === detail.id;

                return (
                  <TableRow key={detail.id}>
                    <TableCell>{index + 1}</TableCell>

                    {/* Material */}
                    <TableCell>
                      {isEditing ? (
                        <Autocomplete
                          size="small"
                          options={materials || []}
                          getOptionLabel={(option) => option.material_name}
                          value={
                            materials?.find(
                              (m) => m.id === editingDetail?.material_id
                            ) || null
                          }
                          onChange={(_, value) =>
                            handleEditChange("material_id", value?.id || "")
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Chọn nguyên vật liệu"
                            />
                          )}
                        />
                      ) : (
                        getMaterialName(detail.material_id)
                      )}
                    </TableCell>

                    {/* Unit */}
                    <TableCell>
                      {isEditing ? (
                        <Autocomplete
                          size="small"
                          options={units || []}
                          getOptionLabel={(option) => option.unit_name}
                          value={
                            units?.find(
                              (u) => u.id === editingDetail?.unit_id
                            ) || null
                          }
                          onChange={(_, value) =>
                            handleEditChange("unit_id", value?.id || "")
                          }
                          renderInput={(params) => (
                            <TextField {...params} placeholder="Chọn đơn vị" />
                          )}
                        />
                      ) : (
                        getUnitName(detail.unit_id)
                      )}
                    </TableCell>

                    {/* Norm Value */}
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          size="small"
                          type="number"
                          inputProps={{ step: "0.01", min: "0" }}
                          value={editingDetail?.norm_value || 0}
                          onChange={(e) =>
                            handleEditChange(
                              "norm_value",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0.00"
                        />
                      ) : (
                        formatNormValue(detail.norm_value)
                      )}
                    </TableCell>

                    {/* Description */}
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          size="small"
                          value={editingDetail?.description || ""}
                          onChange={(e) =>
                            handleEditChange("description", e.target.value)
                          }
                          placeholder="Mô tả"
                        />
                      ) : (
                        detail.description
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="center">
                      {isEditing ? (
                        <div className="norm-detail-actions">
                          <Button onClick={handleEditSave}>Lưu</Button>
                          <Button onClick={handleEditCancel}>Hủy</Button>
                        </div>
                      ) : (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(detail)}
                            disabled={
                              isAdding ||
                              (editingId !== null && editingId !== detail.id)
                            }
                          >
                            <FiEdit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                id: detail.id!,
                                materialName: getMaterialName(
                                  detail.material_id
                                ),
                              })
                            }
                            disabled={isAdding || editingId !== null}
                          >
                            <FiTrash2 />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Add new row */}
              {isAdding && (
                <TableRow>
                  <TableCell>{normDetails.length + 1}</TableCell>
                  <TableCell>
                    <Autocomplete
                      size="small"
                      options={materials || []}
                      getOptionLabel={(option) => option.material_name}
                      onChange={(_, value) =>
                        setNewDetail((prev) => ({
                          ...prev,
                          material_id: value?.id || "",
                        }))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Chọn nguyên vật liệu"
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Autocomplete
                      size="small"
                      options={units || []}
                      getOptionLabel={(option) => option.unit_name}
                      onChange={(_, value) =>
                        setNewDetail((prev) => ({
                          ...prev,
                          unit_id: value?.id || "",
                        }))
                      }
                      renderInput={(params) => (
                        <TextField {...params} placeholder="Chọn đơn vị" />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={newDetail.norm_value}
                      onChange={(e) =>
                        setNewDetail((prev) => ({
                          ...prev,
                          norm_value: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="0.00"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={newDetail.description}
                      onChange={(e) =>
                        setNewDetail((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Mô tả"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <div>
                      <Button onClick={handleSaveNew}>Lưu</Button>
                      <Button onClick={handleCancelNew}>Hủy</Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {normDetails.length === 0 && !isAdding && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    className="norm-empty-state"
                  >
                    Chưa có chi tiết định mức. Nhấn "Thêm nguyên vật liệu" để
                    bắt đầu.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({ open: false, id: "", materialName: "" })
        }
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" className="primary-dialog-title">
          Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa chi tiết định mức cho nguyên vật liệu "
            {deleteDialog.materialName}"? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="primary-dialog-actions">
          <Button
            className="button-cancel"
            onClick={() =>
              setDeleteDialog({ open: false, id: "", materialName: "" })
            }
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NormDetailsTable;
