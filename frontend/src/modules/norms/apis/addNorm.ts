import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_NORM } from "../../../constants/config";
import type { INorm } from "../types";
import type { MutationConfig } from "src/lib/react-query";
import { apiClient } from "../../../lib/api";

const createNorm = async (data: INorm): Promise<INorm> => {
  const response = await apiClient.post(`${URL_API_NORM}`, data);
  return response.data;
};

type UseCreateNormOptions = {
  config?: MutationConfig<typeof createNorm>;
};

export const useCreateNorm = ({ config }: UseCreateNormOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNorm,
    onMutate: () => {},
    onError: () => {},
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["norms"],
      });
    },
    ...config,
  });
};
