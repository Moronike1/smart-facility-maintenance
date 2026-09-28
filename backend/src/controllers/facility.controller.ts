import { Request, Response } from "express";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const createFacility = async (req: Request, res: Response) => {
  try {
    const { name, location, description } = req.body;

    if (!name || !location) {
      return res.status(400).json({
        message: "Facility name and location are required",
      });
    }

    const facility = await prisma.facility.create({
      data: {
        name,
        location,
        description,
      },
    });

    return res.status(201).json({
      message: "Facility created successfully",
      facility,
    });
  } catch (error) {
    console.error("Create facility error:", error);

    return res.status(500).json({
      message: "An error occurred while creating the facility",
    });
  }
};
export const getFacilities = async (req: Request, res: Response) => {
  try {
    const facilities = await prisma.facility.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Facilities retrieved successfully",
      facilities,
    });
  } catch (error) {
    console.error("Get facilities error:", error);

    return res.status(500).json({
      message: "An error occurred while retrieving facilities",
    });
  }
};

export const getFacilityById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid facility ID",
      });
    }

    const facility = await prisma.facility.findUnique({
      where: {
        id,
      },
    });

    if (!facility) {
      return res.status(404).json({
        message: "Facility not found",
      });
    }

    return res.status(200).json({
      message: "Facility retrieved successfully",
      facility,
    });
  } catch (error) {
    console.error("Get facility by ID error:", error);

    return res.status(500).json({
      message: "An error occurred while retrieving the facility",
    });
  }
};

export const updateFacility = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid facility ID",
      });
    }

    const { name, location, description } = req.body;

    const existingFacility = await prisma.facility.findUnique({
      where: { id },
    });

    if (!existingFacility) {
      return res.status(404).json({
        message: "Facility not found",
      });
    }

    const facility = await prisma.facility.update({
      where: { id },
      data: {
        name,
        location,
        description,
      },
    });

    return res.status(200).json({
      message: "Facility updated successfully",
      facility,
    });
  } catch (error) {
    console.error("Update facility error:", error);

    return res.status(500).json({
      message: "An error occurred while updating the facility",
    });
  }
};

export const deleteFacility = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid facility ID",
      });
    }

    const existingFacility = await prisma.facility.findUnique({
      where: { id },
    });

    if (!existingFacility) {
      return res.status(404).json({
        message: "Facility not found",
      });
    }

    await prisma.facility.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Facility deleted successfully",
    });
  } catch (error) {
    console.error("Delete facility error:", error);

    return res.status(500).json({
      message: "An error occurred while deleting the facility",
    });
  }
};