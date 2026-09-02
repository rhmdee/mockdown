<script lang="ts">
  import { mockDataStore } from "../stores/mockDataStore.svelte";
  import { CloudUpload, ExternalLink, Copy, Check, Clock, AlertCircle, Sparkles } from "lucide-svelte";

  let copied = $state(false);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  async function deployMockApi() {
    mockDataStore.setIsDeploying(true);
    mockDataStore.setDeployError(null);

    try {
      const response = await fetch(`${apiUrl}/api/v1/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schema: mockDataStore.schema,
          mockData: mockDataStore.mockData
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to deploy: HTTP ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      mockDataStore.setDeployedEndpoint(data);
    } catch (err: any) {
      mockDataStore.setDeployError(err?.message || "Failed to deploy mock API. Ensure API server is running on port 3000.");
    } finally {
      mockDataStore.setIsDeploying(false);
    }
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  }
</script>

<div class="h-full flex flex-col p-6 overflow-y-auto">
  <div class="max-w-xl mx-auto w-full flex flex-col gap-6">
    <!-- Intro Card -->
    <div class="p-6 rounded-2xl bg-accent/40 border border-border flex flex-col gap-4 shadow-xs">
      <div class="flex items-start gap-3.5">
        <div class="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <Sparkles class="size-5" />
        </div>
        <div>
          <h3 class="text-base font-semibold text-foreground">Deploy Instant Mock API</h3>
          <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
            Publish your current data models into a live ephemeral REST API accessible for 24 hours. Perfect for frontend prototyping without backend dependencies.
          </p>
        </div>
      </div>

      <button
        onclick={deployMockApi}
        disabled={mockDataStore.isDeploying || Object.keys(mockDataStore.mockData).length === 0}
        class="h-10 w-full rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2 shadow-xs hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        {#if mockDataStore.isDeploying}
          <div class="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
          <span>Publishing Endpoint...</span>
        {:else}
          <CloudUpload class="size-4" />
          <span>Deploy Live Endpoint (24h TTL)</span>
        {/if}
      </button>
    </div>

    <!-- Error State -->
    {#if mockDataStore.deployError}
      <div class="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5">
        <AlertCircle class="size-4 shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="font-semibold">Deployment Failed</p>
          <p class="mt-0.5">{mockDataStore.deployError}</p>
        </div>
      </div>
    {/if}

    <!-- Success Result Box -->
    {#if mockDataStore.deployedEndpoint}
      <div class="p-6 rounded-2xl bg-background border border-success/30 shadow-md flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="size-2.5 rounded-full bg-success animate-pulse"></span>
            <span class="text-xs font-bold uppercase tracking-wider text-success">Endpoint Live</span>
          </div>
          <div class="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock class="size-3" />
            <span>Expires in 24 hours</span>
          </div>
        </div>

        <!-- Main URL Box -->
        <div class="flex flex-col gap-1.5">
          <span class="text-xs font-medium text-foreground">Base Endpoint URL</span>
          <div class="flex items-center gap-2">
            <input
              readonly
              value={mockDataStore.deployedEndpoint.url}
              class="flex-1 h-9 px-3 rounded-lg bg-accent border border-border text-xs font-mono text-foreground select-all outline-none"
            />
            <button
              onclick={() => copyUrl(mockDataStore.deployedEndpoint?.url || "")}
              class="h-9 px-3 rounded-lg border border-border bg-background hover:bg-accent text-xs font-medium text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {#if copied}
                <Check class="size-3.5 text-success" />
                <span class="text-success">Copied</span>
              {:else}
                <Copy class="size-3.5 text-muted-foreground" />
                <span>Copy</span>
              {/if}
            </button>
            <a
              href={mockDataStore.deployedEndpoint.url}
              target="_blank"
              rel="noreferrer"
              class="h-9 px-3 rounded-lg border border-border bg-background hover:bg-accent text-xs font-medium text-foreground flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink class="size-3.5" />
              <span>Open</span>
            </a>
          </div>
        </div>

        <!-- Table Endpoints Breakdown -->
        <div class="flex flex-col gap-2 pt-2 border-t border-border">
          <span class="text-xs font-medium text-muted-foreground">Direct Resource Routes:</span>
          <div class="flex flex-col gap-1.5">
            {#each Object.keys(mockDataStore.mockData) as tableName}
              <div class="flex items-center justify-between p-2 rounded-lg bg-accent/50 border border-border text-xs">
                <div class="flex items-center gap-2 font-mono text-[11px]">
                  <span class="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">GET</span>
                  <span class="text-foreground">/api/mock/{mockDataStore.deployedEndpoint.endpointId}/{tableName.toLowerCase()}</span>
                </div>
                <a
                  href="{mockDataStore.deployedEndpoint.url}/{tableName.toLowerCase()}"
                  target="_blank"
                  rel="noreferrer"
                  class="text-primary hover:underline text-[11px] font-medium flex items-center gap-1"
                >
                  <span>Test</span>
                  <ExternalLink class="size-2.5" />
                </a>
              </div>
            {/each}
          </div>
        </div>

        <!-- cURL Snippet -->
        <div class="flex flex-col gap-1.5 pt-2 border-t border-border">
          <span class="text-xs font-medium text-muted-foreground">cURL Example:</span>
          <pre class="p-3 rounded-xl bg-accent font-mono text-[11px] text-foreground overflow-x-auto border border-border select-all">curl -X GET "{mockDataStore.deployedEndpoint.url}"</pre>
        </div>
      </div>
    {/if}
  </div>
</div>
