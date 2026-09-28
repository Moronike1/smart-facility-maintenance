import {
  WorkOrderStatus,
} from "../../generated/prisma/client";

const allowedTransitions: Record<
  WorkOrderStatus,
  WorkOrderStatus[]
> = {
  ASSIGNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const isValidWorkOrderStatusTransition = (
  currentStatus: WorkOrderStatus,
  newStatus: WorkOrderStatus
): boolean => {
  if (currentStatus === newStatus) {
    return true;
  }

  return allowedTransitions[currentStatus].includes(newStatus);
};