import { describe, expect, it } from "bun:test";
import { SemanticType } from "@mockdown/schema";
import { parseTable } from "../src";

describe("parseTable", () => {
  it("should return empty array for empty input", async () => {
    const result = await parseTable("");
    expect(result.tables).toEqual([]);
  });

  it("should extract table columns and infer types", async () => {
    const md = `
# User Entity

| Field Name | Type | Description |
|---|---|---|
| id | String | The user ID |
| email_address | String | User email |
| is_active | Boolean | Active status |
    `;
    const result = await parseTable(md);
    expect(result.tables.length).toBe(1);
    expect(result.tables[0].name).toBe("User_Entity");
    expect(result.tables[0].columns.length).toBe(3);
    
    expect(result.tables[0].columns[0].name).toBe("id");
    expect(result.tables[0].columns[0].isPrimary).toBe(true);
    expect(result.tables[0].columns[0].semanticType).toBe(SemanticType.UUID);

    expect(result.tables[0].columns[1].name).toBe("email_address");
    expect(result.tables[0].columns[1].semanticType).toBe(SemanticType.Email);
    
    expect(result.tables[0].columns[2].name).toBe("is_active");
    expect(result.tables[0].columns[2].semanticType).toBe(SemanticType.Boolean);
  });
});
