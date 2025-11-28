import axios, {AxiosError} from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_PRODUCT } from "../../../constants/config";
import type { IProductResponse } from "../types/index";

export interface ProductListResponse {
  total: number;
  data: IProductResponse[];
}

export interface Params {
  skip: number;
  limit: number;
}

const getProducts = async (params: Params): Promise<ProductListResponse> => {
  try {
    const res = await axios.get<ProductListResponse>(
      `${URL_API_PRODUCT}`,
      {
        params, 
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error('Unexpected error');
  }
};

export const useGetProducts = (params: Params) => {
  return useQuery<ProductListResponse, AxiosError<{ detail?: string }>>({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
  });
};