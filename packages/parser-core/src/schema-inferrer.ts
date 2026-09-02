import { SemanticType } from "@mockdown/schema";

export function inferSemanticType(columnName: string, rawType?: string): SemanticType {
  const normalized = columnName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizedType = (rawType || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  // 1. Check explicit raw database type first if defined
  if (normalizedType === "uuid") {
    return SemanticType.UUID;
  }
  if (
    normalizedType === "boolean" ||
    normalizedType === "bool"
  ) {
    return SemanticType.Boolean;
  }
  if (
    normalizedType === "datetime" ||
    normalizedType === "timestamp" ||
    normalizedType === "timestamptz" ||
    normalizedType === "date" ||
    normalizedType === "time"
  ) {
    return SemanticType.Date;
  }
  if (
    normalizedType === "int" ||
    normalizedType === "integer" ||
    normalizedType === "bigint" ||
    normalizedType === "smallint" ||
    normalizedType === "serial" ||
    normalizedType === "bigserial"
  ) {
    return SemanticType.Numeric;
  }
  if (
    normalizedType === "decimal" ||
    normalizedType === "numeric" ||
    normalizedType === "float" ||
    normalizedType === "real" ||
    normalizedType === "double" ||
    normalizedType === "money"
  ) {
    if (
      normalized.includes("price") ||
      normalized.includes("budget") ||
      normalized.includes("amount") ||
      normalized.includes("subtotal") ||
      normalized.includes("cost") ||
      normalized.includes("balance") ||
      normalized.includes("revenue") ||
      normalizedType === "money"
    ) {
      return SemanticType.Currency;
    }
    return SemanticType.Numeric;
  }
  if (normalizedType === "enum") {
    return SemanticType.Enum;
  }
  if (normalizedType === "json" || normalizedType === "jsonb") {
    return SemanticType.Description;
  }

  // 2. Semantic column name heuristics
  if (normalized === "id" || normalized.endsWith("id")) {
    return SemanticType.UUID;
  }
  if (
    normalized.includes("password") ||
    normalized.includes("hash") ||
    normalized.includes("secret") ||
    normalized.includes("token")
  ) {
    return SemanticType.PasswordHash;
  }
  if (
    normalized === "role" ||
    normalized.includes("userrole") ||
    normalized.endsWith("role")
  ) {
    return SemanticType.Role;
  }
  if (normalized.includes("status")) {
    return SemanticType.Status;
  }
  if (normalized === "slug" || normalized.endsWith("slug")) {
    return SemanticType.Slug;
  }
  if (normalized.includes("company") || normalized.includes("org")) {
    return SemanticType.Company;
  }
  if (normalized.includes("email") || normalized.includes("mail")) {
    return SemanticType.Email;
  }
  if (
    normalized.includes("invoicenumber") ||
    normalized.includes("invoiceno") ||
    normalized.includes("invoicecode") ||
    normalized.includes("sku") ||
    normalized.includes("code")
  ) {
    return SemanticType.InvoiceCode;
  }
  if (
    normalized.includes("price") ||
    normalized.includes("budget") ||
    normalized.includes("amount") ||
    normalized.includes("subtotal") ||
    normalized.includes("cost") ||
    normalized.includes("balance") ||
    normalized.includes("revenue")
  ) {
    return SemanticType.Currency;
  }
  if (
    normalized.includes("name") ||
    normalized.includes("author") ||
    normalized.includes("pic")
  ) {
    return SemanticType.FullName;
  }
  if (
    normalized.includes("title") ||
    normalized.includes("headline") ||
    normalized.includes("subject")
  ) {
    return SemanticType.Title;
  }
  if (
    normalized.includes("desc") ||
    normalized.includes("content") ||
    normalized.includes("body") ||
    normalized.includes("note") ||
    normalized.includes("itemdescription")
  ) {
    return SemanticType.Description;
  }
  if (
    normalized.includes("created") ||
    normalized.includes("updated") ||
    normalized.includes("date") ||
    normalized.includes("time") ||
    normalized.includes("due") ||
    normalized.includes("paid") ||
    normalized.includes("deleted")
  ) {
    return SemanticType.Date;
  }
  if (
    normalized.includes("phone") ||
    normalized.includes("telp") ||
    normalized.includes("mobile")
  ) {
    return SemanticType.Phone;
  }
  if (
    normalized.startsWith("is") ||
    normalized.startsWith("has")
  ) {
    return SemanticType.Boolean;
  }
  if (
    normalized.includes("count") ||
    normalized.includes("qty") ||
    normalized.includes("quantity") ||
    normalized.includes("total")
  ) {
    return SemanticType.Numeric;
  }

  return SemanticType.String;
}
