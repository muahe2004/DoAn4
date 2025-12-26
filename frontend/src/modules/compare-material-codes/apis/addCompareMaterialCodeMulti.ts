import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api";
import type { IMultiCompareMaterialCodeCreate } from "../types";

export const useCreateCompareMaterialCodeMulti = ({}: any) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: IMultiCompareMaterialCodeCreate) => {
            const response = await apiClient.post("/compare-material-codes/multi", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["compare-material-codes"] });
        },
    });
};
