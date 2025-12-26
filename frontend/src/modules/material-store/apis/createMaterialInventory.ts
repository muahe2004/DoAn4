import axios from "axios";
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { BASE_API_URL } from "../../../constants/config";
import type { IMaterialInventory, MaterialInventoryCreate } from "../types";

const createMaterialInventory = async (
  data: MaterialInventoryCreate
): Promise<IMaterialInventory> => {
  const response = await axios.post(
    `${BASE_API_URL}/material-inventorys`,
    data,
    {
      withCredentials: true,
    }
  );
  return response.data;
};

export const useCreateMaterialInventory = (
  config?: UseMutationOptions<
    IMaterialInventory,
    Error,
    MaterialInventoryCreate
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMaterialInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-inventorys"] });
    },
    ...config,
  });
};
