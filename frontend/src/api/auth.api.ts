import api from "./axios";

export interface LoginResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    role: string;
    status: string;
  };
  token: string;
}

export const loginUser = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export interface ResidentRegistrationData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface ResidentRegistrationResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    role: string;
    status: string;
  };
}

export const registerResident = async (
  data: ResidentRegistrationData,
): Promise<ResidentRegistrationResponse> => {
  const response = await api.post("/auth/register", data);

  return response.data;
};
