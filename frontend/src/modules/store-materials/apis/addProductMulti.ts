import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_PRODUCT } from "../../../constants/config";
import type { IMultiProductCreate } from "../types";
import type { MutationConfig } from "src/lib/react-query";
import { apiClient } from "../../../lib/api";

const createProductMulti = async (data: IMultiProductCreate): Promise<any> => {
    const response = await apiClient.post(`${URL_API_PRODUCT}/multi`, data);
    return response.data;
};

type UseCreateProductMultiOptions = {
    config?: MutationConfig<typeof createProductMulti>;
};

export const useCreateProductMulti = ({ config }: UseCreateProductMultiOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createProductMulti,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["products"],
            });
        },
        ...config,
    });
};