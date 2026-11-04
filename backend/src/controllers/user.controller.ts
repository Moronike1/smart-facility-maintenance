
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
