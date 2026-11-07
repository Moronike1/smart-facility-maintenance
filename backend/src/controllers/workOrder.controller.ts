import { Response } from "express";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { isValidWorkOrderStatusTransition } from "../utils/workOrderStatus.util";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const getWorkOrders = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const workOrders = await prisma.workOrder.findMany({
      include: {
        request: {
          include: {
            asset: {
              include: {
                facility: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        serviceProvider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        maintenanceHistory: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Work orders retrieved successfully",
      count: workOrders.length,
      workOrders,
    });
  } catch (error) {
    console.error("Get work orders error:", error);

    return res.status(500).json({
      message: "An error occurred while retrieving work orders",
    });
  }
};

export const createWorkOrder = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { requestId, technicianId, serviceProviderId, dueDate, notes } =
      req.body;

    if (!requestId) {
      return res.status(400).json({
        message: "Maintenance request ID is required",
      });
    }

    const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
      where: {
        id: Number(requestId),
      },
      include: {
        workOrder: true,
      },
    });

    if (!maintenanceRequest) {
      return res.status(404).json({
        message: "Maintenance request not found",
      });
    }

    if (maintenanceRequest.workOrder) {
      return res.status(409).json({
        message: "A work order already exists for this maintenance request",
      });
    }

    if (
      maintenanceRequest.status !== "APPROVED" &&
      maintenanceRequest.status !== "ASSIGNED"
    ) {
      return res.status(400).json({
        message:
          "A work order can only be created for an APPROVED or ASSIGNED maintenance request",
      });
    }

    // Validate technician if supplied.
    if (technicianId !== undefined && technicianId !== null) {
      const technician = await prisma.user.findUnique({
        where: {
          id: Number(technicianId),
        },
      });

      if (!technician) {
        return res.status(404).json({
          message: "Technician not found",
        });
      }

      if (technician.role !== "TECHNICIAN") {
        return res.status(400).json({
          message: "Selected user is not registered as a technician",
        });
      }
    }

    // Validate service provider if supplied.
    if (serviceProviderId !== undefined && serviceProviderId !== null) {
      const serviceProvider = await prisma.user.findUnique({
        where: {
          id: Number(serviceProviderId),
        },
      });

      if (!serviceProvider) {
        return res.status(404).json({
          message: "Service provider not found",
        });
      }

      if (serviceProvider.role !== "SERVICE_PROVIDER") {
        return res.status(400).json({
          message: "Selected user is not registered as a service provider",
        });
      }
    }

    const workOrderNumber = `WO-${Date.now()}`;

    const workOrder = await prisma.workOrder.create({
      data: {
        workOrderNumber,
        request: {
          connect: {
            id: maintenanceRequest.id,
          },
        },
        technician:
          technicianId !== undefined && technicianId !== null
            ? {
                connect: {
                  id: Number(technicianId),
                },
              }
            : undefined,
        serviceProvider:
          serviceProviderId !== undefined && serviceProviderId !== null
            ? {
                connect: {
                  id: Number(serviceProviderId),
                },
              }
            : undefined,
        assignedDate: new Date(),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        notes,
      },
    });

    // Move APPROVED request to ASSIGNED.
    // If it is already ASSIGNED, leave it unchanged.
    if (maintenanceRequest.status === "APPROVED") {
      await prisma.maintenanceRequest.update({
        where: {
          id: maintenanceRequest.id,
        },
        data: {
          status: "ASSIGNED",
        },
      });
    }

    return res.status(201).json({
      message: "Work order created successfully",
      workOrder,
    });
  } catch (error) {
    console.error("Create work order error:", error);

    return res.status(500).json({
      message: "An error occurred while creating the work order",
    });
  }
};

export const assignWorkOrder = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const id = Number(req.params.id);
    const { technicianId, serviceProviderId } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid work order ID",
      });
    }

    if (
      (technicianId === undefined || technicianId === null) &&
      (serviceProviderId === undefined || serviceProviderId === null)
    ) {
      return res.status(400).json({
        message: "Technician ID or service provider ID is required",
      });
    }

    if (
      technicianId !== undefined &&
      technicianId !== null &&
      serviceProviderId !== undefined &&
      serviceProviderId !== null
    ) {
      return res.status(400).json({
        message: "Assign either a technician or a service provider, not both",
      });
    }

    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
    });

    if (!workOrder) {
      return res.status(404).json({
        message: "Work order not found",
      });
    }

    if (technicianId !== undefined && technicianId !== null) {
      const technician = await prisma.user.findUnique({
        where: {
          id: Number(technicianId),
        },
      });

      if (!technician) {
        return res.status(404).json({
          message: "Technician not found",
        });
      }

      if (technician.role !== "TECHNICIAN") {
        return res.status(400).json({
          message: "Selected user is not registered as a technician",
        });
      }
    }

    if (serviceProviderId !== undefined && serviceProviderId !== null) {
      const serviceProvider = await prisma.user.findUnique({
        where: {
          id: Number(serviceProviderId),
        },
      });

      if (!serviceProvider) {
        return res.status(404).json({
          message: "Service provider not found",
        });
      }

      if (serviceProvider.role !== "SERVICE_PROVIDER") {
        return res.status(400).json({
          message: "Selected user is not registered as a service provider",
        });
      }
    }

    const updatedWorkOrder = await prisma.workOrder.update({
      where: { id },
      data: {
        technicianId:
          technicianId !== undefined && technicianId !== null
            ? Number(technicianId)
            : null,
        serviceProviderId:
          serviceProviderId !== undefined && serviceProviderId !== null
            ? Number(serviceProviderId)
            : null,
        assignedDate: new Date(),
        status: "ASSIGNED",
      },
    });

    return res.status(200).json({
      message: "Work order assigned successfully",
      workOrder: updatedWorkOrder,
    });
  } catch (error) {
    console.error("Assign work order error:", error);

    return res.status(500).json({
      message: "An error occurred while assigning the work order",
    });
  }
};

export const updateWorkOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid work order ID",
      });
    }

    if (!status) {
      return res.status(400).json({
        message: "Work order status is required",
      });
    }

    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
    });

    if (!workOrder) {
      return res.status(404).json({
        message: "Work order not found",
      });
    }

    // Technicians can only update work orders assigned to them.
    if (req.user?.role === "TECHNICIAN") {
      if (workOrder.technicianId !== req.user.userId) {
        return res.status(403).json({
          message: "You are not authorised to update this work order",
        });
      }

      // Technicians can only start their assigned work orders.
      if (status !== "IN_PROGRESS") {
        return res.status(403).json({
          message:
            "Technicians can only move assigned work orders to IN_PROGRESS",
        });
      }
    }

    const validTransition = isValidWorkOrderStatusTransition(
      workOrder.status,
      status,
    );

    if (!validTransition) {
      return res.status(400).json({
        message: `Invalid work order status transition from ${workOrder.status} to ${status}`,
      });
    }

    const updatedWorkOrder = await prisma.workOrder.update({
      where: { id },
      data: {
        status,
      },
    });

    // Keep the related maintenance request in sync.
    if (status === "IN_PROGRESS") {
      await prisma.maintenanceRequest.update({
        where: {
          id: workOrder.requestId,
        },
        data: {
          status: "IN_PROGRESS",
        },
      });
    }

    return res.status(200).json({
      message: "Work order status updated successfully",
      workOrder: updatedWorkOrder,
    });
  } catch (error) {
    console.error("Update work order status error:", error);

    return res.status(500).json({
      message: "An error occurred while updating the work order status",
    });
  }
};

export const completeWorkOrder = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid work order ID",
      });
    }

    const { labourCost, materialCost, otherCost, notes } = req.body;

    // Validate maintenance costs.
    const parseCost = (value: unknown): number | null => {
      if (value === undefined || value === null || value === "") {
        return 0;
      }

      const amount = Number(value);

      if (!Number.isFinite(amount) || amount < 0) {
        return null;
      }

      return amount;
    };

    const labour = parseCost(labourCost);
    const material = parseCost(materialCost);
    const other = parseCost(otherCost);

    if (labour === null || material === null || other === null) {
      return res.status(400).json({
        message: "Maintenance costs must be valid non-negative numbers",
      });
    }

    const total = labour + material + other;

    const result = await prisma.$transaction(async (tx) => {
      const workOrder = await tx.workOrder.findUnique({
        where: { id },
        include: {
          request: true,
        },
      });

      if (!workOrder) {
        throw new Error("WORK_ORDER_NOT_FOUND");
      }

      // Technicians can only complete work orders assigned to them.
      if (
        req.user?.role === "TECHNICIAN" &&
        workOrder.technicianId !== req.user.userId
      ) {
        throw new Error("UNAUTHORISED_WORK_ORDER");
      }

      if (workOrder.status !== "IN_PROGRESS") {
        throw new Error("WORK_ORDER_NOT_IN_PROGRESS");
      }

      const completedDate = new Date();

      const updatedWorkOrder = await tx.workOrder.update({
        where: { id },
        data: {
          status: "COMPLETED",
          completedDate,
          labourCost: labour,
          materialCost: material,
          otherCost: other,
          totalCost: total,
          notes: notes !== undefined ? notes : workOrder.notes,
        },
      });

      await tx.maintenanceRequest.update({
        where: {
          id: workOrder.requestId,
        },
        data: {
          status: "COMPLETED",
        },
      });

      // Create maintenance history only when an asset is linked.
      let maintenanceHistory = null;

      if (workOrder.request.assetId !== null) {
        maintenanceHistory = await tx.maintenanceHistory.create({
          data: {
            asset: {
              connect: {
                id: workOrder.request.assetId,
              },
            },
            workOrder: {
              connect: {
                id: workOrder.id,
              },
            },
            description: workOrder.request.description,
            maintenanceDate: completedDate,
            cost: total,
            remarks: notes || "Maintenance work completed successfully",
          },
        });
      }

      return {
        updatedWorkOrder,
        maintenanceHistory,
      };
    });

    return res.status(200).json({
      message: "Work order completed successfully",
      workOrder: result.updatedWorkOrder,
      maintenanceHistory: result.maintenanceHistory,
    });
  } catch (error) {
    console.error("Complete work order error:", error);

    if (error instanceof Error) {
      if (error.message === "WORK_ORDER_NOT_FOUND") {
        return res.status(404).json({
          message: "Work order not found",
        });
      }

      if (error.message === "UNAUTHORISED_WORK_ORDER") {
        return res.status(403).json({
          message: "You are not authorised to complete this work order",
        });
      }

      if (error.message === "WORK_ORDER_NOT_IN_PROGRESS") {
        return res.status(400).json({
          message: "Only an IN_PROGRESS work order can be completed",
        });
      }
    }

    return res.status(500).json({
      message: "An error occurred while completing the work order",
    });
  }
};