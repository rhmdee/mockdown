<script lang="ts">
  import { editorStore } from "../stores/editorStore.svelte";
  import {
    X,
    Plus,
    Trash2,
    Table,
    Sparkles,
    Layers,
    ArrowRight,
    RotateCcw,
    Sliders,
  } from "lucide-svelte";

  interface ColumnItem {
    id: string;
    name: string;
    type: string;
    description: string;
  }

  interface PresetTemplate {
    id: string;
    name: string;
    entity: string;
    columns: ColumnItem[];
  }

  const ALL_PRESET_TEMPLATES: PresetTemplate[] = [
    {
      id: "products",
      name: "Products & Inventory",
      entity: "Products",
      columns: [
        { id: "1", name: "id", type: "UUID", description: "Primary key unique identifier" },
        { id: "2", name: "sku", type: "VARCHAR(64)", description: "Product stock keeping unit" },
        { id: "3", name: "name", type: "VARCHAR(255)", description: "Product title / name" },
        { id: "4", name: "description", type: "TEXT", description: "Detailed product description" },
        { id: "5", name: "price", type: "DECIMAL(10,2)", description: "Unit price" },
        { id: "6", name: "stock_quantity", type: "INTEGER", description: "Available inventory count" },
        { id: "7", name: "is_active", type: "BOOLEAN", description: "Publish status flag" },
        { id: "8", name: "created_at", type: "TIMESTAMP", description: "Record creation date" },
      ],
    },
    {
      id: "orders",
      name: "Orders & Transactions",
      entity: "Orders",
      columns: [
        { id: "1", name: "id", type: "UUID", description: "Order invoice primary ID" },
        { id: "2", name: "user_id", type: "UUID", description: "Customer foreign key reference" },
        { id: "3", name: "order_number", type: "VARCHAR(64)", description: "Human-readable order code" },
        { id: "4", name: "status", type: "ENUM", description: "Order state (PENDING, PAID, SHIPPED)" },
        { id: "5", name: "total_amount", type: "DECIMAL(12,2)", description: "Gross transaction amount" },
        { id: "6", name: "metadata", type: "JSON", description: "Additional order attributes" },
        { id: "7", name: "ordered_at", type: "TIMESTAMP", description: "Order placement timestamp" },
      ],
    },
    {
      id: "users",
      name: "User Accounts",
      entity: "Users",
      columns: [
        { id: "1", name: "id", type: "UUID", description: "User primary identifier" },
        { id: "2", name: "full_name", type: "VARCHAR(255)", description: "User full name" },
        { id: "3", name: "email", type: "VARCHAR(255)", description: "Unique email contact" },
        { id: "4", name: "password_hash", type: "VARCHAR(255)", description: "Bcrypt hashed password" },
        { id: "5", name: "phone_number", type: "VARCHAR(32)", description: "Mobile contact number" },
        { id: "6", name: "role", type: "ENUM", description: "Access role (ADMIN, MEMBER, GUEST)" },
        { id: "7", name: "is_verified", type: "BOOLEAN", description: "Email verification status" },
        { id: "8", name: "created_at", type: "TIMESTAMP", description: "Registration timestamp" },
      ],
    },
    {
      id: "customers",
      name: "Customers & CRM",
      entity: "Customers",
      columns: [
        { id: "1", name: "id", type: "UUID", description: "Customer unique identifier" },
        { id: "2", name: "company_name", type: "VARCHAR(255)", description: "Client enterprise name" },
        { id: "3", name: "contact_person", type: "VARCHAR(255)", description: "Lead contact person" },
        { id: "4", name: "email", type: "VARCHAR(255)", description: "Corporate email" },
        { id: "5", name: "phone", type: "VARCHAR(32)", description: "Direct office line" },
        { id: "6", name: "lifetime_value", type: "DECIMAL(12,2)", description: "Total customer spend" },
        { id: "7", name: "created_at", type: "TIMESTAMP", description: "Account creation date" },
      ],
    },
    {
      id: "payments",
      name: "Invoices & Billing",
      entity: "Invoices",
      columns: [
        { id: "1", name: "id", type: "UUID", description: "Invoice reference ID" },
        { id: "2", name: "order_id", type: "UUID", description: "Order foreign key" },
        { id: "3", name: "invoice_number", type: "VARCHAR(64)", description: "Invoice serial code" },
        { id: "4", name: "subtotal", type: "DECIMAL(10,2)", description: "Subtotal amount before tax" },
        { id: "5", name: "tax_amount", type: "DECIMAL(10,2)", description: "Tax calculation" },
        { id: "6", name: "status", type: "ENUM", description: "Payment state (UNPAID, PAID, VOID)" },
        { id: "7", name: "due_date", type: "DATE", description: "Payment deadline" },
      ],
    },
    {
      id: "posts",
      name: "Blog & Articles",
      entity: "Posts",
      columns: [
        { id: "1", name: "id", type: "UUID", description: "Article primary identifier" },
        { id: "2", name: "author_id", type: "UUID", description: "Author reference ID" },
        { id: "3", name: "title", type: "VARCHAR(255)", description: "Article headline" },
        { id: "4", name: "slug", type: "VARCHAR(128)", description: "SEO URL slug" },
        { id: "5", name: "content", type: "TEXT", description: "Article markdown/html body" },
        { id: "6", name: "view_count", type: "INTEGER", description: "Impression counter" },
        { id: "7", name: "is_published", type: "BOOLEAN", description: "Public visibility flag" },
        { id: "8", name: "published_at", type: "TIMESTAMP", description: "Publish timestamp" },
      ],
    },
    {
      id: "tickets",
      name: "Support & Issues",
      entity: "Tickets",
      columns: [
        { id: "1", name: "id", type: "UUID", description: "Ticket primary key" },
        { id: "2", name: "reporter_id", type: "UUID", description: "User who filed ticket" },
        { id: "3", name: "subject", type: "VARCHAR(255)", description: "Summary of problem" },
        { id: "4", name: "priority", type: "ENUM", description: "Severity (LOW, MEDIUM, HIGH, URGENT)" },
        { id: "5", name: "status", type: "ENUM", description: "Ticket state (OPEN, RESOLVED, CLOSED)" },
        { id: "6", name: "created_at", type: "TIMESTAMP", description: "Ticket created timestamp" },
      ],
    },
    {
      id: "projects",
      name: "Projects & Tasks",
      entity: "Projects",
      columns: [
        { id: "1", name: "id", type: "UUID", description: "Project unique ID" },
        { id: "2", name: "title", type: "VARCHAR(255)", description: "Project milestone title" },
        { id: "3", name: "budget", type: "DECIMAL(12,2)", description: "Total allotted budget" },
        { id: "4", name: "is_archived", type: "BOOLEAN", description: "Archive flag" },
        { id: "5", name: "start_date", type: "DATE", description: "Kickoff date" },
        { id: "6", name: "end_date", type: "DATE", description: "Target completion date" },
      ],
    },
  ];

  interface TypeGroup {
    group: string;
    options: { value: string; label: string }[];
  }

  const DB_TYPE_GROUPS: TypeGroup[] = [
    {
      group: "Identification & Primary Keys",
      options: [
        { value: "UUID", label: "UUID (Primary Key)" },
        { value: "BIGSERIAL", label: "BIGSERIAL (Auto Increment)" },
        { value: "SERIAL", label: "SERIAL (Int Auto Increment)" },
      ],
    },
    {
      group: "Text & String",
      options: [
        { value: "VARCHAR(255)", label: "VARCHAR(255) (Short Text)" },
        { value: "VARCHAR(64)", label: "VARCHAR(64) (Code / Slug)" },
        { value: "TEXT", label: "TEXT (Long Content)" },
      ],
    },
    {
      group: "Numeric & Financial",
      options: [
        { value: "INTEGER", label: "INTEGER (Counts / Quantities)" },
        { value: "BIGINT", label: "BIGINT (Large Numbers)" },
        { value: "DECIMAL(10,2)", label: "DECIMAL(10,2) (Currency / Price)" },
        { value: "FLOAT", label: "FLOAT / DOUBLE (Coordinates)" },
      ],
    },
    {
      group: "Date & Time",
      options: [
        { value: "TIMESTAMP", label: "TIMESTAMP (Date & Time)" },
        { value: "TIMESTAMPTZ", label: "TIMESTAMPTZ (With Timezone)" },
        { value: "DATE", label: "DATE (Calendar Date)" },
        { value: "TIME", label: "TIME (Clock Time)" },
      ],
    },
    {
      group: "Logical & Structured",
      options: [
        { value: "BOOLEAN", label: "BOOLEAN (True / False Flag)" },
        { value: "JSON", label: "JSON / JSONB (Payloads)" },
        { value: "ENUM", label: "ENUM (Predefined List)" },
      ],
    },
  ];

  // Pick 3 random preset templates once per session or on refresh
  let displayedPresets = $state<PresetTemplate[]>([]);
  let activePresetId = $state<string>("orders");

  function refreshRandomPresets() {
    const shuffled = [...ALL_PRESET_TEMPLATES].sort(() => 0.5 - Math.random());
    displayedPresets = shuffled.slice(0, 3);
  }

  // Initialize with 3 random presets
  refreshRandomPresets();

  let entityName = $state("Orders");
  let columns = $state<ColumnItem[]>([
    {
      id: "1",
      name: "id",
      type: "UUID",
      description: "Primary unique identifier",
    },
    {
      id: "2",
      name: "user_id",
      type: "UUID",
      description: "Foreign key reference to Users",
    },
    {
      id: "3",
      name: "status",
      type: "ENUM",
      description: "Workflow state",
    },
    {
      id: "4",
      name: "total_amount",
      type: "DECIMAL(10,2)",
      description: "Order amount",
    },
    {
      id: "5",
      name: "is_paid",
      type: "BOOLEAN",
      description: "Payment status flag",
    },
    {
      id: "6",
      name: "created_at",
      type: "TIMESTAMP",
      description: "Creation timestamp",
    },
  ]);

  function addColumn() {
    activePresetId = "custom";
    const newId =
      (columns.length + 1).toString() + "_" + Date.now().toString().slice(-4);
    columns = [
      ...columns,
      { id: newId, name: "", type: "VARCHAR(255)", description: "" },
    ];
  }

  function removeColumn(index: number) {
    activePresetId = "custom";
    if (columns.length <= 1) return;
    columns = columns.filter((_, i) => i !== index);
  }

  function loadPreset(preset: PresetTemplate) {
    activePresetId = preset.id;
    entityName = preset.entity;
    columns = JSON.parse(JSON.stringify(preset.columns));
  }

  function loadCustomPreset() {
    activePresetId = "custom";
    entityName = "CustomEntity";
    columns = [
      { id: "1", name: "id", type: "UUID", description: "Unique identifier" },
      { id: "2", name: "name", type: "VARCHAR(255)", description: "Entity name / label" },
      { id: "3", name: "created_at", type: "TIMESTAMP", description: "Created date" },
    ];
  }

  function onFieldChange() {
    // If user modifies field while a preset is active, mark as custom
    if (activePresetId !== "custom") {
      activePresetId = "custom";
    }
  }

  function buildMarkdownTable(): string {
    const safeEntity = entityName.trim() || "Entity";
    const header = `# ${safeEntity} Entity\n\n`;
    const tableHeader = "| Field Name | Type | Description |\n|---|---|---|\n";

    const rows = columns
      .filter((col) => col.name.trim().length > 0)
      .map((col) => {
        const colName = col.name.trim().replace(/\|/g, "");
        const colType = col.type.trim().replace(/\|/g, "");
        const colDesc = (col.description.trim() || `${colName} field`).replace(
          /\|/g,
          "",
        );
        return `| ${colName} | ${colType} | ${colDesc} |`;
      })
      .join("\n");

    return header + tableHeader + rows;
  }

  function handleInsert() {
    const tableMd = buildMarkdownTable();
    editorStore.appendTableMarkdown(tableMd);
    editorStore.closeTableBuilder();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      editorStore.closeTableBuilder();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if editorStore.isTableBuilderOpen}
  <!-- Backdrop Overlay -->
  <div
    class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
    onclick={() => editorStore.closeTableBuilder()}
    aria-hidden="true"
  ></div>

  <!-- Sheet Drawer (Left Side) -->
  <div
    class="fixed inset-y-0 left-0 z-50 w-full sm:w-120 md:w-130 bg-background border-r border-border shadow-2xl flex flex-col transition-transform duration-300 ease-out transform translate-x-0"
    role="dialog"
    aria-modal="true"
    aria-label="Table Builder Sheet"
  >
    <!-- Sheet Header -->
    <div
      class="h-16 px-6 border-b border-border bg-muted/20 flex items-center justify-between shrink-0"
    >
      <div class="flex items-center gap-3">
        <div
          class="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs"
        >
          <Table class="size-4.5" />
        </div>
        <div>
          <h2
            class="text-sm font-bold text-foreground tracking-tight flex items-center gap-2"
          >
            Table Builder
            <span
              class="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20"
            >
              Quick Sheet
            </span>
          </h2>
          <p class="text-xs text-muted-foreground">
            Rancang tabel & kolom database standar ke Markdown
          </p>
        </div>
      </div>

      <button
        onclick={() => editorStore.closeTableBuilder()}
        class="size-8 rounded-lg border border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Close sheet"
      >
        <X class="size-4" />
      </button>
    </div>

    <!-- Sheet Body (Scrollable Container) -->
    <div class="flex-1 overflow-y-auto p-6 space-y-6">
      <!-- Quick Presets: 3 Random + 1 Custom -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <div
            class="text-xs font-semibold text-foreground flex items-center gap-1.5"
          >
            <Layers class="size-3.5 text-primary" />
            <span>Quick Presets</span>
          </div>
          <button
            type="button"
            onclick={refreshRandomPresets}
            class="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer"
            title="Shuffle presets"
          >
            <RotateCcw class="size-2.5" />
            <span>Shuffle</span>
          </button>
        </div>

        <div class="grid grid-cols-4 gap-2">
          <!-- 3 Random Presets -->
          {#each displayedPresets as preset}
            <button
              type="button"
              onclick={() => loadPreset(preset)}
              class="p-2.5 rounded-xl border text-left transition-all group cursor-pointer relative {activePresetId === preset.id
                ? 'bg-primary/10 border-primary text-primary shadow-xs ring-1 ring-primary/40'
                : 'bg-accent/40 border-border hover:bg-accent hover:border-border/80 text-foreground'}"
            >
              <div
                class="text-xs font-bold truncate transition-colors {activePresetId === preset.id
                  ? 'text-primary'
                  : 'text-foreground group-hover:text-primary'}"
              >
                {preset.entity}
              </div>
              <div class="text-[10px] text-muted-foreground truncate mt-0.5">
                {preset.columns.length} cols
              </div>
              {#if activePresetId === preset.id}
                <span class="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary animate-pulse"></span>
              {/if}
            </button>
          {/each}

          <!-- 1 Custom Preset Button -->
          <button
            type="button"
            onclick={loadCustomPreset}
            class="p-2.5 rounded-xl border text-left transition-all group cursor-pointer relative {activePresetId === 'custom'
              ? 'bg-primary/10 border-primary text-primary shadow-xs ring-1 ring-primary/40'
              : 'bg-accent/40 border-border hover:bg-accent hover:border-border/80 text-foreground'}"
          >
            <div
              class="text-xs font-bold truncate flex items-center gap-1 transition-colors {activePresetId === 'custom'
                ? 'text-primary'
                : 'text-foreground group-hover:text-primary'}"
            >
              <Sliders class="size-3 shrink-0" />
              <span class="truncate">Custom</span>
            </div>
            <div class="text-[10px] text-muted-foreground truncate mt-0.5">
              {columns.length} cols
            </div>
            {#if activePresetId === "custom"}
              <span class="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary animate-pulse"></span>
            {/if}
          </button>
        </div>
      </div>

      <!-- Entity Name Configuration -->
      <div class="space-y-2">
        <label
          for="entity-name-input"
          class="text-xs font-semibold text-foreground flex items-center justify-between"
        >
          <span>Entity / Table Name <span class="text-destructive">*</span></span>
          {#if activePresetId === "custom"}
            <span class="text-[10px] font-normal text-muted-foreground">Custom Table</span>
          {/if}
        </label>
        <div class="relative">
          <input
            id="entity-name-input"
            type="text"
            bind:value={entityName}
            oninput={onFieldChange}
            placeholder="e.g. Orders, Products, Invoices"
            class="w-full h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <!-- Column Definitions -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-foreground">
            Columns & Database Data Types ({columns.length})
          </span>
          <button
            type="button"
            onclick={addColumn}
            class="h-7 px-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus class="size-3.5" />
            <span>Add Column</span>
          </button>
        </div>

        <div class="space-y-2.5">
          {#each columns as col, index (col.id)}
            <div
              class="p-3 rounded-xl border border-border bg-accent/30 space-y-2.5 relative group hover:border-border/80 transition-all"
            >
              <div class="flex items-center gap-2">
                <!-- Field Name Input -->
                <div class="flex-1">
                  <input
                    type="text"
                    bind:value={col.name}
                    oninput={onFieldChange}
                    placeholder="Column name (e.g. id, email, price)"
                    class="w-full h-8 px-2.5 rounded-md border border-border bg-background text-foreground text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                <!-- Database Type Select with Groups -->
                <div class="w-52">
                  <select
                    bind:value={col.type}
                    onchange={onFieldChange}
                    class="w-full h-8 px-2 rounded-md border border-border bg-background text-foreground text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                  >
                    {#each DB_TYPE_GROUPS as group}
                      <optgroup label={group.group} class="bg-background text-muted-foreground font-sans font-semibold">
                        {#each group.options as opt}
                          <option value={opt.value} class="text-foreground font-mono font-normal">
                            {opt.label}
                          </option>
                        {/each}
                      </optgroup>
                    {/each}
                  </select>
                </div>

                <!-- Delete Field Button -->
                <button
                  type="button"
                  onclick={() => removeColumn(index)}
                  disabled={columns.length <= 1}
                  class="size-8 rounded-md border border-border bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center disabled:opacity-40 disabled:hover:bg-background disabled:hover:text-muted-foreground transition-colors cursor-pointer shrink-0"
                  title="Remove column"
                  aria-label="Remove column"
                >
                  <Trash2 class="size-3.5" />
                </button>
              </div>

              <!-- Field Description (Optional) -->
              <div>
                <input
                  type="text"
                  bind:value={col.description}
                  oninput={onFieldChange}
                  placeholder="Column description / comment (e.g. Primary key, Foreign key to Users)"
                  class="w-full h-7 px-2.5 rounded-md border border-border/60 bg-background/70 text-muted-foreground text-[11px] focus:text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Preview Markdown Snippet -->
      <div class="space-y-2">
        <div
          class="text-xs font-semibold text-foreground flex items-center gap-1.5"
        >
          <Sparkles class="size-3.5 text-warning" />
          <span>Markdown Output Preview</span>
        </div>
        <div
          class="p-3 rounded-xl border border-border bg-background font-mono text-[11px] text-muted-foreground overflow-x-auto whitespace-pre leading-relaxed select-all"
        >
          {buildMarkdownTable()}
        </div>
      </div>
    </div>

    <!-- Sheet Footer -->
    <div
      class="h-16 px-6 border-t border-border bg-muted/20 flex items-center justify-between shrink-0"
    >
      <button
        type="button"
        onclick={() => editorStore.closeTableBuilder()}
        class="h-9 px-4 rounded-xl border border-border bg-background hover:bg-accent text-foreground text-xs font-semibold transition-colors cursor-pointer"
      >
        Cancel
      </button>

      <button
        type="button"
        onclick={handleInsert}
        class="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-2 shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
      >
        <span>Insert into Markdown</span>
        <ArrowRight class="size-3.5" />
      </button>
    </div>
  </div>
{/if}
