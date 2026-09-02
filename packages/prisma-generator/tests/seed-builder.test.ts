import { describe, expect, it } from "bun:test";
import { generatePrismaSeed } from "../src";

describe("generatePrismaSeed", () => {
  it("should generate valid prisma seed script", () => {
    const mockData = {
      User: [
        { id: "123", name: "John Doe" }
      ]
    };
    
    const script = generatePrismaSeed({ tables: [] }, mockData);
    
    expect(script).toContain("import { PrismaClient } from '@prisma/client';");
    expect(script).toContain("await prisma.user.createMany({");
    expect(script).toContain('"id": "123"');
    expect(script).toContain("await prisma.$disconnect();");
  });
});
