-- AlterEnum
ALTER TYPE "MaintenanceStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "MaintenanceRequest" ADD COLUMN     "statusReason" TEXT;
