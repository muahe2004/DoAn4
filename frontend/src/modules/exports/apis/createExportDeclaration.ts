import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { URL_API_EXPORTS } from "../../../constants/config";
import type { IExportCreatePayload, IExportDetailView } from "../types";

const createExportDeclaration = async (
  payload: IExportCreatePayload,
): Promise<IExportDetailView> => {
  const response = await axios.post<IExportDetailView>(`${URL_API_EXPORTS}`, payload, {
    withCredentials: true,
  });
  return response.data;
};

export const useCreateExportDeclaration = () => {
  return useMutation<IExportDetailView, AxiosError, IExportCreatePayload>({
    mutationFn: createExportDeclaration,
  });
};
