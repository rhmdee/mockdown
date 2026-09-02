export enum SemanticType {
  UUID = "UUID",
  Email = "Email",
  FullName = "FullName",
  Date = "Date",
  Phone = "Phone",
  Numeric = "Numeric",
  Boolean = "Boolean",
  String = "String"
}

export interface SchemaColumn {
  name: string;
  type: string;
  semanticType?: SemanticType;
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
