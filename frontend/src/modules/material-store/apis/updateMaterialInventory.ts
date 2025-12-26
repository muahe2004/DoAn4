import axios from "axios";
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { BASE_API_URL } from "../../../constants/config";
import type { IMaterialInventory, MaterialInventoryUpdate } from "../types";

interface UpdateMaterialInventoryParams {
  id: string;
  data: MaterialInventoryUpdate;
}

const updateMaterialInventory = async ({
  id,
  data,
}: UpdateMaterialInventoryParams): Promise<IMaterialInventory> => {
  const response = await axios.put(
    `${BASE_API_URL}/material-inventorys/${id}`,
    data,
    {
      withCredentials: true,
    }
  );
  return response.data;
};

export const useUpdateMaterialInventory = (
  config?: UseMutationOptions<
    IMaterialInventory,
    Error,
    UpdateMaterialInventoryParams
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMaterialInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-inventorys"] });
    },
    ...config,
  });
};
