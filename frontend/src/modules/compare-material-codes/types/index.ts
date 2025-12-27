export interface ICompareMaterialCode {
    id?: string;
    material_id: string;
    internal_code?: string | null;
    external_code?: string | null;
    description?: string;
    status?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface IMultiCompareMaterialCodeCreate {
    compare_material_codes: ICompareMaterialCode[];
}

export interface ICompareMaterialCodeResponse extends ICompareMaterialCode {
    status: string;
    material_code?: string;
    material_name?: string;
}
