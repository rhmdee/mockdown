<script lang="ts">
  import { onMount } from "svelte";
  import { EditorView, basicSetup } from "codemirror";
  import { EditorState } from "@codemirror/state";
  import { markdown } from "@codemirror/lang-markdown";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { editorStore, DEFAULT_MARKDOWN } from "../stores/editorStore.svelte";
  import { FileText, RotateCcw, Sparkles } from "lucide-svelte";

  let editorElement: HTMLDivElement;
  let view: EditorView | null = null;

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
            backgroundColor: "transparent !important"
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

  function resetSample() {
    editorStore.setMarkdown(DEFAULT_MARKDOWN);
    if (view) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: DEFAULT_MARKDOWN }
      });
    }
  }
</script>

<div class="h-full flex flex-col bg-background border border-border rounded-2xl overflow-hidden shadow-xs">
  <!-- Top Bar -->
  <div class="h-11 px-4 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
    <div class="flex items-center gap-2 text-xs font-semibold text-foreground">
      <FileText class="size-3.5 text-primary" />
      <span>Markdown Data Dictionary</span>
    </div>

    <div class="flex items-center gap-2">
      <button
        onclick={resetSample}
        class="h-7 px-2.5 rounded-lg border border-border bg-background hover:bg-accent text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
        title="Reset to default sample"
      >
        <RotateCcw class="size-3" />
        <span>Reset Sample</span>
      </button>

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
  </div>

  <!-- CodeMirror Container -->
  <div class="flex-1 min-h-0 overflow-hidden" bind:this={editorElement}></div>
</div>
