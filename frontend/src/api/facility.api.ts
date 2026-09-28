import api from "./axios";

export interface Facility {
  id: number;
  name: string;
  location: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFacilityData {
  name: string;
  location: string;
  description?: string;
}

export interface UpdateFacilityData {
  name: string;
  location: string;
  description?: string;
}

export const getFacilities = async (): Promise<Facility[]> => {
  const response = await api.get("/facilities");

  return response.data.facilities;
};

export const getFacilityById = async (
  id: number
): Promise<Facility> => {
  const response = await api.get(`/facilities/${id}`);

  return response.data.facility;
};

export const createFacility = async (
  data: CreateFacilityData
): Promise<Facility> => {
  const response = await api.post("/facilities", data);

  return response.data.facility;
};

export const updateFacility = async (
  id: number,
  data: UpdateFacilityData
): Promise<Facility> => {
  const response = await api.put(`/facilities/${id}`, data);

  return response.data.facility;
};

export const deleteFacility = async (
  id: number
): Promise<void> => {
  await api.delete(`/facilities/${id}`);
};