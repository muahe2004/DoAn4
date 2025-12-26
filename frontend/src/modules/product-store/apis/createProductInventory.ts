import { apiClient } from "../../../lib/api";
import type { IProductInventory, IProductInventoryCreate } from "../types";

export const createProductInventory = async (
  data: IProductInventoryCreate
): Promise<IProductInventory> => {
  const response = await apiClient.post("/product-inventorys", data);
  return response.data;
};
