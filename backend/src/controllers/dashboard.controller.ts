import { Response } from "express";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import "dotenv/config";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const getDashboardSummary = async (
  _req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const [
      totalFacilities,
      totalAssets,
      totalMaintenanceRequests,
      totalWorkOrders,
      totalPreventiveMaintenance,

      pendingRequests,
      approvedRequests,
      assignedRequests,
      inProgressRequests,
      completedRequests,
      cancelledRequests,

      assignedWorkOrders,
      inProgressWorkOrders,
      completedWorkOrders,
      cancelledWorkOrders,

      scheduledPreventiveMaintenance,
      inProgressPreventiveMaintenance,
      completedPreventiveMaintenance,
      overduePreventiveMaintenance,
      cancelledPreventiveMaintenance,

      lowRiskAssets,
      mediumRiskAssets,
      highRiskAssets,
      criticalRiskAssets,

      electricalRequests,
      plumbingRequests,
      hvacRequests,
      structuralRequests,
      securityRequests,
      cleaningRequests,
      equipmentRequests,
      otherRequests,

      maintenanceCostTotals,
    ] = await Promise.all([
      prisma.facility.count(),

      prisma.asset.count(),

      prisma.maintenanceRequest.count(),

      prisma.workOrder.count(),

      prisma.preventiveMaintenance.count(),

      // Maintenance request status
      prisma.maintenanceRequest.count({
        where: { status: "PENDING" },
      }),

      prisma.maintenanceRequest.count({
        where: { status: "APPROVED" },
      }),

      prisma.maintenanceRequest.count({
        where: { status: "ASSIGNED" },
      }),

      prisma.maintenanceRequest.count({
        where: { status: "IN_PROGRESS" },
      }),

      prisma.maintenanceRequest.count({
        where: { status: "COMPLETED" },
      }),

      prisma.maintenanceRequest.count({
        where: { status: "CANCELLED" },
      }),

      // Work order status
      prisma.workOrder.count({
        where: { status: "ASSIGNED" },
      }),

      prisma.workOrder.count({
        where: { status: "IN_PROGRESS" },
      }),

      prisma.workOrder.count({
        where: { status: "COMPLETED" },
      }),

      prisma.workOrder.count({
        where: { status: "CANCELLED" },
      }),

      // Preventive maintenance status
      prisma.preventiveMaintenance.count({
        where: { status: "SCHEDULED" },
      }),

      prisma.preventiveMaintenance.count({
        where: { status: "IN_PROGRESS" },
      }),

      prisma.preventiveMaintenance.count({
        where: { status: "COMPLETED" },
      }),

      prisma.preventiveMaintenance.count({
        where: { status: "OVERDUE" },
      }),

      prisma.preventiveMaintenance.count({
        where: { status: "CANCELLED" },
      }),

      // Asset risk level
      prisma.asset.count({
        where: { riskLevel: "LOW" },
      }),

      prisma.asset.count({
        where: { riskLevel: "MEDIUM" },
      }),

      prisma.asset.count({
        where: { riskLevel: "HIGH" },
      }),

      prisma.asset.count({
        where: { riskLevel: "CRITICAL" },
      }),

      // Maintenance category
      prisma.maintenanceRequest.count({
        where: { category: "ELECTRICAL" },
      }),

      prisma.maintenanceRequest.count({
        where: { category: "PLUMBING" },
      }),

      prisma.maintenanceRequest.count({
        where: { category: "HVAC" },
      }),

      prisma.maintenanceRequest.count({
        where: { category: "STRUCTURAL" },
      }),

      prisma.maintenanceRequest.count({
        where: { category: "SECURITY" },
      }),

      prisma.maintenanceRequest.count({
        where: { category: "CLEANING" },
      }),

      prisma.maintenanceRequest.count({
        where: { category: "EQUIPMENT" },
      }),

      prisma.maintenanceRequest.count({
        where: { category: "OTHER" },
      }),

      // Maintenance cost
      prisma.workOrder.aggregate({
        _sum: {
          labourCost: true,
          materialCost: true,
          otherCost: true,
          totalCost: true,
        },
        where: {
          status: "COMPLETED",
        },
      }),
    ]);

    return res.status(200).json({
      message: "Dashboard summary retrieved successfully",

      summary: {
        totalFacilities,
        totalAssets,
        totalMaintenanceRequests,
        totalWorkOrders,
        totalPreventiveMaintenance,

        maintenanceRequestsByStatus: {
          pending: pendingRequests,
          approved: approvedRequests,
          assigned: assignedRequests,
          inProgress: inProgressRequests,
          completed: completedRequests,
          cancelled: cancelledRequests,
        },

        workOrdersByStatus: {
          assigned: assignedWorkOrders,
          inProgress: inProgressWorkOrders,
          completed: completedWorkOrders,
          cancelled: cancelledWorkOrders,
        },

        preventiveMaintenanceByStatus: {
          scheduled: scheduledPreventiveMaintenance,
          inProgress: inProgressPreventiveMaintenance,
          completed: completedPreventiveMaintenance,
          overdue: overduePreventiveMaintenance,
          cancelled: cancelledPreventiveMaintenance,
        },

        assetsByRiskLevel: {
          low: lowRiskAssets,
          medium: mediumRiskAssets,
          high: highRiskAssets,
          critical: criticalRiskAssets,
        },

        maintenanceRequestsByCategory: {
          electrical: electricalRequests,
          plumbing: plumbingRequests,
          hvac: hvacRequests,
          structural: structuralRequests,
          security: securityRequests,
          cleaning: cleaningRequests,
          equipment: equipmentRequests,
          other: otherRequests,
        },

        maintenanceCosts: {
          totalMaintenanceCost: maintenanceCostTotals._sum.totalCost ?? 0,
          totalLabourCost: maintenanceCostTotals._sum.labourCost ?? 0,
          totalMaterialCost: maintenanceCostTotals._sum.materialCost ?? 0,
          totalOtherCost: maintenanceCostTotals._sum.otherCost ?? 0,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);

    return res.status(500).json({
      message: "Failed to retrieve dashboard summary",
    });
  }
};