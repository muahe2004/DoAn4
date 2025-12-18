import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_MATERIAL } from "../../../constants/config";

export interface MaterialDropdownResponse {
  id: string;
  material_name: string;
}

export interface Params {
  skip: number;
  limit: number;
  status?: string;
  search?: string;
}

const getDropdownMaterials = async (
  params: Params
): Promise<MaterialDropdownResponse[]> => {
  try {
    const res = await axios.get<MaterialDropdownResponse[]>(
      `${URL_API_MATERIAL}/drop-down`,
      {
        params,
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error("Unexpected error");
  }
};

export const useGetDropdownMaterials = (params: Params) => {
  return useQuery<MaterialDropdownResponse[], AxiosError<{ detail?: string }>>({
    queryKey: ["materials", params],
    queryFn: () => getDropdownMaterials(params),
  });
};
