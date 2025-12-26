import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_NORM } from "../../../../constants/config";
import type { NormDropdownResponse } from "../types/index";

export interface Params {
  skip: number;
  limit: number;
}

const getDropdownNorms = async (
  params: Params
): Promise<NormDropdownResponse[]> => {
  try {
    const res = await axios.get<NormDropdownResponse[]>(
      `${URL_API_NORM}/drop-down`,
      {
        params,
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error("Unexpected error");
  }
};

export const useGetDropdownNorms = (params: Params) => {
  return useQuery<NormDropdownResponse[], AxiosError<{ detail?: string }>>({
    queryKey: ["norms", params],
    queryFn: () => getDropdownNorms(params),
  });
};
