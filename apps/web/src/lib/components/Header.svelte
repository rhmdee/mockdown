<script lang="ts">
  import { editorStore } from "../stores/editorStore.svelte";
  import { mockDataStore } from "../stores/mockDataStore.svelte";
  import { Sun, Moon, Database, CloudUpload } from "lucide-svelte";
</script>

<header class="h-14 px-4 bg-background border border-border rounded-2xl flex items-center justify-between shadow-xs">
  <div class="flex items-center gap-3">
    <div class="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-xs">
      <Database class="size-4 text-primary" />
    </div>
    <div class="flex items-center gap-2">
      <span class="font-bold text-foreground tracking-tight text-base">Mockdown</span>
      <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
        Studio
      </span>
    </div>
  </div>

  <div class="flex items-center gap-2.5">
    <!-- Row Count Selector -->
    <div class="flex items-center gap-1.5 bg-accent border border-border rounded-xl px-2.5 py-1 text-xs">
      <span class="text-muted-foreground font-medium">Rows:</span>
      <select
        value={editorStore.rowCount}
        onchange={(e) => {
          editorStore.setRowCount(Number((e.target as HTMLSelectElement).value));
          editorStore.triggerGenerate();
        }}
        class="bg-transparent text-foreground font-semibold outline-none cursor-pointer text-xs"
      >
        <option value={3} class="bg-background text-foreground">3 rows</option>
        <option value={5} class="bg-background text-foreground">5 rows</option>
        <option value={10} class="bg-background text-foreground">10 rows</option>
        <option value={25} class="bg-background text-foreground">25 rows</option>
      </select>
    </div>

    <!-- Status badge (Single source of loading state in header) -->
    <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-medium transition-colors {editorStore.isParsing ? 'bg-warning/10 border-warning/30 text-warning' : 'bg-accent border-border text-muted-foreground'}">
      {#if editorStore.isParsing}
        <div class="size-2.5 border-2 border-warning border-t-transparent rounded-full animate-spin"></div>
        <span>Generating...</span>
      {:else}
        <span class="size-2 rounded-full bg-success"></span>
        <span>Ready</span>
      {/if}
    </div>

    <!-- Theme Toggle Button -->
    <button
      onclick={() => mockDataStore.toggleTheme()}
      class="size-9 rounded-xl border border-border bg-background hover:bg-accent text-foreground flex items-center justify-center transition-colors cursor-pointer"
      title="Toggle Theme"
      aria-label="Toggle Theme"
    >
      {#if mockDataStore.theme === "dark"}
        <Sun class="size-4 text-warning" />
      {:else}
        <Moon class="size-4 text-foreground" />
      {/if}
    </button>

    <!-- Quick Deploy Button -->
    <button
      onclick={() => mockDataStore.setActiveTab("deploy")}
      class="h-9 px-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
    >
      <CloudUpload class="size-3.5" />
      <span>Deploy API</span>
    </button>
  </div>
</header>
