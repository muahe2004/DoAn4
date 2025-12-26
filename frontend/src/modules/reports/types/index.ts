export interface MaterialSettlementRow {
    material_id: string;
    material_code: string;
    material_name: string;
    unit_name?: string | null;
    opening_quantity: number;
    import_quantity: number;
    export_quantity: number;
    closing_quantity: number;
}

export interface MaterialSettlementResponse {
    start_date: string;
    end_date: string;
    total: number;
    data: MaterialSettlementRow[];
}

