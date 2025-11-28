import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { URL_API_PRODUCT } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { IProduct } from "../types";

export type ProductEditDto = Partial<IProduct>;

export type EditProductResponse = IProduct;

const editProduct = async (
    id: string,
    data: ProductEditDto,
): Promise<EditProductResponse> => {
    const response = await apiClient.patch(`${URL_API_PRODUCT}/${id}`, data);
    return response.data;
}

export const useEditProduct = (
    config?: UseMutationOptions<EditProductResponse, Error, {id: string; data: ProductEditDto}>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, data}) => editProduct(id, data),
        onSuccess: (data, variables, context, mutation) => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            config?.onSuccess?.(data, variables, context, mutation);
        },
        ...config,
    });
}