import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_AUTH_LOGIN } from "../../../constants/config";
import { apiClient } from "../../../lib/api";
import type { UseMutationOptions } from "@tanstack/react-query";
import type { ILoginResponse } from "../types/index";

export const loginAuth = async ({
    data,
}: {
    data: ILoginResponse;
}): Promise<ILoginResponse> => {
    const response = await apiClient.post(
        `${URL_API_AUTH_LOGIN}`,
        data,
    );
    return response.data.data;
};

type UseLoginAuth = {
    config?: UseMutationOptions<
        ILoginResponse,
        unknown,
        Parameters<typeof loginAuth>[0],
        unknown
    >;
};

export const useLoginAuth = ({
    config,
}: UseLoginAuth = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: loginAuth,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["auth-login"],
            });
        },
        ...config,
    });
};
