
import api from "./axios";

export type PreventiveMaintenanceStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "OVERDUE"
  | "CANCELLED";

export interface PreventiveMaintenanceRecord {
  id: number;
  assetId: number;
  scheduledDate: string;
  frequency: string;
  description: string;
  status: PreventiveMaintenanceStatus;
  completedDate: string | null;
  createdAt: string;
  updatedAt: string;
  asset?: {
    id: number;
    name: string;
    facility?: {
      id: number;
      name: string;
      location?: string;
    };
  };
}

export interface CreatePreventiveMaintenanceData {
  assetId: number;
  scheduledDate: string;
  frequency: string;
  description: string;
}

export const getPreventiveMaintenances = async (): Promise<
  PreventiveMaintenanceRecord[]
> => {
  const response = await api.get("/preventive-maintenance");
  return response.data.preventiveMaintenances;
};

export const createPreventiveMaintenance = async (
  data: CreatePreventiveMaintenanceData
): Promise<PreventiveMaintenanceRecord> => {
  const response = await api.post("/preventive-maintenance", data);
  return response.data.preventiveMaintenance;
};

export const updatePreventiveMaintenanceStatus = async (
  id: number,
  status: PreventiveMaintenanceStatus
): Promise<PreventiveMaintenanceRecord> => {
  const response = await api.put(
    `/preventive-maintenance/${id}/status`,
    { status }
  );

  return response.data.preventiveMaintenance;
};

export const checkOverduePreventiveMaintenance = async (): Promise<{
  message: string;
  overdueCount: number;
}> => {
  const response = await api.post("/preventive-maintenance/check-overdue");
  return response.data;
};
