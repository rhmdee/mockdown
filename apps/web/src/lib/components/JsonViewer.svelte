<script lang="ts">
  import { mockDataStore } from "../stores/mockDataStore.svelte";
  import { Copy, Check, Download, Layers } from "lucide-svelte";

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

<div class="h-full flex flex-col">
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
        class="h-7 px-2.5 rounded-lg border border-border bg-background hover:bg-accent text-xs font-medium text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
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
        class="h-7 px-2.5 rounded-lg border border-border bg-background hover:bg-accent text-xs font-medium text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <Download class="size-3 text-muted-foreground" />
        <span>Download</span>
      </button>
    </div>
  </div>

  <!-- Content -->
  <div class="flex-1 overflow-auto p-4 font-mono text-xs text-foreground bg-muted/10">
    {#if Object.keys(mockDataStore.mockData).length === 0}
      <div class="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
        <p>No table found in Markdown. Define a markdown table to generate mock data.</p>
      </div>
    {:else}
      <pre class="leading-relaxed whitespace-pre-wrap select-text">{formattedJson}</pre>
    {/if}
  </div>
</div>
