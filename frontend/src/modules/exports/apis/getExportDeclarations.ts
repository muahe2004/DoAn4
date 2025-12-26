import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_EXPORTS } from "../../../constants/config";
import type { IExportDeclarationListResponse } from "../types";

export interface IExportDeclarationsParams {
  skip: number;
  limit: number;
  search?: string;
  start_date?: string;
  end_date?: string;
}

const getExportDeclarations = async (
  params: IExportDeclarationsParams,
): Promise<IExportDeclarationListResponse> => {
  const response = await axios.get<IExportDeclarationListResponse>(`${URL_API_EXPORTS}`, {
    params,
    withCredentials: true,
  });
  return response.data;
};

export const useGetExportDeclarations = (params: IExportDeclarationsParams) => {
  return useQuery<IExportDeclarationListResponse, AxiosError>({
    queryKey: ["exports", params],
    queryFn: () => getExportDeclarations(params),
  });
};
