import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_UNIT } from "../../../constants/config";
import type { IUnit } from "../types";
import type { MutationConfig } from "src/lib/react-query";
import { apiClient } from "../../../lib/api";

const createUnit = async (data: IUnit): Promise<any> => {
    const response = await apiClient.post(`${URL_API_UNIT}`, data);  
    return response.data;
}

type UseCreateUnitOptions = {
    config?: MutationConfig<typeof createUnit>
}

export const useCreateUnit = ({ config }: UseCreateUnitOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUnit,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["units"],
            })
        },
        ...config
    })
}