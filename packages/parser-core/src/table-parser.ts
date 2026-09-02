import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Root, Table, TableRow, TableCell, Heading, Text } from "mdast";
import type { MockdownSchema, SchemaTable, SchemaColumn } from "@mockdown/schema";
import { inferSemanticType } from "./schema-inferrer";
import { parsePrismaSchema } from "./prisma-parser";
import { parseMermaidERD } from "./mermaid-parser";

const processor = unified().use(remarkParse).use(remarkGfm);

export async function parseTable(markdown: string): Promise<MockdownSchema> {
  const schema: MockdownSchema = { tables: [] };
  const rawText = markdown || "";

  // 1. Check for Prisma Schema models (either in ```prisma code blocks or raw)
  if (rawText.includes("model ") && rawText.includes("{")) {
    const prismaSchema = parsePrismaSchema(rawText);
    if (prismaSchema.tables.length > 0) {
      schema.tables.push(...prismaSchema.tables);
    }
  }

  // 2. Check for Mermaid ERD (either in ```mermaid code blocks or raw)
  if (rawText.toLowerCase().includes("erdiagram") || (rawText.includes("||--") && rawText.includes("{"))) {
    const mermaidSchema = parseMermaidERD(rawText);
    if (mermaidSchema.tables.length > 0) {
      schema.tables.push(...mermaidSchema.tables);
    }
  }

  // 3. Parse Markdown Tables via AST
  const root = processor.parse(rawText) as Root;
  
  let currentHeading = "Entity_1";
  let entityIndex = 1;

  for (let i = 0; i < root.children.length; i++) {
    const node = root.children[i];

    if (node.type === "heading") {
      const headingNode = node as Heading;
      const textNode = headingNode.children.find((n: any) => n.type === "text") as Text | undefined;
      if (textNode) {
        currentHeading = textNode.value.replace(/[^a-zA-Z0-9_]/g, "_");
      }
    } else if (node.type === "table") {
      const tableNode = node as Table;
      
      if (tableNode.children.length < 2) continue; // Need at least header + 1 data row

      const headerRow = tableNode.children[0] as TableRow;
      const columns: SchemaColumn[] = [];

      let nameIndex = 0;
      let typeIndex = 1;
      let hasRecognizedHeader = false;

      headerRow.children.forEach((cell: TableCell, index: number) => {
        const text = getCellText(cell).toLowerCase();
        if (text.includes("name") || text.includes("field") || text.includes("kolom") || text.includes("atribut") || text.includes("column")) {
          nameIndex = index;
          hasRecognizedHeader = true;
        }
        if (text.includes("type") || text.includes("tipe") || text.includes("data type") || text.includes("format")) {
          typeIndex = index;
          hasRecognizedHeader = true;
        }
      });

      // If this table is clearly a non-database table (e.g. Roadmap table with Week / Deliverables) and Prisma/Mermaid models are already present, skip it
      const headerTexts = headerRow.children.map(getCellText).join(" ").toLowerCase();
      const isRoadmapOrMetaTable = headerTexts.includes("week") || headerTexts.includes("deliverable") || headerTexts.includes("milestone") || headerTexts.includes("persona");

      if (isRoadmapOrMetaTable && schema.tables.length > 0) {
        continue;
      }

      // Parse body rows
      for (let j = 1; j < tableNode.children.length; j++) {
        const row = tableNode.children[j] as TableRow;
        const nameCell = row.children[nameIndex];
        const typeCell = row.children[typeIndex];

        const rawName = nameCell ? getCellText(nameCell) : `field_${j}`;
        const rawType = typeCell ? getCellText(typeCell) : "string";

        if (!rawName.trim()) continue;

        let isForeign = false;
        let referenceTable = undefined;
        let referenceColumn = undefined;

        if (rawName.toLowerCase().endsWith("_id") || (rawName.toLowerCase().endsWith("id") && rawName.toLowerCase() !== "id")) {
          // Will be resolved in mock-engine
        }

        columns.push({
          name: rawName.replace(/[^a-zA-Z0-9_]/g, ""),
          type: rawType,
          semanticType: inferSemanticType(rawName, rawType),
          isPrimary: rawName.toLowerCase() === "id",
          isForeign,
          referenceTable,
          referenceColumn
        });
      }

      if (columns.length > 0 && !isRoadmapOrMetaTable) {
        schema.tables.push({
          name: currentHeading,
          columns
        });

        entityIndex++;
        currentHeading = `Entity_${entityIndex}`;
      }
    }
  }

  return schema;
}

function getCellText(cell: TableCell): string {
  return cell.children.map((n: any) => {
    if (n.type === "text") return n.value;
    if (n.type === "inlineCode") return n.value;
    return "";
  }).join("");
}
