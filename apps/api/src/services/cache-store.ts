import { LRUCache } from "lru-cache";
import type { DeployMockPayload } from "@mockdown/schema";

const TTL_24_HOURS = 1000 * 60 * 60 * 24;

export interface StoredMockEntry {
  id: string;
  payload: DeployMockPayload;
  createdAt: string;
  expiresAt: string;
}

const mockCache = new LRUCache<string, StoredMockEntry>({
  max: 5000,
  ttl: TTL_24_HOURS
});

export function saveMockData(id: string, payload: DeployMockPayload): StoredMockEntry {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TTL_24_HOURS).toISOString();
  const entry: StoredMockEntry = {
    id,
    payload,
    createdAt: now.toISOString(),
    expiresAt
  };

  mockCache.set(id, entry);
  return entry;
}

export function getMockData(id: string): StoredMockEntry | undefined {
  return mockCache.get(id);
}

export function clearMockCache(): void {
  mockCache.clear();
}
