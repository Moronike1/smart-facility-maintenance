import api from "./axios";

export interface MaintenanceRequest {
  id: number;
  requestNumber: string;
  userId: number;
  assetId?: number | null;

  category: string;
  description: string;
  imageUrl?: string | null;

  severity: string;
  operationalImpact: number;
  urgency: number;
  priority: string;
  status: string;

  createdAt: string;
  updatedAt: string;

  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
  };

  asset?: {
    id: number;
    name: string;
    category: string;
    facility?: {
      id: number;
      name: string;
      location: string;
    };
  };

  workOrder?: {
    id: number;
    status: string;
    assignedToId?: number | null;
    totalCost?: number | null;
  } | null;
}

export interface CreateMaintenanceRequestData {
  assetId?: number;
  category: string;
  description: string;
  imageUrl?: string;
  severity: string;
  operationalImpact?: number;
  urgency?: number;
}

export interface UpdateMaintenanceRequestData {
  category?: string;
  description?: string;
  imageUrl?: string;
  severity?: string;
  operationalImpact?: number;
  urgency?: number;
  status?: string;
}

export const getMaintenanceRequests = async (): Promise<
  MaintenanceRequest[]
> => {
  const response = await api.get("/maintenance-requests");
  return response.data.requests;
};

export const getMaintenanceRequestById = async (
  id: number
): Promise<MaintenanceRequest> => {
  const response = await api.get(`/maintenance-requests/${id}`);
  return response.data.request;
};

export const createMaintenanceRequest = async (
  data: CreateMaintenanceRequestData
): Promise<MaintenanceRequest> => {
  const response = await api.post("/maintenance-requests", data);
  return response.data.request;
};

export const updateMaintenanceRequest = async (
  id: number,
  data: UpdateMaintenanceRequestData
): Promise<MaintenanceRequest> => {
  const response = await api.put(
    `/maintenance-requests/${id}`,
    data
  );

  return response.data.request;
};