import axios, {AxiosError} from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_UNIT } from "../../../constants/config";
import type { UnitDropdownResponse } from "../types/index";

export interface Params {
  skip: number;
  limit: number;
}

const getDropdownUnits = async (params: Params): Promise<UnitDropdownResponse[]> => {
  try {
    const res = await axios.get<UnitDropdownResponse[]>(
      `${URL_API_UNIT}/drop-down`,
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
    throw new Error('Unexpected error');
  }
};

export const useGetDropdownUnits = (params: Params) => {
  return useQuery<UnitDropdownResponse[], AxiosError<{ detail?: string }>>({
    queryKey: ['units', params],
    queryFn: () => getDropdownUnits(params),
  });
};