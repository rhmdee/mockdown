import { Elysia, t } from "elysia";
import type { DeployMockPayload, DeployMockResponse } from "@mockdown/schema";
import { saveMockData } from "../services/cache-store";

export const deployRoutes = new Elysia({ prefix: "/api/v1" }).post(
  "/deploy",
  ({ body, request, headers }) => {
    const payload = body as DeployMockPayload;
    const endpointId = crypto.randomUUID();
    const entry = saveMockData(endpointId, payload);

    const urlObj = new URL(request.url);
    const proto = headers["x-forwarded-proto"] || urlObj.protocol.replace(':', '');
    const host = headers["x-forwarded-host"] || headers["host"] || urlObj.host;
    const baseUrl = `${proto}://${host}`;
    const mockUrl = `${baseUrl}/api/mock/${endpointId}`;

    const response: DeployMockResponse = {
      endpointId,
      url: mockUrl,
      expiresAt: entry.expiresAt
    };

    return response;
  },
  {
    body: t.Object({
      schema: t.Object({
        tables: t.Array(
          t.Object({
            name: t.String(),
            columns: t.Array(t.Any())
          })
        )
      }),
      mockData: t.Record(t.String(), t.Array(t.Any()))
    })
  }
);
