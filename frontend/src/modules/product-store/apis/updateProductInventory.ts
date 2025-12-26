import { apiClient } from "../../../lib/api";
import type { IProductInventory, IProductInventoryUpdate } from "../types";

export const updateProductInventory = async (
  id: string,
  data: IProductInventoryUpdate
): Promise<IProductInventory> => {
  const response = await apiClient.put(`/product-inventorys/${id}`, data);
  return response.data;
};
