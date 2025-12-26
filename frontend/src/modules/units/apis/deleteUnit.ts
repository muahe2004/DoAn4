import axios from "axios";
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { URL_API_UNIT } from "../../../constants/config";

interface DeleteUnitParams {
  id: string;
}

interface DeleteUnitResponse {
  message: string;
  id: string;
}

const deleteUnit = async ({
  id,
}: DeleteUnitParams): Promise<DeleteUnitResponse> => {
  const response = await axios.delete(`${URL_API_UNIT}/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

export const useDeleteUnit = (
  config?: UseMutationOptions<DeleteUnitResponse, Error, DeleteUnitParams>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
    ...config,
  });
};
