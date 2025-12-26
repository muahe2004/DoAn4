import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { URL_API_NORM_PRODUCT_INVENTORYS } from "../../../../constants/config";
import { apiClient } from "../../../../lib/api";
import type { INormProductInventory } from "../types";

export interface GetNormProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface GetNormProductsResponse {
  data: INormProductInventory[];
  total: number;
  page: number;
  limit: number;
}

const getNormProducts = async (
  params: GetNormProductsParams = {}
): Promise<GetNormProductsResponse> => {
  const { page = 1, limit = 10, search, status } = params;

  const queryParams = new URLSearchParams({
    skip: ((page - 1) * limit).toString(),
    limit: limit.toString(),
  });

  if (search) {
    queryParams.append("search", search);
  }

  if (status) {
    queryParams.append("status", status);
  }

  const response = await apiClient.get(
    `${URL_API_NORM_PRODUCT_INVENTORYS}?${queryParams}`
  );
  return response.data;
};

export const useGetNormProducts = (
  params: GetNormProductsParams = {},
  config?: UseQueryOptions<GetNormProductsResponse, Error>
) => {
  return useQuery({
    queryKey: ["norm-product-inventorys", params],
    queryFn: () => getNormProducts(params),
    ...config,
  });
};
