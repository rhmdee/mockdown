export enum SemanticType {
  UUID = "UUID",
  Email = "Email",
  FullName = "FullName",
  Date = "Date",
  Phone = "Phone",
  Numeric = "Numeric",
  Boolean = "Boolean",
  PasswordHash = "PasswordHash",
  Role = "Role",
  Status = "Status",
  Slug = "Slug",
  Company = "Company",
  Title = "Title",
  Description = "Description",
  Currency = "Currency",
  InvoiceCode = "InvoiceCode",
  Enum = "Enum",
  String = "String"
}

export interface SchemaColumn {
  name: string;
  type: string;
  semanticType?: SemanticType;
  enumValues?: string[];
  isPrimary?: boolean;
  isForeign?: boolean;
  referenceTable?: string;
  referenceColumn?: string;
}

export interface SchemaTable {
  name: string;
  columns: SchemaColumn[];
}

export interface MockdownSchema {
  tables: SchemaTable[];
}

export interface DeployMockPayload {
  schema: MockdownSchema;
  mockData: Record<string, any[]>;
}

export interface DeployMockResponse {
  endpointId: string;
  url: string;
  expiresAt: string;
}
