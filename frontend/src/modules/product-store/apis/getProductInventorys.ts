import { apiClient } from "../../../lib/api";
import type {
  IProductInventoryResponse,
  IProductInventoryQueryParams,
} from "../types";

export const getProductInventorys = async (
  params: IProductInventoryQueryParams = {}
): Promise<IProductInventoryResponse> => {
  const queryParams = new URLSearchParams();

  if (params.skip !== undefined)
    queryParams.append("skip", params.skip.toString());
  if (params.limit !== undefined)
    queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.store_id) queryParams.append("store_id", params.store_id);
  if (params.product_code)
    queryParams.append("product_code", params.product_code);
  if (params.internal_code)
    queryParams.append("internal_code", params.internal_code);
  if (params.external_code)
    queryParams.append("external_code", params.external_code);
  if (params.min_quantity !== undefined)
    queryParams.append("min_quantity", params.min_quantity.toString());
  if (params.max_quantity !== undefined)
    queryParams.append("max_quantity", params.max_quantity.toString());

  const response = await apiClient.get(
    `/product-inventorys?${queryParams.toString()}`
  );
  return response.data;
};
