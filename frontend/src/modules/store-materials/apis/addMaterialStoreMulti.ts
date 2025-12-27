import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_MATERIAL_STORE } from "../../../constants/config";
import type { IMaterialStore } from "../types/index";

interface MultiMaterialStoreCreate {
    material_stores: IMaterialStore[];
}

const addMaterialStoreMulti = async (data: MultiMaterialStoreCreate) => {
    const res = await axios.post(`${URL_API_MATERIAL_STORE}/multi`, data, {
        withCredentials: true,
    });
    return res.data;
};

export const useCreateMaterialStoreMulti = ({}: {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addMaterialStoreMulti,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["material-stores"] });
        },
    });
};
