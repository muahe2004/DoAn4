export interface IMaterial {
    id?: string;
    material_code: string;
    material_name: string;
    unit_id: string;
    description?: string;
    country_id?: string | null;
    status?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface IMaterialResponse extends IMaterial {
    unit_name: string;
    country_name?: string;
    status: string;
}

export interface IMaterialListResponse {
    total: number;
    data: IMaterialResponse[];
}

export type IMaterialCreatePayload = Omit<IMaterial, "id" | "created_at" | "updated_at">;
export type IMaterialUpdatePayload = Partial<IMaterialCreatePayload>;

export interface IMaterialDeleteResponse {
    message: string;
    id: string;
}
