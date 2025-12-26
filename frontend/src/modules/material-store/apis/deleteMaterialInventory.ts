import axios from "axios";
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { BASE_API_URL } from "../../../constants/config";

interface DeleteMaterialInventoryParams {
  id: string;
}

interface DeleteMaterialInventoryResponse {
  message: string;
  id: string;
}

const deleteMaterialInventory = async ({
  id,
}: DeleteMaterialInventoryParams): Promise<DeleteMaterialInventoryResponse> => {
  const response = await axios.delete(
    `${BASE_API_URL}/material-inventorys/${id}`,
    {
      withCredentials: true,
    }
  );
  return response.data;
};

export const useDeleteMaterialInventory = (
  config?: UseMutationOptions<
    DeleteMaterialInventoryResponse,
    Error,
    DeleteMaterialInventoryParams
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMaterialInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-inventorys"] });
      queryClient.refetchQueries({ queryKey: ["material-inventorys"] });
    },
    ...config,
  });
};
