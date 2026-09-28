import { Response } from "express";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  isValidPreventiveMaintenanceStatusTransition,
} from "../utils/preventiveMaintenanceStatus.util";
import {
  getPreventiveMaintenanceStatus,
} from "../utils/preventiveMaintenanceOverdue.util";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const createPreventiveMaintenance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const {
      assetId,
      scheduledDate,
      frequency,
      description,
    } = req.body;

    if (
      !assetId ||
      !scheduledDate ||
      !frequency ||
      !description
    ) {
      return res.status(400).json({
        message:
          "Asset ID, scheduled date, frequency and description are required",
      });
    }

    const asset = await prisma.asset.findUnique({
      where: {
        id: Number(assetId),
      },
    });

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    const scheduledDateValue = new Date(scheduledDate);

    if (Number.isNaN(scheduledDateValue.getTime())) {
      return res.status(400).json({
        message: "Invalid scheduled date",
      });
    }

    const preventiveMaintenance =
      await prisma.preventiveMaintenance.create({
        data: {
          asset: {
            connect: {
              id: Number(assetId),
            },
          },
          scheduledDate: scheduledDateValue,
          frequency,
          description,
        },
      });

    return res.status(201).json({
      message:
        "Preventive maintenance scheduled successfully",
      preventiveMaintenance,
    });
  } catch (error) {
    console.error(
      "Create preventive maintenance error:",
      error
    );

    return res.status(500).json({
      message:
        "An error occurred while scheduling preventive maintenance",
    });
  }
};
export const getPreventiveMaintenances = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const preventiveMaintenances =
      await prisma.preventiveMaintenance.findMany({
        include: {
          asset: {
            include: {
              facility: true,
            },
          },
        },
        orderBy: {
          scheduledDate: "asc",
        },
      });

    return res.status(200).json({
      message:
        "Preventive maintenance records retrieved successfully",
      count: preventiveMaintenances.length,
      preventiveMaintenances,
    });
  } catch (error) {
    console.error(
      "Get preventive maintenances error:",
      error
    );

    return res.status(500).json({
      message:
        "An error occurred while retrieving preventive maintenance records",
    });
  }
};

export const getPreventiveMaintenanceById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid preventive maintenance ID",
      });
    }

    const preventiveMaintenance =
      await prisma.preventiveMaintenance.findUnique({
        where: {
          id,
        },
        include: {
          asset: {
            include: {
              facility: true,
              maintenanceHistory: true,
            },
          },
        },
      });

    if (!preventiveMaintenance) {
      return res.status(404).json({
        message: "Preventive maintenance record not found",
      });
    }

    return res.status(200).json({
      message:
        "Preventive maintenance record retrieved successfully",
      preventiveMaintenance,
    });
  } catch (error) {
    console.error(
      "Get preventive maintenance by ID error:",
      error
    );

    return res.status(500).json({
      message:
        "An error occurred while retrieving the preventive maintenance record",
    });
  }
};

export const updatePreventiveMaintenanceStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid preventive maintenance ID",
      });
    }

    if (!status) {
      return res.status(400).json({
        message:
          "Preventive maintenance status is required",
      });
    }

    const preventiveMaintenance =
      await prisma.preventiveMaintenance.findUnique({
        where: { id },
      });

    if (!preventiveMaintenance) {
      return res.status(404).json({
        message:
          "Preventive maintenance record not found",
      });
    }

    const validTransition =
      isValidPreventiveMaintenanceStatusTransition(
        preventiveMaintenance.status,
        status
      );

    if (!validTransition) {
      return res.status(400).json({
        message:
          `Invalid preventive maintenance status transition from ${preventiveMaintenance.status} to ${status}`,
      });
    }

    const completedDate =
      status === "COMPLETED"
        ? new Date()
        : preventiveMaintenance.completedDate;

    const updatedPreventiveMaintenance =
      await prisma.preventiveMaintenance.update({
        where: { id },
        data: {
          status,
          completedDate,
        },
      });

    return res.status(200).json({
      message:
        "Preventive maintenance status updated successfully",
      preventiveMaintenance:
        updatedPreventiveMaintenance,
    });
  } catch (error) {
    console.error(
      "Update preventive maintenance status error:",
      error
    );

    return res.status(500).json({
      message:
        "An error occurred while updating preventive maintenance status",
    });
  }
};

export const checkOverduePreventiveMaintenance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const records =
      await prisma.preventiveMaintenance.findMany({
        where: {
          status: "SCHEDULED",
          scheduledDate: {
            lt: new Date(),
          },
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
          where: {
            id: record.id,
          },
          data: {
            status: newStatus,
          },
        });

        updatedCount++;
      }
    }

    return res.status(200).json({
      message:
        "Overdue preventive maintenance check completed",
      overdueCount: updatedCount,
    });
  } catch (error) {
    console.error(
      "Check overdue preventive maintenance error:",
      error
    );

    return res.status(500).json({
      message:
        "An error occurred while checking overdue preventive maintenance",
    });
  }
};