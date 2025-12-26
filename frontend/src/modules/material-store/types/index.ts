export interface IMaterialInventory {
  id?: string;
  material_id: string;
  store_id: string;
  quantity_on_hand: number;
  total_value?: number;
  status: string;
  created_at?: string;
  updated_at?: string;
  internal_code?: string;
  external_code?: string;
  material_code: string;
  material_name: string;
  material_description?: string;
  unit_name: string;
  unit_name_2?: string;
  store_name: string;
  store_code: string;
}

export interface IMaterialDropdown {
  id: string;
  material_name: string;
}

export interface IStoreDropdown {
  id: string;
  store_code: string;
  store_name: string;
}

export interface IUnitDropdown {
  id: string;
  unit_name: string;
}

export interface MaterialInventoryQueryParams {
  skip?: number;
  limit?: number;
  search?: string;
  status?: string;
  store_id?: string;
  material_code?: string;
  internal_code?: string;
  external_code?: string;
  min_quantity?: number;
  max_quantity?: number;
}

export interface MaterialInventorysResponse {
  data: IMaterialInventory[];
  total: number;
  page: number;
  limit: number;
}

export interface MaterialInventoryCreate {
  material_id: string;
  store_id: string;
  quantity_on_hand: number;
  status?: string;
  internal_code?: string;
  external_code?: string;
}

export interface MaterialInventoryUpdate {
  material_id?: string;
  store_id?: string;
  quantity_on_hand?: number;
  status?: string;
  internal_code?: string;
  external_code?: string;
}
