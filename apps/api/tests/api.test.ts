import { describe, expect, it } from "bun:test";
import { app } from "../src";
import type { DeployMockPayload } from "@mockdown/schema";
import { SemanticType } from "@mockdown/schema";

describe("Mockdown Backend API", () => {
  it("GET / should return service health info", async () => {
    const res = await app.handle(new Request("http://localhost/"));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("online");
    expect(body.name).toBe("Mockdown API");
  });

  it("POST /api/v1/deploy should save mock data and return endpoint details", async () => {
    const payload: DeployMockPayload = {
      schema: {
        tables: [
          {
            name: "users",
            columns: [
              { name: "id", type: "string", semanticType: SemanticType.UUID, isPrimary: true },
              { name: "email", type: "string", semanticType: SemanticType.Email }
            ]
          }
        ]
      },
      mockData: {
        users: [
          { id: "u-1", email: "alice@example.com" },
          { id: "u-2", email: "bob@example.com" }
        ]
      }
    };

    const res = await app.handle(
      new Request("http://localhost/api/v1/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.endpointId).toBeDefined();
    expect(body.url).toContain(`/api/mock/${body.endpointId}`);
    expect(body.expiresAt).toBeDefined();

    // Verify GET /api/mock/:id returns all tables
    const getRes = await app.handle(new Request(`http://localhost/api/mock/${body.endpointId}`));
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.users.length).toBe(2);
    expect(getData.users[0].email).toBe("alice@example.com");

    // Verify GET /api/mock/:id/:tableName returns table specific data
    const getTableRes = await app.handle(new Request(`http://localhost/api/mock/${body.endpointId}/users`));
    expect(getTableRes.status).toBe(200);
    const getTableData = await getTableRes.json();
    expect(getTableData.length).toBe(2);
    expect(getTableData[1].id).toBe("u-2");
  });

  it("GET /api/mock/:id with non-existent id should return 404", async () => {
    const res = await app.handle(new Request("http://localhost/api/mock/random-non-existent-id"));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Not Found");
  });

  it("GET /api/mock/:id/:tableName with non-existent table should return 404", async () => {
    const payload: DeployMockPayload = {
      schema: {
        tables: [{ name: "products", columns: [] }]
      },
      mockData: {
        products: [{ id: "p-1", name: "Gadget" }]
      }
    };

    const deployRes = await app.handle(
      new Request("http://localhost/api/v1/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    );
    const { endpointId } = await deployRes.json();

    const res = await app.handle(new Request(`http://localhost/api/mock/${endpointId}/orders`));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Not Found");
  });
});
