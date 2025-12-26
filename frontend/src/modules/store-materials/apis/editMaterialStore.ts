import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_MATERIAL_STORE } from "../../../constants/config";
import type { IMaterialStore } from "../types/index";

interface EditMaterialStoreParams {
    id: string;
    data: IMaterialStore;
}

const editMaterialStore = async ({ id, data }: EditMaterialStoreParams) => {
    const res = await axios.patch(`${URL_API_MATERIAL_STORE}/${id}`, data, {
        withCredentials: true,
    });
    return res.data;
};

export const useEditMaterialStore = ({}: {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: editMaterialStore,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["material-stores"] });
        },
    });
};
