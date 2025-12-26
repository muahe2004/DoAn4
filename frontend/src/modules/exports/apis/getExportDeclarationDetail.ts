import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_EXPORTS } from "../../../constants/config";
import type { IExportDetailView } from "../types";

const getExportDeclarationDetail = async (id: string): Promise<IExportDetailView> => {
  const response = await axios.get<IExportDetailView>(`${URL_API_EXPORTS}/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

export const useGetExportDeclarationDetail = (id: string | null) => {
  return useQuery<IExportDetailView, AxiosError>({
    queryKey: ["exports", "detail", id],
    queryFn: () => getExportDeclarationDetail(id!),
    enabled: Boolean(id),
  });
};
