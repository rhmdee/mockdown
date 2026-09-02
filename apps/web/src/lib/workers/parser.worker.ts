import { processMarkdown } from "../services/parser-service";

self.onmessage = async (e: MessageEvent<{ markdown: string; rowCount: number }>) => {
  const { markdown, rowCount } = e.data;

  try {
    const result = await processMarkdown(markdown, rowCount);
    self.postMessage({
      success: true,
      ...result
    });
  } catch (err: any) {
    self.postMessage({
      success: false,
      error: err?.message || "Failed to parse markdown table."
    });
  }
};
