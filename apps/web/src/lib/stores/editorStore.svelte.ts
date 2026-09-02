export const DEFAULT_MARKDOWN = `# Users Entity

| Field Name | Type | Description |
|---|---|---|
| id | UUID | Primary unique identifier |
| full_name | String | User full name |
| email_address | String | Unique email contact |
| phone_number | String | International phone number |
| is_active | Boolean | Account status flag |
| created_at | Date | Account creation date |

# Posts Entity

| Field Name | Type | Description |
|---|---|---|
| id | UUID | Post primary key |
| author_id | UUID | Foreign key reference to Users |
| title | String | Article headline |
| content | String | Article body text |
| view_count | Numeric | Number of impressions |
| published_at | Date | Publish date |
`;

class EditorStore {
  markdown = $state<string>(DEFAULT_MARKDOWN);
  isParsing = $state<boolean>(false);
  rowCount = $state<number>(5);

  setMarkdown(text: string) {
    this.markdown = text;
  }

  setRowCount(count: number) {
    this.rowCount = Math.max(1, Math.min(50, count));
  }

  setIsParsing(status: boolean) {
    this.isParsing = status;
  }
}

export const editorStore = new EditorStore();
