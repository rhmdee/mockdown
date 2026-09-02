import type { MockdownSchema, DeployMockResponse } from "@mockdown/schema";

export type ActiveTab = "json" | "prisma" | "deploy";

class MockDataStore {
  schema = $state<MockdownSchema>({ tables: [] });
  mockData = $state<Record<string, any[]>>({});
  prismaSeed = $state<string>("");
  activeTab = $state<ActiveTab>("json");
  deployedEndpoint = $state<DeployMockResponse | null>(null);
  isDeploying = $state<boolean>(false);
  deployError = $state<string | null>(null);
  theme = $state<"dark" | "light">("dark");

  setData(schema: MockdownSchema, mockData: Record<string, any[]>, prismaSeed: string) {
    this.schema = schema;
    this.mockData = mockData;
    this.prismaSeed = prismaSeed;
  }

  setActiveTab(tab: ActiveTab) {
    this.activeTab = tab;
  }

  setDeployedEndpoint(endpoint: DeployMockResponse | null) {
    this.deployedEndpoint = endpoint;
  }

  setIsDeploying(status: boolean) {
    this.isDeploying = status;
  }

  setDeployError(error: string | null) {
    this.deployError = error;
  }

  toggleTheme() {
    this.theme = this.theme === "dark" ? "light" : "dark";
    if (typeof document !== "undefined") {
      if (this.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }
}

export const mockDataStore = new MockDataStore();
