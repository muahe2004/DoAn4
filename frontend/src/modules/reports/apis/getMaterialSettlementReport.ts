import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_SETTLEMENT_REPORT } from "../../../constants/config";
import type { MaterialSettlementResponse } from "../types";

export interface MaterialSettlementParams {
    skip: number;
    limit: number;
    search?: string;
    start_date?: string;
    end_date?: string;
}

const getMaterialSettlementReport = async (
    params: MaterialSettlementParams
): Promise<MaterialSettlementResponse> => {
    const response = await axios.get<MaterialSettlementResponse>(
        `${URL_API_SETTLEMENT_REPORT}/material-inventory`,
        {
            params,
            withCredentials: true,
        }
    );
    return response.data;
};

export const useGetMaterialSettlementReport = (
    params: MaterialSettlementParams
) => {
    return useQuery<
        MaterialSettlementResponse,
        AxiosError<{ detail?: string }>
    >({
        queryKey: ["material-settlement-report", params],
        queryFn: () => getMaterialSettlementReport(params),
    });
};
