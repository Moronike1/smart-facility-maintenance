import {
  AssetCondition,
  RiskLevel,
} from "../../generated/prisma/client";

export const calculateAssetRisk = (
  condition: AssetCondition,
  criticality: number,
  maintenanceCount: number,
  totalMaintenanceCost: number
): RiskLevel => {
  let score = 0;

  // Asset condition
  switch (condition) {
    case "EXCELLENT":
      score += 1;
      break;
    case "GOOD":
      score += 2;
      break;
    case "FAIR":
      score += 3;
      break;
    case "POOR":
      score += 4;
      break;
    case "CRITICAL":
      score += 5;
      break;
  }

  // Asset criticality
  score += Math.min(criticality, 5);

  // Maintenance frequency
  if (maintenanceCount >= 5) {
    score += 4;
  } else if (maintenanceCount >= 3) {
    score += 3;
  } else if (maintenanceCount >= 1) {
    score += 2;
  } else {
    score += 1;
  }

  // Maintenance cost
  if (totalMaintenanceCost >= 500000) {
    score += 4;
  } else if (totalMaintenanceCost >= 250000) {
    score += 3;
  } else if (totalMaintenanceCost >= 100000) {
    score += 2;
  } else {
    score += 1;
  }

  if (score >= 15) return "CRITICAL";
  if (score >= 11) return "HIGH";
  if (score >= 7) return "MEDIUM";

  return "LOW";
};