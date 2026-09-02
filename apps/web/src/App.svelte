<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import Header from "./lib/components/Header.svelte";
  import Editor from "./lib/components/Editor.svelte";
  import JsonViewer from "./lib/components/JsonViewer.svelte";
  import PrismaViewer from "./lib/components/PrismaViewer.svelte";
  import DeployCard from "./lib/components/DeployCard.svelte";
  import { editorStore } from "./lib/stores/editorStore.svelte";
  import { mockDataStore } from "./lib/stores/mockDataStore.svelte";
  import { Braces, Code2, CloudUpload } from "lucide-svelte";

  let worker: Worker | null = null;
  let debounceTimeout: any = null;

  onMount(() => {
    // Initialize Web Worker
    worker = new Worker(new URL("./lib/workers/parser.worker.ts", import.meta.url), {
      type: "module"
    });

    worker.onmessage = (e: MessageEvent) => {
      editorStore.setIsParsing(false);
      if (e.data.success) {
        mockDataStore.setData(e.data.schema, e.data.mockData, e.data.prismaSeed);
      }
    };

    // Initial parse trigger
    triggerParse(editorStore.markdown, editorStore.rowCount);
  });

  onDestroy(() => {
    worker?.terminate();
    if (debounceTimeout) clearTimeout(debounceTimeout);
  });

  function triggerParse(markdown: string, rowCount: number) {
    if (!worker) return;
    editorStore.setIsParsing(true);
    if (debounceTimeout) clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(() => {
      worker?.postMessage({ markdown, rowCount });
    }, 200);
  }

  // React to markdown or row count changes
  $effect(() => {
    const md = editorStore.markdown;
    const rc = editorStore.rowCount;
    triggerParse(md, rc);
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
