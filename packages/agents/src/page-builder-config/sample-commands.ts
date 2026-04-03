import type { IPageStructure } from "@znode/types/visual-editor";
import type { PageBuilderCommand } from "./commands";

/** Minimal empty Puck page — use as a starting point for demos. */
export const sampleEmptyPageStructure: IPageStructure = {
  key: "category/{}",
  data: {
    content: [],
    root: {},
  },
};

/**
 * Example category PLP: set key, root title, append ProductListPage (shape is illustrative).
 * Adjust `componentType` / `props` to match your theme’s Puck config.
 */
export const sampleCategoryPageCommands: PageBuilderCommand[] = [
  { kind: "set_page_key", key: "category/{}" },
  {
    kind: "merge_root_props",
    target: "main",
    props: { title: "Category listing" },
  },
  {
    kind: "append_component",
    target: "main",
    componentType: "ProductListPage",
    props: {
      config: { id: "category" },
    },
    id: "ProductListPage-demo-001",
  },
];

/** Append a simple EmptyBox-style block (matches common default widget pattern). */
export const sampleAppendEmptyBoxCommands: PageBuilderCommand[] = [
  {
    kind: "append_component",
    target: "main",
    componentType: "EmptyBox",
    props: {},
    id: "EmptyBox-949b1fd3-1a83-456b-a7e0-541b3af52ddf",
  },
];

/** NDJSON script equivalent to `sampleCategoryPageCommands` (for parsePageBuilderCommands). */
export const sampleCategoryPageNdjson = `
# category PLP sample
{"kind":"set_page_key","key":"category/{}"}
{"kind":"merge_root_props","target":"main","props":{"title":"Category listing"}}
{"kind":"append_component","target":"main","componentType":"ProductListPage","props":{"config":{"id":"category"}},"id":"ProductListPage-demo-001"}
`.trim();

/** What an LLM tool call usually returns as `function.arguments` for apply_page_builder_commands. */
export const sampleToolArgumentsJson = JSON.stringify({
  commands: sampleCategoryPageCommands,
});
