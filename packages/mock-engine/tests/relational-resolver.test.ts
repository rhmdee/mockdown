import { describe, expect, it } from "bun:test";
import { generateMockData } from "../src";
import { SemanticType, MockdownSchema } from "@mockdown/schema";
import { resolveDependencies } from "../src/relational-resolver";

describe("generateMockData", () => {
  it("should return empty object for empty schema", () => {
    expect(generateMockData({ tables: [] })).toEqual({});
  });

  it("should generate mock data correctly based on schema", () => {
    const schema: MockdownSchema = {
      tables: [
        {
          name: "Post",
          columns: [
            { name: "id", type: "string", semanticType: SemanticType.UUID, isPrimary: true },
            { name: "title", type: "string", semanticType: SemanticType.String },
            { name: "author_id", type: "string", semanticType: SemanticType.UUID, isForeign: true, referenceTable: "User" }
          ]
        },
        {
          name: "User",
          columns: [
            { name: "id", type: "string", semanticType: SemanticType.UUID, isPrimary: true },
            { name: "name", type: "string", semanticType: SemanticType.FullName }
          ]
        }
      ]
    };

    const ordered = resolveDependencies(schema);
    expect(ordered[0].name).toBe("User");
    expect(ordered[1].name).toBe("Post");

    const data = generateMockData(schema, 5);
    expect(data["User"].length).toBe(5);
    expect(data["Post"].length).toBe(5);

    // Assert relations
    const userIds = data["User"].map(u => u.id);
    const postAuthorIds = data["Post"].map(p => p.author_id);
    
    // Each post author_id must be one of the generated user ids
    postAuthorIds.forEach(id => {
      expect(userIds).toContain(id);
    });
  });
});
