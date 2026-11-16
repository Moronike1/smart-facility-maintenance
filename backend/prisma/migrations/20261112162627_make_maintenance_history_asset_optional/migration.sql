-- DropForeignKey
ALTER TABLE "MaintenanceHistory" DROP CONSTRAINT "MaintenanceHistory_assetId_fkey";

-- AlterTable
ALTER TABLE "MaintenanceHistory" ALTER COLUMN "assetId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "MaintenanceHistory" ADD CONSTRAINT "MaintenanceHistory_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
