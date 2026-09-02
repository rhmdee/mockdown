<script lang="ts">
  import { mockDataStore } from "../stores/mockDataStore.svelte";
  import { Copy, Check, Download, Code2, Terminal } from "lucide-svelte";

  let copied = $state(false);

  async function copyScript() {
    await navigator.clipboard.writeText(mockDataStore.prismaSeed);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  }

  function downloadScript() {
    const blob = new Blob([mockDataStore.prismaSeed], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "seed.ts";
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="h-full flex flex-col">
  <!-- Action Bar -->
  <div class="h-10 px-4 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
    <div class="flex items-center gap-2 text-xs text-muted-foreground">
      <Code2 class="size-3.5 text-secondary" />
      <span>Prisma ORM Database Seeder</span>
    </div>

    <div class="flex items-center gap-1.5">
      <button
        onclick={copyScript}
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
        onclick={downloadScript}
        class="h-7 px-2.5 rounded-lg border border-border bg-background hover:bg-accent text-xs font-medium text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <Download class="size-3 text-muted-foreground" />
        <span>Download seed.ts</span>
      </button>
    </div>
  </div>

  <!-- CLI Hint Banner -->
  <div class="px-4 py-2 bg-accent/60 border-b border-border flex items-center gap-2 text-xs text-muted-foreground shrink-0 font-mono">
    <Terminal class="size-3.5 text-primary shrink-0" />
    <span>Save to <code class="px-1.5 py-0.5 rounded bg-background border border-border text-foreground">prisma/seed.ts</code> and run <code class="px-1.5 py-0.5 rounded bg-background border border-border text-foreground">bun prisma db seed</code></span>
  </div>

  <!-- Code Display -->
  <div class="flex-1 overflow-auto p-4 font-mono text-xs text-foreground bg-muted/10">
    {#if !mockDataStore.prismaSeed}
      <div class="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
        <p>No seed script available. Define markdown tables to generate.</p>
      </div>
    {:else}
      <pre class="leading-relaxed whitespace-pre-wrap select-text">{mockDataStore.prismaSeed}</pre>
    {/if}
  </div>
</div>
