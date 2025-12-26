import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { URL_API_EXPORTS } from "../../../constants/config";
import type { IExportCreatePayload, IExportDetailView } from "../types";

interface UpdatePayload {
  id: string;
  data: IExportCreatePayload;
}

const updateExportDeclaration = async ({ id, data }: UpdatePayload): Promise<IExportDetailView> => {
  const response = await axios.patch<IExportDetailView>(`${URL_API_EXPORTS}/${id}`, data, {
    withCredentials: true,
  });
  return response.data;
};

export const useUpdateExportDeclaration = () => {
  return useMutation<IExportDetailView, AxiosError, UpdatePayload>({
    mutationFn: updateExportDeclaration,
  });
};
