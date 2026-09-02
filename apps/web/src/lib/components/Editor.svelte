<script lang="ts">
  import { onMount } from "svelte";
  import { EditorView, basicSetup } from "codemirror";
  import { EditorState } from "@codemirror/state";
  import { markdown } from "@codemirror/lang-markdown";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { editorStore, DEFAULT_MARKDOWN } from "../stores/editorStore.svelte";
  import { FileText, RotateCcw, PlusSquare, MoreHorizontal } from "lucide-svelte";

  let editorElement: HTMLDivElement;
  let view: EditorView | null = null;
  let isMobileMenuOpen = $state(false);

  onMount(() => {
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const text = update.state.doc.toString();
        editorStore.setMarkdown(text);
      }
    });

    const state = EditorState.create({
      doc: editorStore.markdown,
      extensions: [
        basicSetup,
        markdown(),
        oneDark,
        updateListener,
        EditorView.lineWrapping,
        EditorView.theme({
          "&": {
            height: "100%",
            backgroundColor: "transparent !important",
            color: "var(--foreground) !important"
          },
          ".cm-content": {
            color: "var(--foreground)"
          },
          ".cm-gutters": {
            backgroundColor: "transparent !important",
            borderRight: "1px solid var(--border)",
            color: "var(--muted-foreground)"
          },
          ".cm-activeLine": {
            backgroundColor: "rgba(255, 255, 255, 0.03)"
          },
          ".cm-activeLineGutter": {
            backgroundColor: "rgba(255, 255, 255, 0.05)"
          }
        })
      ]
    });

    view = new EditorView({
      state,
      parent: editorElement
    });

    return () => {
      view?.destroy();
    };
  });

  // Sync external markdown updates (e.g. from Table Builder insertion or Reset) to CodeMirror
  $effect(() => {
    const currentMd = editorStore.markdown;
    if (view && view.state.doc.toString() !== currentMd) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: currentMd }
      });
    }
  });

  function resetSample() {
    editorStore.setMarkdown(DEFAULT_MARKDOWN);
    isMobileMenuOpen = false;
  }
</script>

<div class="h-full flex flex-col bg-background border border-border rounded-2xl overflow-hidden shadow-xs relative">
  <!-- Top Bar -->
  <div class="h-11 px-4 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
    <div class="flex items-center gap-2 text-xs font-semibold text-foreground">
      <FileText class="size-3.5 text-primary" />
      <span>Markdown Data Dictionary</span>
    </div>

    <!-- Desktop Actions -->
    <div class="hidden sm:flex items-center gap-2">
      <button
        onclick={resetSample}
        class="h-7 px-2.5 rounded-lg border border-border bg-background hover:bg-accent text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
        title="Reset to default sample"
      >
        <RotateCcw class="size-3" />
        <span>Reset Sample</span>
      </button>

      <button
        onclick={() => editorStore.openTableBuilder()}
        class="h-7 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
        title="Open Table Builder Sheet"
      >
        <PlusSquare class="size-3.5" />
        <span>Table builder</span>
      </button>
    </div>

    <!-- Mobile Actions Dropdown Trigger -->
    <div class="sm:hidden flex items-center">
      <button
        onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
        class="h-7 w-7 rounded-lg border border-border bg-background hover:bg-accent flex items-center justify-center transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
      >
        <MoreHorizontal class="size-4" />
      </button>
    </div>
  </div>

  <!-- Mobile Actions Dropdown Menu -->
  {#if isMobileMenuOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="absolute inset-0 z-40 bg-transparent" onclick={() => (isMobileMenuOpen = false)}></div>
    <div class="absolute top-12 right-4 z-50 w-48 bg-background border border-border rounded-xl shadow-lg flex flex-col p-1.5 animate-in fade-in slide-in-from-top-2">
      <button
        onclick={resetSample}
        class="h-9 px-3 rounded-md hover:bg-accent text-xs font-medium text-foreground flex items-center gap-2 transition-colors cursor-pointer w-full text-left"
      >
        <RotateCcw class="size-3.5 text-muted-foreground" />
        <span>Reset Sample</span>
      </button>
      <button
        onclick={() => {
          editorStore.openTableBuilder();
          isMobileMenuOpen = false;
        }}
        class="h-9 px-3 rounded-md hover:bg-primary/10 text-primary text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer w-full text-left mt-1"
      >
        <PlusSquare class="size-3.5" />
        <span>Table builder</span>
      </button>
    </div>
  {/if}

  <!-- CodeMirror Container -->
  <div class="flex-1 min-h-0 overflow-hidden" bind:this={editorElement}></div>
</div>
