-- CreateEnum
CREATE TYPE "MaintenanceLocationType" AS ENUM ('PRIVATE_UNIT', 'SHARED_FACILITY');

-- AlterTable
ALTER TABLE "MaintenanceRequest" ADD COLUMN     "locationDescription" TEXT,
ADD COLUMN     "locationType" "MaintenanceLocationType";
