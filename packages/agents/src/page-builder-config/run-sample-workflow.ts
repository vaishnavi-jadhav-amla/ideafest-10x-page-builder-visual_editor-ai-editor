/**
 * Run from repo root (CommonJS tsconfig so ts-node can load the script):
 *   npx ts-node -P packages/agents/src/page-builder-config/tsconfig.run.json packages/agents/src/page-builder-config/run-sample-workflow.ts
 *
 * With LLM (requires OPENAI_API_KEY in the environment):
 *   $env:OPENAI_API_KEY="sk-..."; npx ts-node -P packages/agents/src/page-builder-config/tsconfig.run.json packages/agents/src/page-builder-config/run-sample-workflow.ts
 */

/* eslint-disable no-console */
import { parsePageBuilderCommands } from "./parse";
import {
  sampleAppendEmptyBoxCommands,
  sampleCategoryPageCommands,
  sampleCategoryPageNdjson,
  sampleEmptyPageStructure,
} from "./sample-commands";
import { applyPageBuilderToolArgumentsToPage, runPageBuilderLlmWorkflow } from "./workflow";

async function main() {
  console.log("--- 1) Direct commands (no LLM) ---");
  const direct = applyPageBuilderToolArgumentsToPage(sampleEmptyPageStructure, JSON.stringify({ commands: sampleCategoryPageCommands }));
  console.log("applied:", direct.applied, "errors:", direct.errors);
  console.log("content length:", direct.page.data.content.length);

  console.log("\n--- 2) NDJSON parse + apply ---");
  const fromNdjson = parsePageBuilderCommands(sampleCategoryPageNdjson);
  const ndjsonResult = applyPageBuilderToolArgumentsToPage(sampleEmptyPageStructure, JSON.stringify({ commands: fromNdjson }));
  console.log("parsed commands:", fromNdjson.length, "applied:", ndjsonResult.applied);

  console.log("\n--- 3) Stack: category page + EmptyBox ---");
  const stacked = applyPageBuilderToolArgumentsToPage(direct.page, JSON.stringify({ commands: sampleAppendEmptyBoxCommands }));
  console.log("content types:", stacked.page.data.content.map((c: { type: string }) => c.type).join(", "));

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    console.log("\n--- 4) LLM workflow (OPENAI_API_KEY set) ---");
    const llm = await runPageBuilderLlmWorkflow({
      page: sampleEmptyPageStructure,
      userRequest: "Configure main content as a category listing page with ProductListPage and root title 'Browse categories'.",
      apiKey,
    });
    console.log("assistant:", llm.assistantContent?.slice(0, 200) ?? "(none)");
    console.log("tool batches:", llm.toolArgumentsParsed.length, "applied:", llm.applied, "errors:", llm.errors);
  } else {
    console.log("\n--- 4) LLM skipped (set OPENAI_API_KEY to run) ---");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
