import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api";

interface GetMaterialsParams {
    limit?: number;
    skip?: number;
    search?: string;
    status?: string;
}

export const useGetMaterials = (params: GetMaterialsParams) => {
    return useQuery({
        queryKey: ["materials", params],
        queryFn: async () => {
            const response = await apiClient.get("/materials", { params });
            return response.data;
        },
    });
};
