import { apiClient } from "../../../lib/api";

export const deleteProductInventory = async (id: string): Promise<void> => {
  await apiClient.delete(`/product-inventorys/${id}`);
};
