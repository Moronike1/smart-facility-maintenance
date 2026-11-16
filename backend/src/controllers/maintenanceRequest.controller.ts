import { Response } from "express";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { calculateMaintenancePriority } from "../utils/priority.util";
import { isValidMaintenanceStatusTransition } from "../utils/status.util";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const createMaintenanceRequest = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const {
      assetId,
      locationType,
      locationDescription,
      category,
      description,
      imageUrl,
      severity,
      operationalImpact,
      urgency,
    } = req.body;

    if (!["PRIVATE_UNIT", "SHARED_FACILITY"].includes(locationType)) {
      return res.status(400).json({
        message: "A valid maintenance location type is required",
      });
    }

    if (
      typeof locationDescription !== "string" ||
      !locationDescription.trim()
    ) {
      return res.status(400).json({
        message: "Maintenance location description is required",
      });
    }

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

    const impact = operationalImpact ? Number(operationalImpact) : 1;

    const urgencyScore = urgency ? Number(urgency) : 1;

    const priority = calculateMaintenancePriority(
      severity,
      impact,
      urgencyScore,
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

        locationType,
        locationDescription: locationDescription.trim(),

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
      message: "An error occurred while submitting the maintenance request",
    });
  }
};

export const getMaintenanceRequests = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const isResident = req.user.role === "FACILITY_USER";

    const requests = await prisma.maintenanceRequest.findMany({
      where: isResident ? { userId: req.user.userId } : undefined,

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
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid maintenance request ID",
      });
    }

    const isResident = req.user.role === "FACILITY_USER";

    const request = await prisma.maintenanceRequest.findFirst({
      where: {
        id,
        ...(isResident ? { userId: req.user.userId } : {}),
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
      message: "An error occurred while retrieving the maintenance request",
    });
  }
};

export const updateMaintenanceRequest = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!["ADMIN", "FACILITY_MANAGER"].includes(req.user.role)) {
      return res.status(403).json({
        message: "You are not authorised to update maintenance requests",
      });
    }

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid maintenance request ID",
      });
    }

    const existingRequest = await prisma.maintenanceRequest.findUnique({
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
  statusReason,
  locationType,
  locationDescription,
} = req.body;
    if (
  locationType !== undefined &&
  !["PRIVATE_UNIT", "SHARED_FACILITY"].includes(locationType)
) {
  return res.status(400).json({
    message: "Invalid maintenance location type",
  });
}

if (
  locationDescription !== undefined &&
  (typeof locationDescription !== "string" ||
    !locationDescription.trim())
) {
  return res.status(400).json({
    message: "Maintenance location description cannot be empty",
  });
}

    const updatedSeverity = severity ?? existingRequest.severity;

    const updatedImpact =
      operationalImpact !== undefined
        ? Number(operationalImpact)
        : existingRequest.operationalImpact;

    const updatedUrgency =
      urgency !== undefined ? Number(urgency) : existingRequest.urgency;

    if (
      !Number.isFinite(updatedImpact) ||
      !Number.isFinite(updatedUrgency) ||
      updatedImpact < 1 ||
      updatedUrgency < 1
    ) {
      return res.status(400).json({
        message:
          "Operational impact and urgency must be valid positive numbers",
      });
    }

    const requiresReason = ["REJECTED", "CANCELLED"].includes(status);

if (status !== undefined && ["REJECTED", "CANCELLED"].includes(status)) {
  if (
    typeof statusReason !== "string" ||
    !statusReason.trim()
  ) {
    return res.status(400).json({
      message: "A reason is required when rejecting or cancelling a maintenance request",
    });
  }
}

    if (status !== undefined) {
      const validTransition = isValidMaintenanceStatusTransition(
        existingRequest.status,
        status,
      );

      if (!validTransition) {
        return res.status(400).json({
          message: `Invalid status transition from ${existingRequest.status} to ${status}`,
        });
      }
    }

    const priority = calculateMaintenancePriority(
      updatedSeverity,
      updatedImpact,
      updatedUrgency,
    );

    const updatedRequest = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        category: category ?? existingRequest.category,
        description: description ?? existingRequest.description,
        imageUrl: imageUrl !== undefined ? imageUrl : existingRequest.imageUrl,
        severity: updatedSeverity,
        operationalImpact: updatedImpact,
        urgency: updatedUrgency,
        priority,
       status: status ?? existingRequest.status,

statusReason:
  status !== undefined
    ? ["REJECTED", "CANCELLED"].includes(status)
      ? statusReason.trim()
      : null
    : existingRequest.statusReason,

locationType:
  locationType !== undefined
    ? locationType
    : existingRequest.locationType,

        locationDescription:
          locationDescription !== undefined
            ? locationDescription.trim()
            : existingRequest.locationDescription,
      },
    });

    return res.status(200).json({
      message: "Maintenance request updated successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Update maintenance request error:", error);

    return res.status(500).json({
      message: "An error occurred while updating the maintenance request",
    });
  }
};
