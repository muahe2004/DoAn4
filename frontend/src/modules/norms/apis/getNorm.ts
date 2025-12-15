import { useQuery } from "@tanstack/react-query";
import { URL_API_NORM } from "../../../constants/config";
import type { INorm } from "../types";
import { apiClient } from "../../../lib/api";

const getNorm = async (id: string): Promise<INorm> => {
  const response = await apiClient.get(`${URL_API_NORM}/${id}`);
  return response.data;
};

export const useGetNorm = (id: string) => {
  return useQuery({
    queryKey: ["norm", id],
    queryFn: () => getNorm(id),
    enabled: !!id,
  });
};
