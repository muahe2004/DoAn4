import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_MATERIAL_STORE } from "../../../constants/config";
import type { IMaterialStore } from "../types/index";

const addMaterialStore = async (data: IMaterialStore) => {
    const res = await axios.post(`${URL_API_MATERIAL_STORE}`, data, {
        withCredentials: true,
    });
    return res.data;
};

export const useCreateMaterialStore = ({}: {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addMaterialStore,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["material-stores"] });
        },
    });
};
