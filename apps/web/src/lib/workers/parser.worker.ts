import { parseTable } from "@mockdown/parser-core";
import { generateMockData } from "@mockdown/mock-engine";
import { generatePrismaSeed } from "@mockdown/prisma-generator";

self.onmessage = async (e: MessageEvent<{ markdown: string; rowCount: number }>) => {
  const { markdown, rowCount } = e.data;

  try {
    const schema = await parseTable(markdown || "");
    const mockData = generateMockData(schema, rowCount || 5);
    const prismaSeed = generatePrismaSeed(schema, mockData);

    self.postMessage({
      success: true,
      schema,
      mockData,
      prismaSeed
    });
  } catch (err: any) {
    self.postMessage({
      success: false,
      error: err?.message || "Failed to parse markdown table."
    });
  }
};
