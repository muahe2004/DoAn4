export interface IProduct {
    id?: string;
    product_code: string;
    product_name: string;
    unit_id: string;
    unit_id_2: string;
    norm_id: string;
    description?: string;
    is_semi_product: boolean;
    status: string;
    created_at?: string;
    updated_at?: string;
}

export interface IProductResponse extends IProduct {
    unit_name: string;
    unit_name_2: string;
    norm_name: string;
}