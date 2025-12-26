export interface ImportDeclarationDetail {
    id: string;
    hs_code: string;
    import_declaration_id: string;
    material_id: string;
    origin_country_id: string;
    unit_id?: string | null;
    unit_id_2?: string | null;
    quantity?: number | null;
    quantity2?: number | null;
    unit_price?: number | null;
    unit_price_transport?: number | null;
    status?: string | null;
    created_at?: string;
    updated_at?: string;
    unit_name?: string | null;
    unit_name_2?: string | null;
    country_name?: string | null;
    material_name?: string | null;
}

export interface ImportDeclarationResponse {
    id: string;
    import_declaration_number: string;
    licence_number: string;
    licence_date: string;
    bill_number: string;
    exporter: string;
    exporter_id: string;
    usd_exchange_rate: number;
    currency_id: string;
    currency_name: string;
    type_declaration: string;
    type_inventory: string;
    shipping_term: string;
    shipping_fee: number;
    status: string;
    created_at: string;
    updated_at: string;
    details: ImportDeclarationDetail[];
}

export interface ImportDeclarationListResponse {
    total: number;
    data: ImportDeclarationResponse[];
}

export interface ImportDeclarationMaterialPayload {
    material_code?: string;
    material_name?: string;
    unit_id?: string | null;
    unit_name?: string | null;
    unit_id_2?: string | null;
    unit_name_2?: string | null;
    description?: string | null;
    country_id?: string | null;
    country_code?: string | null;
    country_name?: string | null;
    status?: string | null;
    quantity?: number | null;
    quantity2?: number | null;
    unit_price?: number | null;
    unit_price_transport?: number | null;
}

export interface ImportDeclarationCreatePayload {
    import_declaration_number: string;
    licence_number?: string | null;
    licence_date?: string | null;
    bill_number?: string | null;
    exporter: string;
    exporter_id: string;
    usd_exchange_rate?: number | null;
    currency_id?: string | null;
    type_declaration: string;
    type_inventory: string;
    shipping_term?: string | null;
    shipping_fee?: number | null;
    status?: string | null;
    materials: ImportDeclarationMaterialPayload[];
}
