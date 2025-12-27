export interface IMaterialStore {
    id?: string;
    material_id: string;
    store_id: string;
    quantity_on_hand?: number;
    reorder_level?: number;
    safety_stock?: number;
    status?: string;
    created_at?: string;
    updated_at?: string;
    // Additional fields from JOIN
    material_code?: string;
    material_name?: string;
    unit_id?: string;
    unit_name?: string;
    store_name?: string;
    internal_code?: string;
    external_code?: string;
}

export interface IMaterialStoreResponse extends IMaterialStore {
    status: string;
}

