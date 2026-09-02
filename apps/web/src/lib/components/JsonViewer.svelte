<script lang="ts">
  import { mockDataStore } from "../stores/mockDataStore.svelte";
  import { editorStore } from "../stores/editorStore.svelte";
  import { Copy, Check, Download, Layers, Database, Sparkles } from "lucide-svelte";

  let copied = $state(false);

  const formattedJson = $derived(
    JSON.stringify(mockDataStore.mockData, null, 2)
  );

  const totalRecords = $derived(
    Object.values(mockDataStore.mockData).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0)
  );

  async function copyJson() {
    await navigator.clipboard.writeText(formattedJson);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  }

  function downloadJson() {
    const blob = new Blob([formattedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mockdown-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="h-full flex flex-col relative overflow-hidden">
  <!-- Action Bar -->
  <div class="h-10 px-4 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
    <div class="flex items-center gap-2 text-xs text-muted-foreground">
      <Layers class="size-3.5 text-primary" />
      <span>{Object.keys(mockDataStore.mockData).length} entities</span>
      <span>•</span>
      <span>{totalRecords} rows generated</span>
    </div>

    <div class="flex items-center gap-1.5">
      <button
        onclick={copyJson}
        disabled={editorStore.isParsing || Object.keys(mockDataStore.mockData).length === 0}
        class="h-7 px-2.5 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        {#if copied}
          <Check class="size-3 text-success" />
          <span class="text-success">Copied</span>
        {:else}
          <Copy class="size-3 text-muted-foreground" />
          <span>Copy</span>
        {/if}
      </button>

      <button
        onclick={downloadJson}
        disabled={editorStore.isParsing || Object.keys(mockDataStore.mockData).length === 0}
        class="h-7 px-2.5 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <Download class="size-3 text-muted-foreground" />
        <span>Download</span>
      </button>
    </div>
  </div>

  <!-- Animated Loading Preview Overlay -->
  {#if editorStore.isParsing}
    <div class="absolute inset-0 top-10 z-20 bg-background/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center transition-all duration-300">
      <div class="relative mb-4">
        <div class="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
          <Database class="size-6 text-primary animate-pulse" />
        </div>
        <div class="absolute -inset-1 rounded-2xl border-2 border-primary/40 border-t-primary animate-spin"></div>
      </div>
      <h4 class="text-sm font-semibold text-foreground tracking-tight flex items-center gap-1.5">
        <Sparkles class="size-3.5 text-warning" />
        <span>Generating Mock Dataset...</span>
      </h4>
      <p class="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
        Analyzing Markdown tables, resolving foreign keys, and synthesizing realistic records.
      </p>
      
      <!-- Skeleton Progress Bars -->
      <div class="w-60 space-y-2 mt-4">
        <div class="h-2 bg-primary/20 rounded-full animate-pulse w-full"></div>
        <div class="h-2 bg-primary/15 rounded-full animate-pulse w-4/5 mx-auto"></div>
        <div class="h-2 bg-primary/10 rounded-full animate-pulse w-3/5 mx-auto"></div>
      </div>
    </div>
  {/if}

  <!-- Content -->
  <div class="flex-1 overflow-auto p-4 font-mono text-xs text-foreground bg-muted/10 relative">
    {#if Object.keys(mockDataStore.mockData).length === 0 && !editorStore.isParsing}
      <div class="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
        <p>No table found in Markdown. Define a markdown table and click "Generate Mock".</p>
      </div>
    {:else}
      <pre class="leading-relaxed whitespace-pre-wrap select-text">{formattedJson}</pre>
    {/if}
  </div>
</div>
