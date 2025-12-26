import { apiClient } from "../../../lib/api";
import type {
  IMaterialDropdown,
  IStoreDropdown,
  IUnitDropdown,
} from "../types";

export const getMaterialsDropdown = async (): Promise<IMaterialDropdown[]> => {
  const response = await apiClient.get("/materials/drop-down?limit=1000");
  return response.data.map((material: any) => ({
    id: material.id,
    material_name: material.material_name,
  }));
};

export const getStoresDropdown = async (): Promise<IStoreDropdown[]> => {
  const response = await apiClient.get("/stores?limit=1000");
  return response.data.data.map((store: any) => ({
    id: store.id,
    store_code: store.store_code,
    store_name: store.store_name,
  }));
};

export const getUnitsDropdown = async (): Promise<IUnitDropdown[]> => {
  const response = await apiClient.get("/units?limit=1000");
  return response.data.data.map((unit: any) => ({
    id: unit.id,
    unit_name: unit.unit_name,
  }));
};
