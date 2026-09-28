import api from "./axios";

export interface DashboardSummary {
  totalFacilities: number;
  totalAssets: number;
  totalMaintenanceRequests: number;
  totalWorkOrders: number;
  totalPreventiveMaintenance: number;

  maintenanceRequestsByStatus: {
    pending: number;
    approved: number;
    assigned: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };

  workOrdersByStatus: {
    assigned: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };

  preventiveMaintenanceByStatus: {
    scheduled: number;
    inProgress: number;
    completed: number;
    overdue: number;
    cancelled: number;
  };

  assetsByRiskLevel: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };

  maintenanceRequestsByCategory: {
    electrical: number;
    plumbing: number;
    hvac: number;
    structural: number;
    security: number;
    cleaning: number;
    equipment: number;
    other: number;
  };

  maintenanceCosts: {
    totalMaintenanceCost: string | number;
    totalLabourCost: string | number;
    totalMaterialCost: string | number;
    totalOtherCost: string | number;
  };
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await api.get("/dashboard/summary");

  return response.data.summary;
};