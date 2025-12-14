export interface IProduct {
    id?: string;
    product_code: string;
    product_name: string;
    unit_id?: string | null;
    unit_id_2?: string | null;
    norm_id?: string | null;
    unit_name?: string;
    unit_name_2?: string;
    norm_name?: string;
    description?: string;
    is_semi_product: boolean;
    status?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface IMultiProductCreate {
    products: IProduct[];
}

export interface IProductResponse extends IProduct {
    unit_name: string;
    unit_name_2?: string;
    norm_name: string;
    status: string;
}