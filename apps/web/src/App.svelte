<script lang="ts">
  import { onMount, untrack } from "svelte";
  import Header from "./lib/components/Header.svelte";
  import Editor from "./lib/components/Editor.svelte";
  import JsonViewer from "./lib/components/JsonViewer.svelte";
  import PrismaViewer from "./lib/components/PrismaViewer.svelte";
  import DeployCard from "./lib/components/DeployCard.svelte";
  import { editorStore } from "./lib/stores/editorStore.svelte";
  import { mockDataStore } from "./lib/stores/mockDataStore.svelte";
  import { processMarkdown } from "./lib/services/parser-service";
  import { Braces, Code2, CloudUpload } from "lucide-svelte";

  async function performGeneration(markdown: string, rowCount: number) {
    editorStore.setIsParsing(true);
    const startTime = Date.now();

    try {
      const result = await processMarkdown(markdown, rowCount);
      // Give a smooth 150ms micro-transition for the animated preview
      const elapsed = Date.now() - startTime;
      if (elapsed < 150) {
        await new Promise((resolve) => setTimeout(resolve, 150 - elapsed));
      }
      mockDataStore.setData(result.schema, result.mockData, result.prismaSeed);
    } catch (err) {
      console.error("Parsing error:", err);
    } finally {
      editorStore.setIsParsing(false);
    }
  }

  onMount(() => {
    // Initial generation on page load
    performGeneration(editorStore.markdown, editorStore.rowCount);
  });

  // Trigger generation ONLY when user clicks "Generate Mock" or changes row count
  $effect(() => {
    const _trigger = editorStore.generationCount;

    untrack(() => {
      performGeneration(editorStore.markdown, editorStore.rowCount);
    });
  });
</script>

<main class="w-screen h-screen p-2 gap-1.5 bg-accent overflow-hidden flex flex-col selection:bg-primary/20">
  <!-- Header Shell -->
  <Header />

  <!-- Split Screen Workspace -->
  <div class="flex-1 min-h-0 flex flex-col md:flex-row gap-1.5 overflow-hidden">
    <!-- Left Panel: Markdown CodeMirror Editor -->
    <div class="w-full md:w-1/2 h-1/2 md:h-full min-h-0 flex flex-col">
      <Editor />
    </div>

    <!-- Right Panel: Output Previews & Actions -->
    <div class="w-full md:w-1/2 h-1/2 md:h-full min-h-0 bg-background border border-border rounded-2xl flex flex-col overflow-hidden shadow-xs">
      <!-- Right Panel Navigation Tabs -->
      <div class="h-11 px-4 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-1">
          <button
            onclick={() => mockDataStore.setActiveTab("json")}
            class="h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer {mockDataStore.activeTab === 'json' ? 'bg-background text-foreground shadow-xs border border-border/80' : 'text-muted-foreground hover:text-foreground'}"
          >
            <Braces class="size-3.5 text-primary" />
            <span>JSON Preview</span>
          </button>

          <button
            onclick={() => mockDataStore.setActiveTab("prisma")}
            class="h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer {mockDataStore.activeTab === 'prisma' ? 'bg-background text-foreground shadow-xs border border-border/80' : 'text-muted-foreground hover:text-foreground'}"
          >
            <Code2 class="size-3.5 text-secondary" />
            <span>Prisma Seeder</span>
          </button>

          <button
            onclick={() => mockDataStore.setActiveTab("deploy")}
            class="h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer {mockDataStore.activeTab === 'deploy' ? 'bg-background text-foreground shadow-xs border border-border/80' : 'text-muted-foreground hover:text-foreground'}"
          >
            <CloudUpload class="size-3.5 text-warning" />
            <span>Mock API</span>
          </button>
        </div>
      </div>

      <!-- Tab Content Area -->
      <div class="flex-1 min-h-0 overflow-hidden">
        {#if mockDataStore.activeTab === "json"}
          <JsonViewer />
        {:else if mockDataStore.activeTab === "prisma"}
          <PrismaViewer />
        {:else if mockDataStore.activeTab === "deploy"}
          <DeployCard />
        {/if}
      </div>
    </div>
  </div>
</main>
