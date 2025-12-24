export interface IExportDeclarationDetail {
  id: string;
  hs_code: string;
  product_code: string;
  product_name: string;
  origin_country_name?: string;
  quantity?: number;
  quantity2?: number;
  unit_price?: number;
  unit_price_transport?: number;
  invoice_value?: number;
  taxable_price?: number;
  unit_name?: string;
  unit_name_2?: string;
  status?: string;
}

export interface IExportDeclarationHeader {
  id: string;
  export_declaration_number: string;
  licence_number?: string;
  licence_date?: string;
  bill_number?: string;
  importer?: string;
  importer_id?: string;
  usd_exchange_rate?: number;
  currency_id?: string;
  type_declaration: string;
  type_inventory: string;
  shipping_term?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface IExportDetailView {
  header: IExportDeclarationHeader;
  details: IExportDeclarationDetail[];
}

export interface IExportDeclarationListItem {
  export_detail_id: string;
  export_declaration_id: string;
  export_declaration_number: string;
  bill_number?: string;
  licence_date?: string;
  importer?: string;
  type_declaration: string;
  type_inventory: string;
  shipping_term?: string;
  status?: string;
  usd_exchange_rate?: number;
  currency_id?: string;
  hs_code: string;
  product_code: string;
  product_name: string;
  origin_country_name?: string;
  quantity?: number;
  quantity2?: number;
  unit_price?: number;
  unit_price_transport?: number;
  invoice_value?: number;
  taxable_price?: number;
  unit_name?: string;
  unit_name_2?: string;
}

export interface IExportDeclarationListResponse {
  total: number;
  data: IExportDeclarationListItem[];
}

export interface IExportCreateDetailPayload {
  hs_code: string;
  product_code: string;
  product_name?: string;
  origin_country_name?: string;
  origin_country_code?: string;
  unit_id?: string | null;
  unit_name?: string;
  unit_id_2?: string | null;
  unit_name_2?: string;
  quantity?: number;
  quantity2?: number;
  unit_price?: number;
  unit_price_transport?: number;
  invoice_value?: number;
  taxable_price?: number;
  status?: string;
}

export interface IExportCreatePayload {
  export_declaration_number: string;
  licence_number?: string;
  licence_date?: string;
  bill_number?: string;
  importer?: string;
  importer_id?: string;
  usd_exchange_rate?: number;
  currency_id?: string;
  type_declaration: string;
  type_inventory: string;
  shipping_term?: string;
  status?: string;
  details: IExportCreateDetailPayload[];
}

export interface IExportFormDetailRow {
  hs_code: string;
  product_code: string;
  product_name: string;
  origin_country_name?: string;
  unit_name?: string;
  unit_name_2?: string;
  quantity?: string;
  quantity2?: string;
  unit_price?: string;
  unit_price_transport?: string;
  invoice_value?: string;
  taxable_price?: string;
  status?: string;
}

export interface IExportFormPayload {
  export_declaration_number: string;
  licence_number?: string;
  licence_date?: string;
  bill_number?: string;
  importer?: string;
  type_declaration: string;
  type_inventory: string;
  shipping_term?: string;
  usd_exchange_rate?: string;
  details: IExportFormDetailRow[];
}
