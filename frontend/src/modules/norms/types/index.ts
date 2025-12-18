import { StatusEnum } from "../../../constants/status";

export interface INormDetail {
  id?: string;
  unit_id: string;
  material_id: string;
  description?: string;
  norm_value: number;
  status?: StatusEnum;
}

export interface INorm {
  id?: string;
  norm_name: string;
  description?: string;
  status?: StatusEnum;
  created_at?: string;
  updated_at?: string;
  norm_details: INormDetail[];
}

export type INormResponse = INorm;

export interface NormDropdownResponse {
  id: string;
  norm_name: string;
}
