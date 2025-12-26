import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_IMPORT_DECLARATION } from "../../../constants/config";
import type { ImportDeclarationCreatePayload } from "../types";
import type { MutationConfig } from "src/lib/react-query";
import { apiClient } from "../../../lib/api";

const createImportDeclaration = async (
    data: ImportDeclarationCreatePayload
): Promise<any> => {
    const response = await apiClient.post(`${URL_API_IMPORT_DECLARATION}`, data);
    return response.data;
};

type UseCreateImportDeclarationOptions = {
    config?: MutationConfig<typeof createImportDeclaration>;
};

export const useCreateImportDeclaration = ({
    config,
}: UseCreateImportDeclarationOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createImportDeclaration,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["import-declarations"],
            });
        },
        ...config,
    });
};
