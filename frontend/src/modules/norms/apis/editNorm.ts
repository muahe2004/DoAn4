import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { URL_API_NORM } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { INorm } from "../types";

export type NormEditDto = Partial<INorm>;

export type EditNormResponse = INorm;

const editNorm = async (
  id: string,
  data: NormEditDto
): Promise<EditNormResponse> => {
  const response = await apiClient.patch(`${URL_API_NORM}/${id}`, data);
  return response.data;
};

export const useEditNorm = (
  config?: UseMutationOptions<
    EditNormResponse,
    Error,
    { id: string; data: NormEditDto }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => editNorm(id, data),
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: ["norms"] });
      config?.onSuccess?.(data, variables, context, mutation);
    },
    ...config,
  });
};
