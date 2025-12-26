import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api";

interface GetCompareMaterialCodesParams {
    limit?: number;
    skip?: number;
    search?: string;
    status?: string;
}

export const useGetCompareMaterialCodes = (params: GetCompareMaterialCodesParams) => {
    return useQuery({
        queryKey: ["compare-material-codes", params],
        queryFn: async () => {
            const response = await apiClient.get("/compare-material-codes", { params });
            return response.data;
        },
    });
};
