import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_FISCAL_EXPORT_DECLARATION } from "../../../../constants/config";
import type { IFiscalExportDeclarationResponse } from "../types";

export interface FiscalExportDeclarationListResponse {
    total: number;
    data: IFiscalExportDeclarationResponse[];
}

export interface Params {
    skip: number;
    limit: number;
    search?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    export_declaration_number?: string;
    product_code?: string;
}

const getFiscalExportDeclarations = async (
    params: Params
): Promise<FiscalExportDeclarationListResponse> => {
    try {
        const res = await axios.get<FiscalExportDeclarationListResponse>(
            `${URL_API_FISCAL_EXPORT_DECLARATION}`,
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

export const useGetFiscalExportDeclarations = (
    params: Params,
    options?: { enabled?: boolean }
) => {
    return useQuery<FiscalExportDeclarationListResponse, AxiosError<{ detail?: string }>>({
        queryKey: ["fiscal-export-declarations", params],
        queryFn: () => getFiscalExportDeclarations(params),
        enabled: options?.enabled ?? true,
    });
};
