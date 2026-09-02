import { parseTable } from "@mockdown/parser-core";
import { generateMockData } from "@mockdown/mock-engine";
import { generatePrismaSeed } from "@mockdown/prisma-generator";
import type { MockdownSchema } from "@mockdown/schema";

export interface ParseResult {
  schema: MockdownSchema;
  mockData: Record<string, any[]>;
  prismaSeed: string;
}

export async function processMarkdown(markdown: string, rowCount: number): Promise<ParseResult> {
  const schema = await parseTable(markdown || "");
  const mockData = generateMockData(schema, rowCount || 5);
  const prismaSeed = generatePrismaSeed(schema, mockData);

  return {
    schema,
    mockData,
    prismaSeed
  };
}
