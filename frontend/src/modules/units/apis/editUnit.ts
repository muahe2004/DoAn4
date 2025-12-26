import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { URL_API_UNIT } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { IUnit } from "../types";

export type UnitEditDto = Partial<IUnit>;

export type EditUnitResponse = IUnit;

const editUnit = async (
    id: string,
    data: UnitEditDto,
): Promise<EditUnitResponse> => {
    const response = await apiClient.patch(`${URL_API_UNIT}/${id}`, data);
    return response.data;
}

export const useEditUnit = (
    config?: UseMutationOptions<EditUnitResponse, Error, {id: string; data: UnitEditDto}>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, data}) => editUnit(id, data),
        onSuccess: (data, variables, context, mutation) => {
            queryClient.invalidateQueries({ queryKey: ["units"] });
            config?.onSuccess?.(data, variables, context, mutation);
        },
        ...config,
    });
}