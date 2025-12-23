import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MutationConfig } from "src/lib/react-query";
import { apiClient } from "../../../lib/api";
import { URL_API_MATERIAL } from "../../../constants/config";
import type { IMaterialDeleteResponse } from "../types";

const deleteMaterials = async (materialIds: string[]): Promise<IMaterialDeleteResponse[]> => {
    const response = await apiClient.delete<IMaterialDeleteResponse[]>(`${URL_API_MATERIAL}`, {
        data: materialIds,
    });
    return response.data;
};

type UseDeleteMaterialsOptions = {
    config?: MutationConfig<typeof deleteMaterials>;
};

export const useDeleteMaterials = ({ config }: UseDeleteMaterialsOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteMaterials,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["materials"] });
        },
        ...config,
    });
};
