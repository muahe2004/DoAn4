import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_NORM } from "../../../../constants/config";
import type { INormResponse } from "../types/index";

export interface NormListResponse {
  total: number;
  data: INormResponse[];
}

export interface Params {
  skip: number;
  limit: number;
}

const getNorms = async (params: Params): Promise<NormListResponse> => {
  try {
    const res = await axios.get<NormListResponse>(`${URL_API_NORM}`, {
      params,
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error("Unexpected error");
  }
};

export const useGetNorms = (params: Params) => {
  return useQuery<NormListResponse, AxiosError<{ detail?: string }>>({
    queryKey: ["norms", params],
    queryFn: () => getNorms(params),
  });
};
