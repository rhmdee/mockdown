<script lang="ts">
  import { editorStore } from "../stores/editorStore.svelte";
  import { mockDataStore } from "../stores/mockDataStore.svelte";
  import { Sun, Moon, Database, CloudUpload, MoreHorizontal } from "lucide-svelte";

  let isMobileMenuOpen = $state(false);
</script>

<header class="h-14 px-4 bg-background border border-border rounded-2xl flex items-center justify-between shadow-xs relative z-50">
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

  <!-- Desktop Actions -->
  <div class="hidden sm:flex items-center gap-2.5">
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

    <!-- Status badge -->
    <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-medium transition-colors {editorStore.isParsing ? 'bg-warning/10 border-warning/30 text-warning' : 'bg-accent border-border text-muted-foreground'}">
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

  <!-- Mobile Actions Trigger -->
  <div class="sm:hidden flex items-center">
    <button
      onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
      class="h-9 w-9 rounded-xl border border-border bg-background hover:bg-accent flex items-center justify-center transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
    >
      <MoreHorizontal class="size-5" />
    </button>
  </div>

  <!-- Mobile Actions Dropdown Menu -->
  {#if isMobileMenuOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="fixed inset-0 z-40 bg-transparent" onclick={() => (isMobileMenuOpen = false)}></div>
    <div class="absolute top-16 right-0 z-50 w-56 bg-background border border-border rounded-xl shadow-lg flex flex-col p-2 animate-in fade-in slide-in-from-top-2 gap-1.5">
      
      <!-- Row Count Selector Mobile -->
      <div class="flex items-center justify-between px-3 py-2 bg-accent/50 rounded-lg border border-border">
        <span class="text-xs font-medium text-muted-foreground">Mock Rows</span>
        <select
          value={editorStore.rowCount}
          onchange={(e) => {
            editorStore.setRowCount(Number((e.target as HTMLSelectElement).value));
            editorStore.triggerGenerate();
            isMobileMenuOpen = false;
          }}
          class="bg-transparent text-foreground font-semibold outline-none cursor-pointer text-xs text-right"
        >
          <option value={3} class="bg-background text-foreground">3 rows</option>
          <option value={5} class="bg-background text-foreground">5 rows</option>
          <option value={10} class="bg-background text-foreground">10 rows</option>
          <option value={25} class="bg-background text-foreground">25 rows</option>
        </select>
      </div>

      <!-- Theme Toggle Mobile -->
      <button
        onclick={() => {
          mockDataStore.toggleTheme();
          isMobileMenuOpen = false;
        }}
        class="h-9 px-3 rounded-lg hover:bg-accent text-xs font-medium text-foreground flex items-center justify-between transition-colors cursor-pointer w-full text-left"
      >
        <span>Theme</span>
        {#if mockDataStore.theme === "dark"}
          <Sun class="size-4 text-warning" />
        {:else}
          <Moon class="size-4 text-foreground" />
        {/if}
      </button>

      <!-- Deploy API Mobile -->
      <button
        onclick={() => {
          mockDataStore.setActiveTab("deploy");
          isMobileMenuOpen = false;
        }}
        class="h-9 px-3 rounded-lg hover:bg-primary/10 text-primary text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer w-full text-left"
      >
        <span>Deploy API</span>
        <CloudUpload class="size-4" />
      </button>
    </div>
  {/if}
</header>
