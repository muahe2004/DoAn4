import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api";
import type { ICompareMaterialCode } from "../types";

export const useEditCompareMaterialCode = ({}: any) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: ICompareMaterialCode }) => {
            const response = await apiClient.patch(`/compare-material-codes/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["compare-material-codes"] });
        },
    });
};
