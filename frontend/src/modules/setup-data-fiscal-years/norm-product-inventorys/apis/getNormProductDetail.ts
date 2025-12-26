import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { URL_API_NORM_PRODUCT_INVENTORYS } from "../../../../constants/config";
import { apiClient } from "../../../../lib/api";
import type { INormProductInventoryDetail } from "../types";

const getNormProductDetail = async (
  id: string
): Promise<INormProductInventoryDetail> => {
  const response = await apiClient.get(
    `${URL_API_NORM_PRODUCT_INVENTORYS}/${id}`
  );
  return response.data;
};

export const useGetNormProductDetail = (
  id: string,
  config?: Omit<
    UseQueryOptions<INormProductInventoryDetail, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["norm-product-detail", id],
    queryFn: () => getNormProductDetail(id),
    enabled: !!id,
    ...config,
  });
};
