export interface IFiscalImportDeclaration {
    id?: string;
    import_declaration_number: string;
    licence_number?: string;
    licence_date?: string;
    bill_number?: string;
    exporter: string;
    exporter_id: string;
    usd_exchange_rate?: number;
    currency_id?: string;
    type_declaration: string;
    type_inventory: string;
    shipping_term?: string;
    shipping_fee?: number;
    status?: string;
    created_at?: string;
    updated_at?: string;
}

export interface IFiscalImportDeclarationResponse extends IFiscalImportDeclaration {
    status: string;
    internal_code?: string;
    external_code?: string;
    importer?: string;
}

export interface IFiscalImportDeclarationDetail {
    id?: string;
    hs_code: string;
    import_declaration_id: string;
    material_id: string;
    origin_country_id: string;
    unit?: string;
    unit2?: string;
    quantity?: number;
    quantity2?: number;
    unit_price?: number;
    unit_price_transport?: number;
    status?: string;
    created_at?: string;
    updated_at?: string;
    // Additional fields from JOIN
    import_declaration_number?: string;
    licence_date?: string;
    type_declaration?: string;
    material_code?: string;
    material_name?: string;
}

export interface IFiscalImportDeclarationDetailResponse extends IFiscalImportDeclarationDetail {
    status: string;
    standard_unit?: string;
    customs_unit?: string;
    conversion_factor?: number;
    converted_declaration_quantity?: number;
    converted_accounting_quantity?: number;
    variance?: number;
    accounting_quantity?: number;
}
