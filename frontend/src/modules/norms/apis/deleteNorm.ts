import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_NORM } from "../../../constants/config";
import { apiClient } from "../../../lib/api";

interface NormDeleteResponse {
  message: string;
  id: string;
}

const deleteNorms = async (
  normIds: string[]
): Promise<NormDeleteResponse[]> => {
  const response = await apiClient.delete(`${URL_API_NORM}`, {
    data: normIds,
  });
  return response.data;
};

export const useDeleteNorms = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNorms,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["norms"],
      });
    },
  });
};
