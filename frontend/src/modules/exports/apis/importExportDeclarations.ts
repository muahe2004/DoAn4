import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { URL_API_EXPORTS } from "../../../constants/config";
import type { IExportCreatePayload, IExportDeclarationHeader } from "../types";

interface ImportPayload {
  declarations: IExportCreatePayload[];
}

const importExportDeclarations = async (
  payload: ImportPayload,
): Promise<IExportDeclarationHeader[]> => {
  const response = await axios.post<IExportDeclarationHeader[]>(`${URL_API_EXPORTS}/import`, payload, {
    withCredentials: true,
  });
  return response.data;
};

export const useImportExportDeclarations = () => {
  return useMutation<IExportDeclarationHeader[], AxiosError, ImportPayload>({
    mutationFn: importExportDeclarations,
  });
};
