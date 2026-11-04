
import api from "./axios";

export interface MaintenanceHistoryRecord {
  id: number;
  assetId: number;
  workOrderId: number;
  description: string;
  maintenanceDate: string;
  cost: number | string | null;
  remarks: string | null;
  createdAt: string;
  asset: {
  id: number;
  name: string;
  category: string;
  facility: {
    id: number;
    name: string;
  };
};
  workOrder: {
    id: number;
    workOrderNumber: string;
    status: string;
    completedDate: string | null;
    totalCost: number | string | null;
    request: {
      requestNumber: string;
      description: string;
    };
  };
}

export const getMaintenanceHistory = async (): Promise<
  MaintenanceHistoryRecord[]
> => {
  const response = await api.get("/maintenance-history");
  return response.data.history;
};
