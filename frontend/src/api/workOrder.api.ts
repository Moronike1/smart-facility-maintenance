
import api from "./axios";

export interface WorkOrder {
  id: number;
  workOrderNumber: string;
  requestId: number;
  technicianId?: number | null;
  serviceProviderId?: number | null;
  assignedDate?: string | null;
  dueDate?: string | null;
  completedDate?: string | null;
  status: string;
  notes?: string | null;
  labourCost?: number | string | null;
  materialCost?: number | string | null;
  otherCost?: number | string | null;
  totalCost?: number | string | null;
  createdAt: string;
  updatedAt: string;

  request: {
    id: number;
    requestNumber: string;
    category: string;
    description: string;
    priority: string;
    status: string;
    asset?: {
      id: number;
      name: string;
      category: string;
      facility?: {
        id: number;
        name: string;
        location: string;
      };
    } | null;
    user?: {
      id: number;
      name: string;
      email: string;
    };
  };

  technician?: {
    id: number;
    name: string;
    email: string;
  } | null;

  serviceProvider?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface CreateWorkOrderData {
  requestId: number;
  technicianId?: number;
  serviceProviderId?: number;
  dueDate?: string;
  notes?: string;
}

export interface CompleteWorkOrderData {
  labourCost?: number;
  materialCost?: number;
  otherCost?: number;
  notes?: string;
}

export const getWorkOrders = async (): Promise<WorkOrder[]> => {
  const response = await api.get("/work-orders");
  return response.data.workOrders;
};

export const createWorkOrder = async (
  data: CreateWorkOrderData
): Promise<WorkOrder> => {
  const response = await api.post("/work-orders", data);
  return response.data.workOrder;
};

export const assignWorkOrder = async (
  id: number,
  data: {
    technicianId?: number;
    serviceProviderId?: number;
  }
): Promise<WorkOrder> => {
  const response = await api.put(`/work-orders/${id}/assign`, data);
  return response.data.workOrder;
};

export const updateWorkOrderStatus = async (
  id: number,
  status: string
): Promise<WorkOrder> => {
  const response = await api.put(`/work-orders/${id}/status`, {
    status,
  });
  return response.data.workOrder;
};

export const completeWorkOrder = async (
  id: number,
  data: CompleteWorkOrderData
): Promise<WorkOrder> => {
  const response = await api.put(`/work-orders/${id}/complete`, data);
  return response.data.workOrder;
};
