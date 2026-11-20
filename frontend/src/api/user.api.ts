
import api from "./axios";

export interface Technician {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
}

export interface Resident {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role: string;
  status: string;
  createdAt: string;
}

export const getTechnicians = async (): Promise<Technician[]> => {
  const response = await api.get("/users/technicians");
  return response.data.technicians;
};

export const getPendingResidents = async (): Promise<Resident[]> => {
  const response = await api.get("/users/pending-residents");
  return response.data.residents;
};

export const getResidentsByStatus = async (
  status: "PENDING" | "ACTIVE" | "REJECTED"
): Promise<Resident[]> => {
  const response = await api.get("/users/residents", {
    params: { status },
  });

  return response.data.residents;
};

export const approveResident = async (id: number) => {
  const response = await api.put(`/users/${id}/approve`);
  return response.data;
};

export const rejectResident = async (id: number) => {
  const response = await api.put(`/users/${id}/reject`);
  return response.data;
};
