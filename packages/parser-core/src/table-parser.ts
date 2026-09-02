import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Root, Table, TableRow, TableCell, Heading, Text, InlineCode } from "mdast";
import { MockdownSchema, SchemaTable, SchemaColumn } from "@mockdown/schema";
import { inferSemanticType } from "./schema-inferrer";

export async function parseTable(markdown: string): Promise<MockdownSchema> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .parse(markdown);

  const root = file as Root;
  const schema: MockdownSchema = { tables: [] };
  
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
      
      if (tableNode.children.length < 1) continue; // Need at least header

      const headerRow = tableNode.children[0] as TableRow;
      const columns: SchemaColumn[] = [];

      // We assume first column is Name, second is Type based on standard PRD format.
      // But let's just parse the actual header values to be sure, or simply map rows.
      // Usually, a data dictionary table has columns like: Field Name | Data Type | Description
      // We will look for standard column indices or just assume: 
      // col 0 = name, col 1 = type (if available)

      let nameIndex = 0;
      let typeIndex = 1;

      headerRow.children.forEach((cell: TableCell, index: number) => {
        const text = getCellText(cell).toLowerCase();
        if (text.includes("name") || text.includes("field")) nameIndex = index;
        if (text.includes("type")) typeIndex = index;
      });

      // Parse body rows
      for (let j = 1; j < tableNode.children.length; j++) {
        const row = tableNode.children[j] as TableRow;
        const nameCell = row.children[nameIndex];
        const typeCell = row.children[typeIndex];

        const rawName = nameCell ? getCellText(nameCell) : `field_${j}`;
        const rawType = typeCell ? getCellText(typeCell) : "string";

        if (!rawName.trim()) continue;

        // Parse foreign key (naive approach: if type contains reference to another table)
        // e.g. "User ID" or "ref: User"
        let isForeign = false;
        let referenceTable = undefined;
        let referenceColumn = undefined;

        if (rawName.toLowerCase().endsWith("_id") || rawName.toLowerCase().endsWith("id")) {
           // We might consider it foreign if it matches another table, but we will leave this logic to the resolver.
        }

        columns.push({
          name: rawName.replace(/[^a-zA-Z0-9_]/g, ""),
          type: rawType,
          semanticType: inferSemanticType(rawName),
          isPrimary: rawName.toLowerCase() === "id",
          isForeign,
          referenceTable,
          referenceColumn
        });
      }

      schema.tables.push({
        name: currentHeading,
        columns
      });

      entityIndex++;
      currentHeading = `Entity_${entityIndex}`; // Reset for next table
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
