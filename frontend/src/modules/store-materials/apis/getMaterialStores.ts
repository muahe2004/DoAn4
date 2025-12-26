import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_MATERIAL_STORE } from "../../../constants/config";
import type { IMaterialStoreResponse } from "../types/index";

export interface MaterialStoreListResponse {
    total: number;
    data: IMaterialStoreResponse[];
}

export interface Params {
    skip: number;
    limit: number;
    search?: string;
    status?: string;
    from_date?: string;
    to_date?: string;
}

const getMaterialStores = async (params: Params): Promise<MaterialStoreListResponse> => {
    try {
        const res = await axios.get<MaterialStoreListResponse>(
            `${URL_API_MATERIAL_STORE}`,
            {
                params,
                withCredentials: true,
            }
        );
        return res.data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        throw new Error('Unexpected error');
    }
};

export const useGetMaterialStores = (params: Params) => {
    return useQuery<MaterialStoreListResponse, AxiosError<{ detail?: string }>>({
        queryKey: ['material-stores', params],
        queryFn: () => getMaterialStores(params),
        keepPreviousData: true,
    });
};
