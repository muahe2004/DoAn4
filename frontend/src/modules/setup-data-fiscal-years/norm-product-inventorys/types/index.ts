export interface INormDetail {
  id?: string;
  unit_id: string;
  material_id: string;
  description?: string;
  norm_value: number;
  status?: string;
}

export interface INorm {
  id?: string;
  norm_name: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  norm_details: INormDetail[];
}

export interface NormDropdownResponse {
  id: string;
  norm_name: string;
}

export interface INormProductInventory {
  id: string;
  norm_id: string;
  product_id: string;
  unit_id: string;
  norm_value: number;
  applied_date: string;
  fiscal_year: string;
  status: string;
  created_at: string;
  updated_at: string;
  // Joined data from backend
  norm_name: string;
  norm_description?: string;
  norm_created_at: string;
  product_code: string;
  product_name: string;
  product_description?: string;
  unit_name: string;
  unit_code?: string;
}

// Interface for detailed view (modal)
export interface INormProductInventoryDetail extends INormProductInventory {
  norm_details: INormDetailInfo[];
}

// Interface for norm detail info in modal
export interface INormDetailInfo {
  id: string;
  material_id: string;
  material_code: string;
  material_name: string;
  unit_id: string;
  unit_name: string;
  norm_value: number;
  description?: string;
  status: string;
}
