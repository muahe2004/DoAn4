import { useState } from "react";
import type { IMaterialResponse } from "../types";
import type { MaterialFormValues } from "../components/MaterialFormModal";
import { useCreateMaterial } from "../apis/addMaterial";
import { useEditMaterial } from "../apis/editMaterial";
import { useDeleteMaterials } from "../apis/deleteMaterials";

type SnackbarPayload = {
  message: string;
  severity: "success" | "error" | "warning" | "info";
};

type UseMaterialHandlersParams = {
  selectedMaterial: IMaterialResponse | null;
  onClose: () => void;
  showSnackbar: (payload: SnackbarPayload) => void;
};

export const useMaterialHandlers = ({
  selectedMaterial,
  onClose,
  showSnackbar,
}: UseMaterialHandlersParams) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: createMaterial } = useCreateMaterial({});
  const { mutateAsync: editMaterial } = useEditMaterial({});
  const { mutateAsync: deleteMaterials } = useDeleteMaterials({});

  const handleSubmitMaterial = async (data: MaterialFormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (selectedMaterial?.id) {
        await editMaterial({
          id: selectedMaterial.id,
          data,
        });
        showSnackbar({ message: "Cập nhật nguyên vật liệu thành công", severity: "success" });
      } else {
        await createMaterial(data);
        showSnackbar({ message: "Thêm nguyên vật liệu thành công", severity: "success" });
      }
      onClose();
    } catch (error) {
      showSnackbar({
        message: "Có lỗi xảy ra, vui lòng thử lại",
        severity: error ? "error" : "warning",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMaterial = async (material: IMaterialResponse) => {
    if (!material.id) return;
    try {
      await deleteMaterials([material.id]);
      showSnackbar({ message: "Đã xoá nguyên vật liệu", severity: "success" });
    } catch (error) {
      showSnackbar({
        message: "Không thể xoá lúc này",
        severity: error ? "error" : "warning",
      });
    }
  };

  return {
    handleDeleteMaterial,
    handleSubmitMaterial,
    isSubmitting,
  };
};
