import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { URL_API_NORM_PRODUCT_INVENTORYS } from "../../../../constants/config";
import { apiClient } from "../../../../lib/api";

export interface ExportNormProductsParams {
  search?: string;
  status?: string;
  format?: "excel" | "pdf";
}

const exportNormProducts = async (
  params: ExportNormProductsParams = {}
): Promise<Blob> => {
  const { search, status, format = "excel" } = params;

  const queryParams = new URLSearchParams();

  if (search) {
    queryParams.append("search", search);
  }

  if (status) {
    queryParams.append("status", status);
  }

  queryParams.append("format", format);

  const response = await apiClient.get(
    `${URL_API_NORM_PRODUCT_INVENTORYS}/export?${queryParams}`,
    {
      responseType: "blob",
    }
  );

  return response.data;
};

export const useExportNormProducts = (
  config?: UseMutationOptions<Blob, Error, ExportNormProductsParams>
) => {
  return useMutation({
    mutationFn: exportNormProducts,
    ...config,
  });
};
