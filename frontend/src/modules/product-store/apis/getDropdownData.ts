import { apiClient } from "../../../lib/api";
import type {
  IProductDropdown,
  IStoreDropdown,
  ApiProduct,
  ApiStore,
} from "../types";

export const getProductsDropdown = async (): Promise<IProductDropdown[]> => {
  const response = await apiClient.get("/products?limit=1000");
  return response.data.data.map((product: ApiProduct) => ({
    id: product.id,
    product_code: product.product_code,
    product_name: product.product_name,
  }));
};

export const getStoresDropdown = async (): Promise<IStoreDropdown[]> => {
  const response = await apiClient.get("/stores?limit=1000");
  return response.data.data.map((store: ApiStore) => ({
    id: store.id,
    store_code: store.store_code,
    store_name: store.store_name,
  }));
};
