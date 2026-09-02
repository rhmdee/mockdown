import { SemanticType } from "@mockdown/schema";

export function inferSemanticType(columnName: string): SemanticType {
  const normalized = columnName.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (normalized === "id" || normalized.endsWith("id")) {
    return SemanticType.UUID;
  }
  if (normalized.includes("email") || normalized.includes("mail")) {
    return SemanticType.Email;
  }
  if (normalized.includes("name") || normalized.includes("author")) {
    return SemanticType.FullName;
  }
  if (normalized.includes("created") || normalized.includes("updated") || normalized.includes("date")) {
    return SemanticType.Date;
  }
  if (normalized.includes("phone") || normalized.includes("telp")) {
    return SemanticType.Phone;
  }
  if (normalized.includes("price") || normalized.includes("amount") || normalized.includes("total") || normalized.includes("balance")) {
    return SemanticType.Numeric;
  }
  if (normalized.startsWith("is") || normalized.startsWith("has") || normalized.includes("status")) {
    return SemanticType.Boolean;
  }

  return SemanticType.String;
}
