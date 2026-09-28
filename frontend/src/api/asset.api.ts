import api from "./axios";

export interface Asset {
  id: number;
  facilityId: number;
  name: string;
  category: string;
  serialNumber?: string | null;
  description?: string | null;
  installationDate?: string | null;
  condition: string;
  criticality: number;
  riskLevel: string;
  createdAt: string;
  updatedAt: string;

  facility?: {
    id: number;
    name: string;
    location: string;
  };
}

export interface CreateAssetData {
  facilityId: number;
  name: string;
  category: string;
  serialNumber?: string;
  description?: string;
  installationDate?: string;
  condition?: string;
  criticality?: number;
}

export interface UpdateAssetData {
  facilityId?: number;
  name?: string;
  category?: string;
  serialNumber?: string;
  description?: string;
  installationDate?: string;
  condition?: string;
  criticality?: number;
}

export const getAssets = async (): Promise<Asset[]> => {
  const response = await api.get("/assets");

  return response.data.assets;
};

export const getAssetById = async (
  id: number
): Promise<Asset> => {
  const response = await api.get(`/assets/${id}`);

  return response.data.asset;
};

export const createAsset = async (
  data: CreateAssetData
): Promise<Asset> => {
  const response = await api.post("/assets", data);

  return response.data.asset;
};

export const updateAsset = async (
  id: number,
  data: UpdateAssetData
): Promise<Asset> => {
  const response = await api.put(`/assets/${id}`, data);

  return response.data.asset;
};

export const deleteAsset = async (
  id: number
): Promise<void> => {
  await api.delete(`/assets/${id}`);
};

export const assessAssetRisk = async (
  id: number
): Promise<Asset> => {
  const response = await api.post(
    `/assets/${id}/assess-risk`
  );

  return response.data.asset;
};