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

export type INormResponse = INorm;

export interface NormDropdownResponse {
  id: string;
  norm_name: string;
}
