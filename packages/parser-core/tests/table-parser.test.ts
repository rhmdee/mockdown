import { describe, expect, it } from "bun:test";
import { SemanticType } from "@mockdown/schema";
import { parseTable, parsePrismaSchema, parseMermaidERD } from "../src";

describe("parseTable (Multi-Source Parser)", () => {
  it("should return empty array for empty input", async () => {
    const result = await parseTable("");
    expect(result.tables).toEqual([]);
  });

  it("should extract table columns and infer types from GFM Markdown tables", async () => {
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

  it("should parse Prisma Schema code blocks from complex PRD (e.g. STAKA)", async () => {
    const stakaPrd = `
# STAKA — Product Requirements Document

## 5. Technical Architecture & Database Schema

\`\`\`prisma
model Tenant {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  plan      PlanType @default(FREE)
  createdAt DateTime @default(now()) @map("created_at")

  users     User[]
  projects  Project[]
}

model User {
  id           String   @id @default(uuid())
  tenantId     String   @map("tenant_id")
  name         String
  email        String   @unique
  role         UserRole @default(MEMBER)

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
}

model Project {
  id          String        @id @default(uuid())
  tenantId    String        @map("tenant_id")
  title       String
  totalBudget Decimal       @default(0)

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
}
\`\`\`

## 6. Execution Roadmap & Milestones

| Week | Target Focus | Key Deliverables |
|---|---|---|
| Week 1–2 | Foundations & Setup | Auth system |
`;

    const result = await parseTable(stakaPrd);
    expect(result.tables.length).toBe(3);
    
    const tenant = result.tables.find((t) => t.name === "Tenant");
    const user = result.tables.find((t) => t.name === "User");
    const project = result.tables.find((t) => t.name === "Project");

    expect(tenant).toBeDefined();
    expect(user).toBeDefined();
    expect(project).toBeDefined();

    // Check Tenant PK
    const tenantIdCol = tenant!.columns.find((c) => c.name === "id");
    expect(tenantIdCol?.isPrimary).toBe(true);
    expect(tenantIdCol?.semanticType).toBe(SemanticType.UUID);

    // Check User Foreign Key
    const userFk = user!.columns.find((c) => c.name === "tenantId");
    expect(userFk?.isForeign).toBe(true);
    expect(userFk?.referenceTable).toBe("Tenant");

    // Check User email semantic inference
    const userEmail = user!.columns.find((c) => c.name === "email");
    expect(userEmail?.semanticType).toBe(SemanticType.Email);
  });

  it("should parse Mermaid ERD blocks", async () => {
    const mermaidPrd = `
\`\`\`mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    CUSTOMER {
        string id PK
        string full_name
        string email
    }
    ORDER {
        string id PK
        string customer_id FK
        number total_amount
    }
\`\`\`
    `;

    const result = await parseTable(mermaidPrd);
    expect(result.tables.length).toBe(2);

    const customer = result.tables.find((t) => t.name === "CUSTOMER");
    const order = result.tables.find((t) => t.name === "ORDER");

    expect(customer).toBeDefined();
    expect(order).toBeDefined();

    expect(customer!.columns.find((c) => c.name === "id")?.isPrimary).toBe(true);
    expect(order!.columns.find((c) => c.name === "customer_id")?.isForeign).toBe(true);
    expect(order!.columns.find((c) => c.name === "customer_id")?.referenceTable).toBe("CUSTOMER");
  });
});
