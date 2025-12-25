import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_FISCAL_IMPORT_DECLARATION } from "../../../../constants/config";
import type { IFiscalImportDeclarationResponse } from "../types/index";

export interface FiscalImportDeclarationListResponse {
    total: number;
    data: IFiscalImportDeclarationResponse[];
}

export interface Params {
    skip: number;
    limit: number;
    search?: string;
    status?: string;
    type?: string;
    from_date?: string;
    to_date?: string;
}

const getFiscalImportDeclarations = async (params: Params): Promise<FiscalImportDeclarationListResponse> => {
    try {
        const res = await axios.get<FiscalImportDeclarationListResponse>(
            `${URL_API_FISCAL_IMPORT_DECLARATION}`,
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

export const useGetFiscalImportDeclarations = (params: Params) => {
    return useQuery<FiscalImportDeclarationListResponse, AxiosError<{ detail?: string }>>({
        queryKey: ['fiscal-import-declarations', params],
        queryFn: () => getFiscalImportDeclarations(params),
        keepPreviousData: true,
    });
};
