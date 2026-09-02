import type { MockdownSchema, SchemaTable } from "@mockdown/schema";
import { generateValueForColumn } from "./generators";
import { resolveDependencies } from "./relational-resolver";

export function generateMockData(schema: MockdownSchema, rowsPerTable = 10): Record<string, any[]> {
  const mockData: Record<string, any[]> = {};
  
  // 1. Resolve order of tables (Topological Sort)
  let orderedTables: SchemaTable[];
  try {
    orderedTables = resolveDependencies(schema);
  } catch (e) {
    // Fallback to original order if circular
    orderedTables = schema.tables;
  }

  // 2. Generate data table by table
  for (const table of orderedTables) {
    const tableData: any[] = [];
    
    for (let i = 0; i < rowsPerTable; i++) {
      const row: any = {};
      
      for (const col of table.columns) {
        if (col.isForeign && col.referenceTable && mockData[col.referenceTable]?.length > 0) {
          // Pick a random ID from the parent table
          const parentData = mockData[col.referenceTable];
          const randomParentRow = parentData[Math.floor(Math.random() * parentData.length)];
          const refCol = col.referenceColumn || "id";
          row[col.name] = randomParentRow[refCol] || generateValueForColumn(col);
        } else {
          row[col.name] = generateValueForColumn(col);
        }
      }
      tableData.push(row);
    }
    
    mockData[table.name] = tableData;
  }

  return mockData;
}
