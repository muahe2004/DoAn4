export interface IProductInventory {
  id: string;
  product_id: string;
  store_id: string;
  quantity_on_hand: number;
  total_value: number;
  status: string;
  created_at: string;
  updated_at: string;
  internal_code?: string;
  external_code?: string;
  product_code: string;
  product_name: string;
  product_description?: string;
  unit_name: string;
  unit_name_2?: string;
  store_name: string;
  store_code: string;
}

export interface IProductInventoryCreate {
  product_id: string;
  store_id: string;
  quantity_on_hand: number;
  status?: string;
  internal_code?: string;
  external_code?: string;
}

export interface IProductInventoryUpdate {
  quantity_on_hand?: number;
  status?: string;
  internal_code?: string;
  external_code?: string;
}

export interface IProductInventoryResponse {
  data: IProductInventory[];
  total: number;
  page: number;
  limit: number;
}

export interface IProductDropdown {
  id: string;
  product_code: string;
  product_name: string;
}

export interface IStoreDropdown {
  id: string;
  store_code: string;
  store_name: string;
}

export interface ApiProduct {
  id: string;
  product_code: string;
  product_name: string;
}

export interface ApiStore {
  id: string;
  store_code: string;
  store_name: string;
}

export interface IProductInventoryQueryParams {
  skip?: number;
  limit?: number;
  search?: string;
  store_id?: string;
  product_code?: string;
  internal_code?: string;
  external_code?: string;
  min_quantity?: number;
  max_quantity?: number;
}
