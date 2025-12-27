import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_FISCAL_EXPORT_DECLARATION_DETAIL } from "../../../../constants/config";
import type { IFiscalExportDeclarationDetailResponse } from "../types";

export interface FiscalExportDeclarationDetailListResponse {
    total: number;
    data: IFiscalExportDeclarationDetailResponse[];
}

export interface Params {
    skip: number;
    limit: number;
    search?: string;
    status?: string;
}

const getFiscalExportDeclarationDetails = async (
    params: Params
): Promise<FiscalExportDeclarationDetailListResponse> => {
    try {
        const res = await axios.get<FiscalExportDeclarationDetailListResponse>(
            `${URL_API_FISCAL_EXPORT_DECLARATION_DETAIL}`,
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
        throw new Error("Unexpected error");
    }
};

export const useGetFiscalExportDeclarationDetails = (
    params: Params,
    options?: { enabled?: boolean }
) => {
    return useQuery<FiscalExportDeclarationDetailListResponse, AxiosError<{ detail?: string }>>({
        queryKey: ["fiscal-export-declaration-details", params],
        queryFn: () => getFiscalExportDeclarationDetails(params),
        enabled: options?.enabled ?? true,
    });
};
