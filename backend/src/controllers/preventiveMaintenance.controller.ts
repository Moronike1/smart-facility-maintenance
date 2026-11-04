import { Response } from "express";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import {
  PrismaClient,
  PreventiveMaintenanceStatus,
} from "../../generated/prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { isValidPreventiveMaintenanceStatusTransition } from "../utils/preventiveMaintenanceStatus.util";
import { getPreventiveMaintenanceStatus } from "../utils/preventiveMaintenanceOverdue.util";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const createPreventiveMaintenance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { assetId, scheduledDate, frequency, description } = req.body;

    const allowedFrequencies = [
  "WEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "BIANNUALLY",
  "ANNUALLY",
];

if (
  typeof frequency !== "string" ||
  !allowedFrequencies.includes(frequency.toUpperCase())
) {
  return res.status(400).json({
    message:
      "Frequency must be WEEKLY, MONTHLY, QUARTERLY, BIANNUALLY or ANNUALLY",
  });
}

    if (!assetId || !scheduledDate || !frequency || !description) {
      return res.status(400).json({
        message:
          "Asset ID, scheduled date, frequency and description are required",
      });
    }

    const numericAssetId = Number(assetId);
    if (!Number.isInteger(numericAssetId) || numericAssetId <= 0) {
      return res.status(400).json({ message: "Invalid asset ID" });
    }

    const asset = await prisma.asset.findUnique({
      where: { id: numericAssetId },
    });

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const scheduledDateValue = new Date(scheduledDate);
    if (Number.isNaN(scheduledDateValue.getTime())) {
      return res.status(400).json({ message: "Invalid scheduled date" });
    }

    const preventiveMaintenance = await prisma.preventiveMaintenance.create({
      data: {
        asset: { connect: { id: numericAssetId } },
        scheduledDate: scheduledDateValue,
        frequency,
        description,
      },
    });

    return res.status(201).json({
      message: "Preventive maintenance scheduled successfully",
      preventiveMaintenance,
    });
  } catch (error) {
    console.error("Create preventive maintenance error:", error);
    return res.status(500).json({
      message: "An error occurred while scheduling preventive maintenance",
    });
  }
};

export const getPreventiveMaintenances = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const preventiveMaintenances = await prisma.preventiveMaintenance.findMany({
      include: { asset: { include: { facility: true } } },
      orderBy: { scheduledDate: "asc" },
    });

    return res.status(200).json({
      message: "Preventive maintenance records retrieved successfully",
      count: preventiveMaintenances.length,
      preventiveMaintenances,
    });
  } catch (error) {
    console.error("Get preventive maintenances error:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving preventive maintenance records",
    });
  }
};

export const getPreventiveMaintenanceById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid preventive maintenance ID" });
    }

    const preventiveMaintenance = await prisma.preventiveMaintenance.findUnique({
      where: { id },
      include: {
        asset: {
          include: { facility: true, maintenanceHistory: true },
        },
      },
    });

    if (!preventiveMaintenance) {
      return res.status(404).json({ message: "Preventive maintenance record not found" });
    }

    return res.status(200).json({
      message: "Preventive maintenance record retrieved successfully",
      preventiveMaintenance,
    });
  } catch (error) {
    console.error("Get preventive maintenance by ID error:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving the preventive maintenance record",
    });
  }
};

const getNextScheduledDate = (
  scheduledDate: Date,
  frequency: string
): Date | null => {
  const nextDate = new Date(scheduledDate);

  switch (frequency.toUpperCase()) {
    case "WEEKLY":
      nextDate.setDate(nextDate.getDate() + 7);
      return nextDate;
    case "MONTHLY":
      return addCalendarMonths(nextDate, 1);
    case "QUARTERLY":
      return addCalendarMonths(nextDate, 3);
    case "BIANNUALLY":
      return addCalendarMonths(nextDate, 6);
    case "ANNUALLY":
      return addCalendarMonths(nextDate, 12);
    default:
      return null;
  }
};

const addCalendarMonths = (date: Date, months: number): Date => {
  const originalDay = date.getDate();
  const target = new Date(date);
  target.setDate(1);
  target.setMonth(target.getMonth() + months);

  const lastDayOfTargetMonth = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0
  ).getDate();

  target.setDate(Math.min(originalDay, lastDayOfTargetMonth));
  return target;
};

export const updatePreventiveMaintenanceStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid preventive maintenance ID" });
    }

    const allowedStatuses: PreventiveMaintenanceStatus[] = [
      "SCHEDULED",
      "IN_PROGRESS",
      "COMPLETED",
      "OVERDUE",
      "CANCELLED",
    ];

    if (
      typeof status !== "string" ||
      !allowedStatuses.includes(status as PreventiveMaintenanceStatus)
    ) {
      return res.status(400).json({
        message: "A valid preventive maintenance status is required",
      });
    }

    const validatedStatus = status as PreventiveMaintenanceStatus;
    const preventiveMaintenance = await prisma.preventiveMaintenance.findUnique({
      where: { id },
    });

    if (!preventiveMaintenance) {
      return res.status(404).json({
        message: "Preventive maintenance record not found",
      });
    }

    const validTransition = isValidPreventiveMaintenanceStatusTransition(
      preventiveMaintenance.status,
      validatedStatus
    );

    if (!validTransition) {
      return res.status(400).json({
        message:
          `Invalid preventive maintenance status transition from ${preventiveMaintenance.status} to ${validatedStatus}`,
      });
    }

    const isNewCompletion =
      validatedStatus === "COMPLETED" &&
      preventiveMaintenance.status !== "COMPLETED";

    const result = await prisma.$transaction(async (tx) => {
      // Only allow the update if the status is still what we originally read.
      // This prevents two concurrent completion requests from both creating
      // the next scheduled occurrence.
      const claimed = await tx.preventiveMaintenance.updateMany({
        where: {
          id,
          status: preventiveMaintenance.status,
        },
        data: {
          status: validatedStatus,
          completedDate: isNewCompletion
            ? new Date()
            : preventiveMaintenance.completedDate,
        },
      });

      if (claimed.count === 0) {
        return {
          conflict: true as const,
          updatedPreventiveMaintenance: null,
          nextPreventiveMaintenance: null,
        };
      }

      const updatedPreventiveMaintenance =
        await tx.preventiveMaintenance.findUniqueOrThrow({
          where: { id },
        });

      const nextScheduledDate = isNewCompletion
        ? getNextScheduledDate(
            preventiveMaintenance.scheduledDate,
            preventiveMaintenance.frequency
          )
        : null;

      const nextPreventiveMaintenance = nextScheduledDate
        ? await tx.preventiveMaintenance.create({
            data: {
              assetId: preventiveMaintenance.assetId,
              scheduledDate: nextScheduledDate,
              frequency: preventiveMaintenance.frequency,
              description: preventiveMaintenance.description,
              status: "SCHEDULED",
            },
          })
        : null;

      return {
        conflict: false as const,
        updatedPreventiveMaintenance,
        nextPreventiveMaintenance,
      };
    });

    if (result.conflict) {
      return res.status(409).json({
        message:
          "This maintenance record was updated by another request. Refresh the page and try again.",
      });
    }


    return res.status(200).json({
      message: result.nextPreventiveMaintenance
        ? "Maintenance completed and next occurrence scheduled successfully"
        : "Preventive maintenance status updated successfully",
      preventiveMaintenance: result.updatedPreventiveMaintenance,
      nextPreventiveMaintenance: result.nextPreventiveMaintenance,
    });
  } catch (error) {
    console.error("Update preventive maintenance status error:", error);
    return res.status(500).json({
      message: "An error occurred while updating preventive maintenance status",
    });
  }
};

export const checkOverduePreventiveMaintenance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const records = await prisma.preventiveMaintenance.findMany({
      where: {
        status: "SCHEDULED",
        scheduledDate: { lt: new Date() },
      },
    });

    let updatedCount = 0;

    for (const record of records) {
      const newStatus = getPreventiveMaintenanceStatus(
        record.scheduledDate,
        record.status
      );

      if (newStatus !== record.status) {
        await prisma.preventiveMaintenance.update({
          where: { id: record.id },
          data: { status: newStatus },
        });
        updatedCount++;
      }
    }

    return res.status(200).json({
      message: "Overdue preventive maintenance check completed",
      overdueCount: updatedCount,
    });
  } catch (error) {
    console.error("Check overdue preventive maintenance error:", error);
    return res.status(500).json({
      message: "An error occurred while checking overdue preventive maintenance",
    });
  }
};
