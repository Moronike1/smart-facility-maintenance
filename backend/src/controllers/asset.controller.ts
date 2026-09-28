import { Request, Response } from "express";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { calculateAssetRisk } from "../utils/risk.util";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const createAsset = async (req: Request, res: Response) => {
  try {
    const {
      facilityId,
      name,
      category,
      serialNumber,
      description,
      installationDate,
      condition,
      criticality,
    } = req.body;

    if (!facilityId || !name || !category) {
      return res.status(400).json({
        message: "Facility ID, asset name and category are required",
      });
    }

    const facility = await prisma.facility.findUnique({
      where: {
        id: Number(facilityId),
      },
    });

    if (!facility) {
      return res.status(404).json({
        message: "Facility not found",
      });
    }

    if (serialNumber) {
      const existingAsset = await prisma.asset.findUnique({
        where: {
          serialNumber,
        },
      });

      if (existingAsset) {
        return res.status(409).json({
          message: "An asset with this serial number already exists",
        });
      }
    }

    const asset = await prisma.asset.create({
      data: {
        facilityId: Number(facilityId),
        name,
        category,
        serialNumber,
        description,
        installationDate: installationDate
          ? new Date(installationDate)
          : undefined,
        condition,
        criticality: criticality ? Number(criticality) : 1,
      },
    });

    return res.status(201).json({
      message: "Asset created successfully",
      asset,
    });
  } catch (error) {
    console.error("Create asset error:", error);

    return res.status(500).json({
      message: "An error occurred while creating the asset",
    });
  }
};

export const getAssets = async (req: Request, res: Response) => {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        facility: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Assets retrieved successfully",
      assets,
    });
  } catch (error) {
    console.error("Get assets error:", error);

    return res.status(500).json({
      message: "An error occurred while retrieving assets",
    });
  }
};

export const getAssetById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid asset ID",
      });
    }

    const asset = await prisma.asset.findUnique({
      where: {
        id,
      },
      include: {
        facility: true,
        maintenanceRequests: true,
        maintenanceHistory: true,
        preventiveMaintenance: true,
      },
    });

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    return res.status(200).json({
      message: "Asset retrieved successfully",
      asset,
    });
  } catch (error) {
    console.error("Get asset by ID error:", error);

    return res.status(500).json({
      message: "An error occurred while retrieving the asset",
    });
  }
};

export const updateAsset = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid asset ID",
      });
    }

    const existingAsset = await prisma.asset.findUnique({
      where: { id },
    });

    if (!existingAsset) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    const {
      facilityId,
      name,
      category,
      serialNumber,
      description,
      installationDate,
      condition,
      criticality,
    } = req.body;

    if (facilityId !== undefined) {
      const facility = await prisma.facility.findUnique({
        where: {
          id: Number(facilityId),
        },
      });

      if (!facility) {
        return res.status(404).json({
          message: "Facility not found",
        });
      }
    }

    if (serialNumber && serialNumber !== existingAsset.serialNumber) {
      const duplicateAsset = await prisma.asset.findUnique({
        where: {
          serialNumber,
        },
      });

      if (duplicateAsset && duplicateAsset.id !== id) {
        return res.status(409).json({
          message: "An asset with this serial number already exists",
        });
      }
    }

    const asset = await prisma.asset.update({
      where: { id },
      data: {
        facilityId:
          facilityId !== undefined
            ? Number(facilityId)
            : existingAsset.facilityId,

        name:
          name !== undefined
            ? name
            : existingAsset.name,

        category:
          category !== undefined
            ? category
            : existingAsset.category,

        serialNumber:
          serialNumber !== undefined
            ? serialNumber
            : existingAsset.serialNumber,

        description:
          description !== undefined
            ? description
            : existingAsset.description,

        installationDate:
          installationDate !== undefined
            ? installationDate
              ? new Date(installationDate)
              : null
            : existingAsset.installationDate,

        condition:
          condition !== undefined
            ? condition
            : existingAsset.condition,

        criticality:
          criticality !== undefined
            ? Number(criticality)
            : existingAsset.criticality,
      },
    });

    return res.status(200).json({
      message: "Asset updated successfully",
      asset,
    });
  } catch (error) {
    console.error("Update asset error:", error);

    return res.status(500).json({
      message: "An error occurred while updating the asset",
    });
  }
};

export const deleteAsset = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid asset ID",
      });
    }

    const existingAsset = await prisma.asset.findUnique({
      where: { id },
    });

    if (!existingAsset) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    await prisma.asset.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Asset deleted successfully",
    });
  } catch (error) {
    console.error("Delete asset error:", error);

    return res.status(500).json({
      message: "An error occurred while deleting the asset",
    });
  }
};

export const assessAssetRisk = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid asset ID",
      });
    }

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        maintenanceHistory: true,
      },
    });

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    const maintenanceCount =
      asset.maintenanceHistory.length;

    const totalMaintenanceCost =
      asset.maintenanceHistory.reduce(
        (total, history) =>
          total + Number(history.cost || 0),
        0
      );

    const riskLevel = calculateAssetRisk(
      asset.condition,
      asset.criticality,
      maintenanceCount,
      totalMaintenanceCost
    );

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: {
        riskLevel,
      },
    });

    return res.status(200).json({
      message: "Asset risk assessed successfully",
      assessment: {
        assetId: asset.id,
        assetName: asset.name,
        condition: asset.condition,
        criticality: asset.criticality,
        maintenanceCount,
        totalMaintenanceCost,
        riskLevel,
      },
      asset: updatedAsset,
    });
  } catch (error) {
    console.error("Assess asset risk error:", error);

    return res.status(500).json({
      message:
        "An error occurred while assessing asset risk",
    });
  }
};