import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MutationConfig } from "src/lib/react-query";
import { apiClient } from "../../../lib/api";
import { URL_API_MATERIAL } from "../../../constants/config";
import type { IMaterialCreatePayload } from "../types";

const createMaterial = async (data: IMaterialCreatePayload): Promise<IMaterialCreatePayload> => {
    const response = await apiClient.post(`${URL_API_MATERIAL}`, data);
    return response.data;
};

type UseCreateMaterialOptions = {
    config?: MutationConfig<typeof createMaterial>;
};

export const useCreateMaterial = ({ config }: UseCreateMaterialOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createMaterial,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["materials"] });
        },
        ...config,
    });
};
