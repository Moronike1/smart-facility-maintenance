import api from "./axios";

export interface LoginResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
  };
  token: string;
}

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};