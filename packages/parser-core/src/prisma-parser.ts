import type { MockdownSchema, SchemaTable, SchemaColumn } from "@mockdown/schema";
import { SemanticType } from "@mockdown/schema";
import { inferSemanticType } from "./schema-inferrer";

const PRISMA_SCALAR_TYPES = new Set([
  "String",
  "Int",
  "BigInt",
  "Float",
  "Decimal",
  "Boolean",
  "DateTime",
  "Json",
  "Bytes"
]);

export function parsePrismaSchema(content: string): MockdownSchema {
  const schema: MockdownSchema = { tables: [] };

  // 1. Extract Enums: enum UserRole { OWNER ADMIN MEMBER }
  const enumMap = new Map<string, string[]>();
  const enumRegex = /enum\s+(\w+)\s*\{([\s\S]*?)\}/g;
  let enumMatch: RegExpExecArray | null;

  while ((enumMatch = enumRegex.exec(content)) !== null) {
    const enumName = enumMatch[1];
    const enumBody = enumMatch[2];
    const values = enumBody
      .split("\n")
      .map((l) => l.trim().replace(/,$/, ""))
      .filter((l) => l && !l.startsWith("//") && !l.startsWith("@@"));
    if (values.length > 0) {
      enumMap.set(enumName, values);
    }
  }

  // 2. Extract Models
  const modelRegex = /model\s+(\w+)\s*\{([\s\S]*?)\}/g;
  let match: RegExpExecArray | null;

  const modelNames = new Set<string>();
  while ((match = modelRegex.exec(content)) !== null) {
    modelNames.add(match[1]);
  }

  modelRegex.lastIndex = 0;

  while ((match = modelRegex.exec(content)) !== null) {
    const modelName = match[1];
    const body = match[2];
    const lines = body.split("\n");

    const columns: SchemaColumn[] = [];
    const relationMap = new Map<string, { targetTable: string; targetColumn: string }>();

    // Pass A: Find @relation definitions
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("//") || line.startsWith("@@")) continue;

      if (line.includes("@relation")) {
        const fieldsMatch = line.match(/fields:\s*\[(\w+)\]/);
        const referencesMatch = line.match(/references:\s*\[(\w+)\]/);
        const parts = line.split(/\s+/);
        const targetModel = parts[1]?.replace("?", "");

        if (fieldsMatch && targetModel) {
          const fkField = fieldsMatch[1];
          const refField = referencesMatch ? referencesMatch[1] : "id";
          relationMap.set(fkField, {
            targetTable: targetModel,
            targetColumn: refField
          });
        }
      }
    }

    // Pass B: Parse columns
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("//") || line.startsWith("@@")) continue;

      const tokens = line.split(/\s+/);
      if (tokens.length < 2) continue;

      const rawFieldName = tokens[0];
      const rawFieldType = tokens[1].replace("?", "").replace("[]", "");
      const rest = tokens.slice(2).join(" ");

      // Skip virtual relation fields (e.g. `tenant Tenant @relation(...)` or `users User[]`)
      if (modelNames.has(rawFieldType) && !PRISMA_SCALAR_TYPES.has(rawFieldType) && !enumMap.has(rawFieldType)) {
        continue;
      }

      const isPrimary = rest.includes("@id") || rawFieldName.toLowerCase() === "id";
      const relation = relationMap.get(rawFieldName);

      // Infer foreign key by naming convention if not explicitly declared with @relation
      let isForeign = false;
      let referenceTable: string | undefined = undefined;
      let referenceColumn: string | undefined = undefined;

      if (relation) {
        isForeign = true;
        referenceTable = relation.targetTable;
        referenceColumn = relation.targetColumn;
      } else if (rawFieldName.toLowerCase().endsWith("id") && rawFieldName.toLowerCase() !== "id") {
        const potentialTarget = rawFieldName.replace(/_id$/i, "").replace(/id$/i, "");
        for (const target of modelNames) {
          if (target.toLowerCase() === potentialTarget.toLowerCase() && target !== modelName) {
            isForeign = true;
            referenceTable = target;
            referenceColumn = "id";
            break;
          }
        }
      }

      // Check if type is an Enum
      const enumValues = enumMap.get(rawFieldType);

      // Map semantic type
      let semantic = inferSemanticType(rawFieldName, rawFieldType);
      if (enumValues) {
        semantic = SemanticType.Enum;
      } else if (isPrimary && (rawFieldType === "String" || rest.includes("uuid"))) {
        semantic = SemanticType.UUID;
      } else if (rawFieldType === "DateTime") {
        semantic = SemanticType.Date;
      } else if (rawFieldType === "Boolean") {
        semantic = SemanticType.Boolean;
      } else if (rawFieldType === "Int" || rawFieldType === "Float" || rawFieldType === "Decimal" || rawFieldType === "BigInt") {
        if (semantic !== SemanticType.Currency) {
          semantic = SemanticType.Numeric;
        }
      }

      columns.push({
        name: rawFieldName,
        type: rawFieldType,
        semanticType: semantic,
        enumValues,
        isPrimary,
        isForeign,
        referenceTable,
        referenceColumn
      });
    }

    if (columns.length > 0) {
      schema.tables.push({
        name: modelName,
        columns
      });
    }
  }

  return schema;
}
