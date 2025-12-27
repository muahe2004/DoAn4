import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_PRODUCT } from "../../../constants/config";
import type { IProduct } from "../types";
import type { MutationConfig } from "src/lib/react-query";
import { apiClient } from "../../../lib/api";

const createProduct = async (data: IProduct): Promise<any> => {
    const response = await apiClient.post(`${URL_API_PRODUCT}`, data);  
    return response.data;
}

type UseCreateProductOptions = {
    config?: MutationConfig<typeof createProduct>
}

export const useCreateProduct = ({ config }: UseCreateProductOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createProduct,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["products"],
            })
        },
        ...config
    })
}