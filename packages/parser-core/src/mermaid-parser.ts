import type { MockdownSchema, SchemaTable, SchemaColumn } from "@mockdown/schema";
import { inferSemanticType } from "./schema-inferrer";

export function parseMermaidERD(content: string): MockdownSchema {
  const schema: MockdownSchema = { tables: [] };
  if (!content) return schema;

  // Filter out relation lines (e.g. CUSTOMER ||--o{ ORDER : places) to avoid matching `{` in relation symbols like `o{` or `|{`
  const cleanedContent = content
    .split("\n")
    .filter((line) => !line.includes("--") && !line.includes(".."))
    .join("\n");

  // Extract all entity definitions: ENTITY_NAME { ... }
  const entityBlockRegex = /(?:^|\n)\s*([a-zA-Z0-9_]+)\s*\{([\s\S]*?)\}/g;
  const entityNames = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = entityBlockRegex.exec(cleanedContent)) !== null) {
    const name = match[1].trim();
    if (name.toLowerCase() !== "erdiagram" && name.toLowerCase() !== "mermaid") {
      entityNames.add(name);
    }
  }

  entityBlockRegex.lastIndex = 0;

  while ((match = entityBlockRegex.exec(cleanedContent)) !== null) {
    const entityName = match[1].trim();
    if (entityName.toLowerCase() === "erdiagram" || entityName.toLowerCase() === "mermaid") {
      continue;
    }

    const body = match[2];
    const lines = body.split("\n");
    const columns: SchemaColumn[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("%%") || line.startsWith("}")) continue;

      const tokens = line.split(/\s+/);
      if (tokens.length < 2) continue;

      // Mermaid ERD format: <type> <name> [PK/FK] [comment]
      const rawType = tokens[0];
      const rawName = tokens[1];
      const flags = tokens.slice(2).join(" ").toUpperCase();

      const isPrimary = flags.includes("PK") || rawName.toLowerCase() === "id";
      let isForeign = flags.includes("FK");
      let referenceTable: string | undefined = undefined;

      if (isForeign || rawName.toLowerCase().endsWith("_id") || rawName.toLowerCase().endsWith("id")) {
        const potentialTarget = rawName.replace(/_id$/i, "").replace(/id$/i, "");
        for (const target of entityNames) {
          if (target.toLowerCase() === potentialTarget.toLowerCase() && target.toLowerCase() !== entityName.toLowerCase()) {
            isForeign = true;
            referenceTable = target;
            break;
          }
        }
      }

      columns.push({
        name: rawName,
        type: rawType,
        semanticType: inferSemanticType(rawName),
        isPrimary,
        isForeign,
        referenceTable,
        referenceColumn: isForeign ? "id" : undefined
      });
    }

    if (columns.length > 0) {
      schema.tables.push({
        name: entityName,
        columns
      });
    }
  }

  return schema;
}
