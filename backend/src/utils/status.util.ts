import {
  MaintenanceStatus,
} from "../../generated/prisma/client";

const allowedTransitions: Record<
  MaintenanceStatus,
  MaintenanceStatus[]
> = {
  PENDING: ["APPROVED", "CANCELLED"],
  APPROVED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const isValidMaintenanceStatusTransition = (
  currentStatus: MaintenanceStatus,
  newStatus: MaintenanceStatus
): boolean => {
  if (currentStatus === newStatus) {
    return true;
  }

  return allowedTransitions[currentStatus].includes(newStatus);
};