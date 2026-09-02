<script lang="ts">
  import { onMount, untrack } from "svelte";
  import Header from "./lib/components/Header.svelte";
  import Editor from "./lib/components/Editor.svelte";
  import JsonViewer from "./lib/components/JsonViewer.svelte";
  import PrismaViewer from "./lib/components/PrismaViewer.svelte";
  import DeployCard from "./lib/components/DeployCard.svelte";
  import TableBuilderSheet from "./lib/components/TableBuilderSheet.svelte";
  import { editorStore } from "./lib/stores/editorStore.svelte";
  import { mockDataStore } from "./lib/stores/mockDataStore.svelte";
  import { processMarkdown } from "./lib/services/parser-service";
  import {
    Braces,
    Code2,
    CloudUpload,
    Sparkles,
    MoreHorizontal,
  } from "lucide-svelte";

  let isMobilePreviewMenuOpen = $state(false);

  async function performGeneration(markdown: string, rowCount: number) {
    editorStore.setIsParsing(true);
    const startTime = Date.now();

    try {
      const result = await processMarkdown(markdown, rowCount);
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
    performGeneration(editorStore.markdown, editorStore.rowCount);
  });

  $effect(() => {
    const _trigger = editorStore.generationCount;
    untrack(() => {
      performGeneration(editorStore.markdown, editorStore.rowCount);
    });
  });
</script>

<main
  class="w-screen h-dvh p-2 gap-1.5 bg-accent overflow-hidden flex flex-col selection:bg-primary/20 relative"
>
  <!-- Header Shell -->
  <Header />

  <!-- Split Screen Workspace -->
  <div class="flex-1 min-h-0 flex flex-col md:flex-row gap-1.5 overflow-hidden">
    <!-- Left Panel: Markdown CodeMirror Editor -->
    <div class="w-full md:w-1/2 h-1/2 md:h-full min-h-0 flex flex-col">
      <Editor />
    </div>

    <!-- Right Panel: Output Previews & Actions -->
    <div
      class="w-full md:w-1/2 h-1/2 md:h-full min-h-0 bg-background border border-border rounded-2xl flex flex-col overflow-hidden shadow-xs"
    >
      <!-- Right Panel Navigation Tabs -->
      <div
        class="h-11 px-4 border-b border-border bg-muted/30 flex items-center justify-between shrink-0 relative"
      >
        <!-- Desktop Tabs -->
        <div class="hidden sm:flex items-center gap-1">
          <button
            onclick={() => mockDataStore.setActiveTab("json")}
            class="h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer {mockDataStore.activeTab ===
            'json'
              ? 'bg-background text-foreground shadow-xs border border-border/80'
              : 'text-muted-foreground hover:text-foreground'}"
          >
            <Braces class="size-3.5 text-primary" />
            <span>JSON Preview</span>
          </button>

          <button
            onclick={() => mockDataStore.setActiveTab("prisma")}
            class="h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer {mockDataStore.activeTab ===
            'prisma'
              ? 'bg-background text-foreground shadow-xs border border-border/80'
              : 'text-muted-foreground hover:text-foreground'}"
          >
            <Code2 class="size-3.5 text-secondary" />
            <span>Prisma Seeder</span>
          </button>

          <button
            onclick={() => mockDataStore.setActiveTab("deploy")}
            class="h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer {mockDataStore.activeTab ===
            'deploy'
              ? 'bg-background text-foreground shadow-xs border border-border/80'
              : 'text-muted-foreground hover:text-foreground'}"
          >
            <CloudUpload class="size-3.5 text-warning" />
            <span>Mock API</span>
          </button>
        </div>

        <!-- Mobile Active Tab Indicator -->
        <div
          class="sm:hidden flex items-center gap-1.5 text-xs font-semibold text-foreground"
        >
          {#if mockDataStore.activeTab === "json"}
            <Braces class="size-3.5 text-primary" />
            <span>JSON Preview</span>
          {:else if mockDataStore.activeTab === "prisma"}
            <Code2 class="size-3.5 text-secondary" />
            <span>Prisma Seeder</span>
          {:else if mockDataStore.activeTab === "deploy"}
            <CloudUpload class="size-3.5 text-warning" />
            <span>Mock API</span>
          {/if}
        </div>

        <!-- Desktop Generate Button -->
        <div class="hidden sm:flex items-center gap-2">
          <button
            onclick={() => editorStore.triggerGenerate()}
            disabled={editorStore.isParsing}
            class="h-7 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Generate mock data from markdown"
          >
            <Sparkles class="size-3" />
            <span>Generate Mock</span>
          </button>
        </div>

        <!-- Mobile Actions Trigger -->
        <div class="sm:hidden flex items-center">
          <button
            onclick={() => (isMobilePreviewMenuOpen = !isMobilePreviewMenuOpen)}
            class="h-7 w-7 rounded-lg border border-border bg-background hover:bg-accent flex items-center justify-center transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal class="size-4" />
          </button>
        </div>

        <!-- Mobile Actions Dropdown Menu -->
        {#if isMobilePreviewMenuOpen}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="fixed inset-0 z-40 bg-transparent"
            onclick={() => (isMobilePreviewMenuOpen = false)}
          ></div>
          <div
            class="absolute top-12 right-4 z-50 w-48 bg-background border border-border rounded-xl shadow-lg flex flex-col p-1.5 animate-in fade-in slide-in-from-top-2"
          >
            <button
              onclick={() => {
                mockDataStore.setActiveTab("json");
                isMobilePreviewMenuOpen = false;
              }}
              class="h-9 px-3 rounded-md {mockDataStore.activeTab === 'json'
                ? 'bg-accent/50'
                : 'hover:bg-accent'} text-xs font-medium text-foreground flex items-center gap-2 transition-colors cursor-pointer w-full text-left"
            >
              <Braces class="size-3.5 text-primary" />
              <span>JSON Preview</span>
            </button>

            <button
              onclick={() => {
                mockDataStore.setActiveTab("prisma");
                isMobilePreviewMenuOpen = false;
              }}
              class="h-9 px-3 rounded-md {mockDataStore.activeTab === 'prisma'
                ? 'bg-accent/50'
                : 'hover:bg-accent'} text-xs font-medium text-foreground flex items-center gap-2 transition-colors cursor-pointer w-full text-left"
            >
              <Code2 class="size-3.5 text-secondary" />
              <span>Prisma Seeder</span>
            </button>

            <button
              onclick={() => {
                mockDataStore.setActiveTab("deploy");
                isMobilePreviewMenuOpen = false;
              }}
              class="h-9 px-3 rounded-md {mockDataStore.activeTab === 'deploy'
                ? 'bg-accent/50'
                : 'hover:bg-accent'} text-xs font-medium text-foreground flex items-center gap-2 transition-colors cursor-pointer w-full text-left"
            >
              <CloudUpload class="size-3.5 text-warning" />
              <span>Mock API</span>
            </button>

            <div class="h-px w-full bg-border my-1"></div>

            <button
              onclick={() => {
                editorStore.triggerGenerate();
                isMobilePreviewMenuOpen = false;
              }}
              disabled={editorStore.isParsing}
              class="h-9 px-3 rounded-md hover:bg-primary/10 text-primary text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer w-full text-left disabled:opacity-50"
            >
              <Sparkles class="size-3.5" />
              <span>Generate Mock</span>
            </button>
          </div>
        {/if}
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

  <!-- Left Side Sheet: Quick Table Builder -->
  <TableBuilderSheet />
</main>
