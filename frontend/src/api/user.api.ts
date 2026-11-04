
import api from "./axios";

export interface Technician {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
}

export const getTechnicians = async (): Promise<Technician[]> => {
  const response = await api.get("/users/technicians");
  return response.data.technicians;
};
