
import { Request, Response } from "express";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const getMaintenanceHistory = async (
  req: Request,
  res: Response
) => {
  try {
    const history = await prisma.maintenanceHistory.findMany({
      include: {
       asset: {
  select: {
    id: true,
    name: true,
    category: true,
    facility: {
      select: {
        id: true,
        name: true,
      },
    },
  },
},
        workOrder: {
          select: {
            id: true,
            workOrderNumber: true,
            status: true,
            completedDate: true,
            totalCost: true,
            request: {
              select: {
                requestNumber: true,
                description: true,
              },
            },
          },
        },
      },
      orderBy: {
        maintenanceDate: "desc",
      },
    });

    return res.status(200).json({
      message: "Maintenance history retrieved successfully",
      count: history.length,
      history,
    });
  } catch (error) {
    console.error("Get maintenance history error:", error);

    return res.status(500).json({
      message: "An error occurred while retrieving maintenance history",
    });
  }
};
