import { PreventiveMaintenanceStatus } from "../../generated/prisma/client";

export const getPreventiveMaintenanceStatus = (
  scheduledDate: Date,
  currentStatus: PreventiveMaintenanceStatus
): PreventiveMaintenanceStatus => {
  if (
    currentStatus === "SCHEDULED" &&
    scheduledDate.getTime() < Date.now()
  ) {
    return "OVERDUE";
  }

  return currentStatus;
};