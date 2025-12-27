export interface IFiscalExportDeclaration {
    id?: string;
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
    created_at?: string;
    updated_at?: string;
}

export interface IFiscalExportDeclarationResponse extends IFiscalExportDeclaration {
    status: string;
}

export interface IFiscalExportDeclarationDetailResponse {
    id?: string;
    export_declaration_number?: string;
    licence_date?: string;
    type_declaration?: string;
    hs_code?: string;
    product_code?: string;
    product_name?: string;
    unit_name?: string;
    unit_name_2?: string;
    quantity?: number;
    quantity2?: number;
    unit_price?: number;
    unit_price_transport?: number;
    status?: string;
    conversion_factor?: number;
    converted_declaration_quantity?: number;
    converted_accounting_quantity?: number;
    variance?: number;
}
