import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_MATERIAL } from "../../../constants/config";
import type { IMaterialListResponse } from "../types";

export interface Params {
    skip: number;
    limit: number;
    search?: string;
    status?: string;
}

const getMaterials = async (params: Params): Promise<IMaterialListResponse> => {
    const response = await axios.get<IMaterialListResponse>(`${URL_API_MATERIAL}`, {
        params,
        withCredentials: true,
    });
    return response.data;
};

export const useGetMaterials = (params: Params) => {
    return useQuery<IMaterialListResponse, AxiosError<{ detail?: string }>>({
        queryKey: ["materials", params],
        queryFn: () => getMaterials(params),
    });
};
