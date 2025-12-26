import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MutationConfig } from "src/lib/react-query";
import { apiClient } from "../../../lib/api";
import { URL_API_MATERIAL } from "../../../constants/config";
import type { IMaterialUpdatePayload } from "../types";

const updateMaterial = async ({
    id,
    data,
}: {
    id: string;
    data: IMaterialUpdatePayload;
}): Promise<any> => {
    const response = await apiClient.patch(`${URL_API_MATERIAL}/${id}`, data);
    return response.data;
};

type UseEditMaterialOptions = {
    config?: MutationConfig<typeof updateMaterial>;
};

export const useEditMaterial = ({ config }: UseEditMaterialOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateMaterial,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["materials"] });
        },
        ...config,
    });
};
