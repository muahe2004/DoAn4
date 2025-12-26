import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { URL_API_EXPORTS } from "../../../constants/config";
import type { IExportDetailView } from "../types";

const postExportDeclaration = async (id: string): Promise<IExportDetailView> => {
  const response = await axios.post<IExportDetailView>(`${URL_API_EXPORTS}/${id}/post`, null, {
    withCredentials: true,
  });
  return response.data;
};

export const usePostExportDeclaration = () => {
  return useMutation<IExportDetailView, AxiosError, string>({
    mutationFn: postExportDeclaration,
  });
};
