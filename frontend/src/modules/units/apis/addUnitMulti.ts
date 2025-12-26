import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_UNIT } from "../../../constants/config";
import type { IMultiUnitCreate } from "../types";
import type { MutationConfig } from "src/lib/react-query";
import { apiClient } from "../../../lib/api";

const createUnitMulti = async (data: IMultiUnitCreate): Promise<any> => {
    const response = await apiClient.post(`${URL_API_UNIT}/multi`, data);  
    return response.data;
}

type UseCreateUnitMultiOptions = {
    config?: MutationConfig<typeof createUnitMulti>
}

export const useCreateUnitMulti = ({ config }: UseCreateUnitMultiOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUnitMulti,
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