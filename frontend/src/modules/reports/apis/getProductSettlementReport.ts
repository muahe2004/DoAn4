import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_SETTLEMENT_REPORT } from "../../../constants/config";
import type { ProductSettlementResponse } from "../types";

export interface ProductSettlementParams {
  skip: number;
  limit: number;
  search?: string;
}

const getProductSettlementReport = async (
  params: ProductSettlementParams
): Promise<ProductSettlementResponse> => {
  const response = await axios.get<ProductSettlementResponse>(
    `${URL_API_SETTLEMENT_REPORT}/product-inventory`,
    {
      params,
      withCredentials: true,
    }
  );
  return response.data;
};

export const useGetProductSettlementReport = (
  params: ProductSettlementParams
) => {
  return useQuery<ProductSettlementResponse, AxiosError<{ detail?: string }>>({
    queryKey: ["product-settlement-report", params],
    queryFn: () => getProductSettlementReport(params),
  });
};
