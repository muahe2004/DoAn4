import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { BASE_API_URL } from "../../../constants/config";
import type {
  MaterialInventorysResponse,
  MaterialInventoryQueryParams,
} from "../types";

const getMaterialInventorys = async (
  params: MaterialInventoryQueryParams
): Promise<MaterialInventorysResponse> => {
  try {
    const response = await axios.get<MaterialInventorysResponse>(
      `${BASE_API_URL}/material-inventorys`,
      {
        params,
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error("Unexpected error");
  }
};

export const useGetMaterialInventorys = (
  params: MaterialInventoryQueryParams
) => {
  return useQuery<MaterialInventorysResponse, AxiosError<{ detail?: string }>>({
    queryKey: ["material-inventorys", params],
    queryFn: () => getMaterialInventorys(params),
  });
};
