import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_IMPORT_DECLARATION } from "../../../constants/config";
import type { ImportDeclarationListResponse } from "../types";

export interface Params {
    skip: number;
    limit: number;
    search?: string;
    status?: string;
}

const getImportDeclarations = async (
    params: Params
): Promise<ImportDeclarationListResponse> => {
    const response = await axios.get<ImportDeclarationListResponse>(
        `${URL_API_IMPORT_DECLARATION}`,
        {
            params,
            withCredentials: true,
        }
    );
    return response.data;
};

export const useGetImportDeclarations = (params: Params) => {
    return useQuery<ImportDeclarationListResponse, AxiosError<{ detail?: string }>>({
        queryKey: ["import-declarations", params],
        queryFn: () => getImportDeclarations(params),
    });
};
