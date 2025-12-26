import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api";

interface GetStoresParams {
    limit?: number;
    skip?: number;
    search?: string;
    status?: string;
}

export const useGetStores = (params: GetStoresParams) => {
    return useQuery({
        queryKey: ["stores", params],
        queryFn: async () => {
            const response = await apiClient.get("/stores", { params });
            return response.data;
        },
    });
};
