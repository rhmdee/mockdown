import { describe, expect, it } from "bun:test";
import { parseTable } from "../packages/parser-core/src";
import { generateMockData } from "../packages/mock-engine/src";
import { generatePrismaSeed } from "../packages/prisma-generator/src";
import { app } from "../apps/api/src";
import { SemanticType, type DeployMockPayload } from "../packages/schema/src";

describe("Mockdown Full End-to-End Flow", () => {
  const sampleMarkdown = `
# Customer Entity

| Field Name | Type | Description |
|---|---|---|
| id | UUID | Customer unique id |
| full_name | String | Customer full name |
| email_address | String | Customer email address |
| phone_number | String | Customer phone |
| is_active | Boolean | Account status |
| created_at | Date | Registered date |

# Orders Entity

| Field Name | Type | Description |
|---|---|---|
| id | UUID | Order primary key |
| customer_id | UUID | Foreign key reference to Customer |
| total_amount | Numeric | Total order amount |
| order_status | Boolean | Payment received flag |
| ordered_at | Date | Transaction timestamp |
`;

  it("should execute the complete lifecycle from Markdown to Live Mock API & Prisma Seeder", async () => {
    // 1. Parsing Markdown to AST Schema
    const schema = await parseTable(sampleMarkdown);
    expect(schema.tables.length).toBe(2);
    expect(schema.tables[0].name).toBe("Customer_Entity");
    expect(schema.tables[1].name).toBe("Orders_Entity");

    // Verify semantic inference
    const customerCols = schema.tables[0].columns;
    expect(customerCols.find((c) => c.name === "id")?.isPrimary).toBe(true);
    expect(customerCols.find((c) => c.name === "email_address")?.semanticType).toBe(SemanticType.Email);
    expect(customerCols.find((c) => c.name === "full_name")?.semanticType).toBe(SemanticType.FullName);

    // 2. Generating relational Mock Data
    // We adjust table names for relational matching
    const relationalSchema = {
      tables: [
        {
          name: "Customer",
          columns: customerCols
        },
        {
          name: "Orders",
          columns: [
            { name: "id", type: "string", semanticType: "UUID" as any, isPrimary: true },
            { name: "customer_id", type: "string", semanticType: "UUID" as any, isForeign: true, referenceTable: "Customer" },
            { name: "total_amount", type: "number", semanticType: "Numeric" as any }
          ]
        }
      ]
    };

    const mockData = generateMockData(relationalSchema, 5);
    expect(mockData["Customer"].length).toBe(5);
    expect(mockData["Orders"].length).toBe(5);

    // Foreign Key Referential Integrity Check
    const customerIds = mockData["Customer"].map((c: any) => c.id);
    mockData["Orders"].forEach((order: any) => {
      expect(customerIds).toContain(order.customer_id);
    });

    // 3. Generating Prisma Seed Script
    const prismaSeed = generatePrismaSeed(relationalSchema, mockData);
    expect(prismaSeed).toContain("import { PrismaClient } from '@prisma/client';");
    expect(prismaSeed).toContain("prisma.customer.createMany");
    expect(prismaSeed).toContain("prisma.orders.createMany");
    expect(prismaSeed).toContain("prisma.$disconnect();");

    // 4. Deploying to Backend Elysia API
    const deployPayload: DeployMockPayload = {
      schema: relationalSchema,
      mockData
    };

    const deployRes = await app.handle(
      new Request("http://localhost:3000/api/v1/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deployPayload)
      })
    );

    expect(deployRes.status).toBe(200);
    const deployData = await deployRes.json();
    expect(deployData.endpointId).toBeDefined();
    expect(deployData.url).toContain(`/api/mock/${deployData.endpointId}`);
    expect(deployData.expiresAt).toBeDefined();

    // 5. Consuming the Live Mock Endpoint
    // 5a. GET full mock dataset
    const getFullRes = await app.handle(new Request(`http://localhost:3000/api/mock/${deployData.endpointId}`));
    expect(getFullRes.status).toBe(200);
    const fullDataset = await getFullRes.json();
    expect(fullDataset.Customer.length).toBe(5);
    expect(fullDataset.Orders.length).toBe(5);

    // 5b. GET resource-specific endpoint
    const getOrdersRes = await app.handle(
      new Request(`http://localhost:3000/api/mock/${deployData.endpointId}/orders`)
    );
    expect(getOrdersRes.status).toBe(200);
    const ordersData = await getOrdersRes.json();
    expect(ordersData.length).toBe(5);
    expect(ordersData[0].customer_id).toBeDefined();
  });
});
