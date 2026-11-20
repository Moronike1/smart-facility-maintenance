
import { Request, Response } from "express";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const getTechnicians = async (
  req: Request,
  res: Response
) => {
  try {
    const technicians = await prisma.user.findMany({
      where: {
        role: "TECHNICIAN",
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.status(200).json({
      message: "Technicians retrieved successfully",
      count: technicians.length,
      technicians,
    });
  } catch (error) {
    console.error("Get technicians error:", error);

    return res.status(500).json({
      message: "An error occurred while retrieving technicians",
    });
  }
};


export const getPendingResidents = async (
  req: Request,
  res: Response
) => {
  try {
    const residents = await prisma.user.findMany({
      where: {
        role: "FACILITY_USER",
        status: "PENDING",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(200).json({
      message: "Pending resident registrations retrieved successfully",
      count: residents.length,
      residents,
    });
  } catch (error) {
    console.error("Get pending residents error:", error);

    return res.status(500).json({
      message: "An error occurred while retrieving pending residents",
    });
  }
};

export const getResidentsByStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const status = String(req.query.status || "").toUpperCase();

    const allowedStatuses = ["PENDING", "ACTIVE", "REJECTED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid resident status",
      });
    }

    const residents = await prisma.user.findMany({
      where: {
        role: "FACILITY_USER",
        status: status as "PENDING" | "ACTIVE" | "REJECTED",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Residents retrieved successfully",
      count: residents.length,
      residents,
    });
  } catch (error) {
    console.error("Get residents by status error:", error);

    return res.status(500).json({
      message: "An error occurred while retrieving residents",
    });
  }
};

export const approveResident = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid resident ID",
      });
    }

    const resident = await prisma.user.findFirst({
      where: {
        id,
        role: "FACILITY_USER",
        status: "PENDING",
      },
    });

    if (!resident) {
      return res.status(404).json({
        message: "Pending resident registration not found",
      });
    }

    const approvedResident = await prisma.user.update({
      where: { id },
      data: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        status: true,
      },
    });

    return res.status(200).json({
      message: "Resident account approved successfully",
      resident: approvedResident,
    });
  } catch (error) {
    console.error("Approve resident error:", error);

    return res.status(500).json({
      message: "An error occurred while approving the resident",
    });
  }
};

export const rejectResident = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid resident ID",
      });
    }

    const resident = await prisma.user.findFirst({
      where: {
        id,
        role: "FACILITY_USER",
        status: "PENDING",
      },
    });

    if (!resident) {
      return res.status(404).json({
        message: "Pending resident registration not found",
      });
    }

    const rejectedResident = await prisma.user.update({
      where: { id },
      data: { status: "REJECTED" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        status: true,
      },
    });

    return res.status(200).json({
      message: "Resident registration rejected successfully",
      resident: rejectedResident,
    });
  } catch (error) {
    console.error("Reject resident error:", error);

    return res.status(500).json({
      message: "An error occurred while rejecting the resident",
    });
  }
};

