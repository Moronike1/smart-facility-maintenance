import { Response } from "express";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { calculateMaintenancePriority } from "../utils/priority.util";
import {
  isValidMaintenanceStatusTransition,
} from "../utils/status.util";
import "dotenv/config";


const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const createMaintenanceRequest = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const {
      assetId,
      category,
      description,
      imageUrl,
      severity,
      operationalImpact,
      urgency,
    } = req.body;

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!category || !description || !severity) {
      return res.status(400).json({
        message: "Category, description and severity are required",
      });
    }

    if (assetId !== undefined && assetId !== null) {
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
    }

    const impact = operationalImpact
  ? Number(operationalImpact)
  : 1;

const urgencyScore = urgency
  ? Number(urgency)
  : 1;

const priority = calculateMaintenancePriority(
  severity,
  impact,
  urgencyScore
);

    const requestNumber = `MR-${Date.now()}`;

    const request = await prisma.maintenanceRequest.create({
      data: {
        requestNumber,

        user: {
          connect: {
            id: req.user.userId,
          },
        },

        asset:
          assetId !== undefined && assetId !== null
            ? {
                connect: {
                  id: Number(assetId),
                },
              }
            : undefined,

        category,
        description,
        imageUrl,
        severity,
operationalImpact: impact,
urgency: urgencyScore,
priority,
      },
    });

    return res.status(201).json({
      message: "Maintenance request submitted successfully",
      request,
    });
  } catch (error) {
    console.error("Create maintenance request error:", error);

    return res.status(500).json({
      message:
        "An error occurred while submitting the maintenance request",
    });
  }
};

export const getMaintenanceRequests = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const requests = await prisma.maintenanceRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        asset: {
          include: {
            facility: true,
          },
        },
        workOrder: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Maintenance requests retrieved successfully",
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get maintenance requests error:", error);

    return res.status(500).json({
      message: "An error occurred while retrieving maintenance requests",
    });
  }
};

export const getMaintenanceRequestById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid maintenance request ID",
      });
    }

    const request = await prisma.maintenanceRequest.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        asset: {
          include: {
            facility: true,
            maintenanceHistory: true,
            preventiveMaintenance: true,
          },
        },
        workOrder: true,
      },
    });

    if (!request) {
      return res.status(404).json({
        message: "Maintenance request not found",
      });
    }

    return res.status(200).json({
      message: "Maintenance request retrieved successfully",
      request,
    });
  } catch (error) {
    console.error("Get maintenance request by ID error:", error);

    return res.status(500).json({
      message:
        "An error occurred while retrieving the maintenance request",
    });
  }
};

export const updateMaintenanceRequest = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid maintenance request ID",
      });
    }

    const existingRequest =
      await prisma.maintenanceRequest.findUnique({
        where: { id },
      });

    if (!existingRequest) {
      return res.status(404).json({
        message: "Maintenance request not found",
      });
    }

    const {
      category,
      description,
      imageUrl,
      severity,
      operationalImpact,
      urgency,
      status,
    } = req.body;

    const updatedSeverity = severity ?? existingRequest.severity;

    const updatedImpact =
      operationalImpact !== undefined
        ? Number(operationalImpact)
        : existingRequest.operationalImpact;

    const updatedUrgency =
      urgency !== undefined
        ? Number(urgency)
        : existingRequest.urgency;

    const priority = calculateMaintenancePriority(
      updatedSeverity,
      updatedImpact,
      updatedUrgency
    );

    if (status !== undefined) {
  const validTransition =
    isValidMaintenanceStatusTransition(
      existingRequest.status,
      status
    );

  if (!validTransition) {
    return res.status(400).json({
      message: `Invalid status transition from ${existingRequest.status} to ${status}`,
    });
  }
}

    const updatedRequest =
      await prisma.maintenanceRequest.update({
        where: { id },
        data: {
          category: category ?? existingRequest.category,
          description:
            description ?? existingRequest.description,
          imageUrl:
            imageUrl !== undefined
              ? imageUrl
              : existingRequest.imageUrl,
          severity: updatedSeverity,
          operationalImpact: updatedImpact,
          urgency: updatedUrgency,
          priority,
          status: status ?? existingRequest.status,
        },
      });

    return res.status(200).json({
      message: "Maintenance request updated successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error(
      "Update maintenance request error:",
      error
    );

    return res.status(500).json({
      message:
        "An error occurred while updating the maintenance request",
    });
  }
};