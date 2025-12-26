import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_UNIT } from "../../../constants/config";
import type { IUnitResponse } from "../types/index";

export interface UnitListResponse {
  total: number;
  data: IUnitResponse[];
}

export interface Params {
  skip: number;
  limit: number;
  search?: string;
}

const getUnits = async (params: Params): Promise<UnitListResponse> => {
  try {
    const res = await axios.get<UnitListResponse>(`${URL_API_UNIT}`, {
      params,
      withCredentials: true,
    });
    return res.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error("Unexpected error");
  }
};

export const useGetUnits = (params: Params) => {
  return useQuery<UnitListResponse, AxiosError<{ detail?: string }>>({
    queryKey: ["units", params],
    queryFn: () => getUnits(params),
  });
};
