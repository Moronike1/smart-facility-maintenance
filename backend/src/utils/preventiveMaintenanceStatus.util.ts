import {
  PreventiveMaintenanceStatus,
} from "../../generated/prisma/client";

const allowedTransitions: Record<
  PreventiveMaintenanceStatus,
  PreventiveMaintenanceStatus[]
> = {
  SCHEDULED: ["IN_PROGRESS", "CANCELLED", "OVERDUE"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  OVERDUE: ["IN_PROGRESS", "CANCELLED"],
  CANCELLED: [],
};

export const isValidPreventiveMaintenanceStatusTransition = (
  currentStatus: PreventiveMaintenanceStatus,
  newStatus: PreventiveMaintenanceStatus
): boolean => {
  if (currentStatus === newStatus) {
    return true;
  }

  return allowedTransitions[currentStatus].includes(newStatus);
};