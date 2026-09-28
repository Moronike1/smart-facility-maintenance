import {
  MaintenancePriority,
  MaintenanceSeverity,
} from "../../generated/prisma/client";

export const calculateMaintenancePriority = (
  severity: MaintenanceSeverity,
  operationalImpact: number,
  urgency: number
): MaintenancePriority => {
  let score = 0;

  // Severity contribution
  switch (severity) {
    case "LOW":
      score += 1;
      break;

    case "MEDIUM":
      score += 2;
      break;

    case "HIGH":
      score += 3;
      break;

    case "CRITICAL":
      score += 4;
      break;
  }

  // Operational impact contribution
  score += operationalImpact;

  // Urgency contribution
  score += urgency;

  if (score >= 10) {
    return "CRITICAL";
  }

  if (score >= 8) {
    return "HIGH";
  }

  if (score >= 5) {
    return "MEDIUM";
  }

  return "LOW";
};