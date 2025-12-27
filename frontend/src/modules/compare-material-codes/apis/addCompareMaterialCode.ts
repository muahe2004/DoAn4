import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api";
import type { ICompareMaterialCode } from "../types";

export const useCreateCompareMaterialCode = ({}: any) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: ICompareMaterialCode) => {
            const response = await apiClient.post("/compare-material-codes", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["compare-material-codes"] });
        },
    });
};
