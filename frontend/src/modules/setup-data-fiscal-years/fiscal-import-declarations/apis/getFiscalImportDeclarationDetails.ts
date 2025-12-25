import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_FISCAL_IMPORT_DECLARATION_DETAIL } from "../../../../constants/config";
import type { IFiscalImportDeclarationDetailResponse } from "../types/index";

export interface FiscalImportDeclarationDetailListResponse {
    total: number;
    data: IFiscalImportDeclarationDetailResponse[];
}

export interface Params {
    skip: number;
    limit: number;
    search?: string;
    status?: string;
}

const getFiscalImportDeclarationDetails = async (params: Params): Promise<FiscalImportDeclarationDetailListResponse> => {
    try {
        const res = await axios.get<FiscalImportDeclarationDetailListResponse>(
            `${URL_API_FISCAL_IMPORT_DECLARATION_DETAIL}`,
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

export const useGetFiscalImportDeclarationDetails = (params: Params) => {
    return useQuery<FiscalImportDeclarationDetailListResponse, AxiosError<{ detail?: string }>>({
        queryKey: ['fiscal-import-declaration-details', params],
        queryFn: () => getFiscalImportDeclarationDetails(params),
        keepPreviousData: true,
    });
};
