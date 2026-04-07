import * as fs from "node:fs";
import * as path from "node:path";

import type { IPageStructure } from "@znode/types/visual-editor";

import { applyPageBuilderCommands, type ApplyPageBuilderCommandsResult, type PageBuilderCommand } from "./commands";

export interface PageBuilderLlmWorkflowOptions {
  /** Current page JSON (IPageStructure). */
  page: IPageStructure;
  /** End-user or operator instruction for the model. */
  userRequest: string;
  /** OpenAI API key; if omitted, use `commandsOverride` or the workflow throws. */
  apiKey?: string;
  model?: string;
  /** System prompt override. */
  systemPrompt?: string;
  /**
   * When set, the OpenAI call is skipped and these commands are applied (tests / demos).
   */
  commandsOverride?: PageBuilderCommand[];
}

export interface PageBuilderLlmWorkflowResult extends ApplyPageBuilderCommandsResult {
  /** Raw assistant message content, if any. */
  assistantContent: string | null;
  /** Parsed tool arguments from each apply_page_builder_commands call (for auditing). */
  toolArgumentsParsed: { commands: PageBuilderCommand[] }[];
}

function loadOpenAiToolsFromDisk(): unknown {
  const fileName = "openai-page-builder-tools.json";
  const cwd = process.cwd();
  const candidates = [
    path.join(__dirname, fileName),
    path.join(cwd, "packages/agents/src/page-builder-config", fileName),
    path.join(cwd, "..", "..", "packages/agents/src/page-builder-config", fileName),
  ];
  for (const jsonPath of candidates) {
    if (fs.existsSync(jsonPath)) {
      return JSON.parse(fs.readFileSync(jsonPath, "utf8")) as unknown;
    }
  }
  throw new Error(
    `Could not find ${fileName} (tried __dirname and packages/agents/src/page-builder-config under cwd: ${process.cwd()}).`
  );
}

let cachedTools: unknown | undefined;

/** OpenAI Chat Completions `tools` array (loaded from openai-page-builder-tools.json). */
export function getPageBuilderOpenAiTools(): unknown {
  if (cachedTools === undefined) {
    cachedTools = loadOpenAiToolsFromDisk();
  }
  return cachedTools;
}

/**
 * Parse `function.arguments` from an apply_page_builder_commands tool call and apply to a page copy.
 */
export function applyPageBuilderToolArgumentsToPage(
  page: IPageStructure,
  toolArgumentsJson: string
): ApplyPageBuilderCommandsResult {
  const parsed = JSON.parse(toolArgumentsJson) as { commands?: PageBuilderCommand[] };
  if (!parsed.commands || !Array.isArray(parsed.commands)) {
    throw new Error("Tool arguments must be a JSON object with a commands array.");
  }
  return applyPageBuilderCommands(page, parsed.commands);
}

interface OpenAiChatCompletionMessage {
  role: string;
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: string;
    function: { name: string; arguments: string };
  }>;
}

interface OpenAiChatCompletionResponse {
  choices?: Array<{ message?: OpenAiChatCompletionMessage }>;
}

/**
 * Full loop: optional OpenAI chat + tool_calls → apply_page_builder_commands on the page.
 * Tool calls are applied in order; each step starts from the result of the previous step.
 */
export async function runPageBuilderLlmWorkflow(options: PageBuilderLlmWorkflowOptions): Promise<PageBuilderLlmWorkflowResult> {
  const {
    page,
    userRequest,
    apiKey,
    model = "gpt-4o",
    systemPrompt = [
      "You are a Znode page builder assistant. The user provides Puck page JSON (IPageStructure).",
      "You MUST call the tool apply_page_builder_commands on every turn. Pass a commands array (possibly empty if the request is unrelated or impossible). Never answer only with plain text when a page edit was requested.",
      "Kinds: set_page_key, merge_root_props, clear_content, append_component, remove_component, merge_component_props, replace_zones. target is main|header|footer for canvas/header/footer data.",
      "IMPORTANT: NEVER use clear_content unless the user EXPLICITLY asks to clear, reset, or start over. Always APPEND new widgets to the existing page content. Do not wipe existing content when adding new widgets.",
      "Visible widgets often use PascalCase types: Heading, Text, ButtonGroup. If the user wants BOTH a heading and body copy in one request, output TWO append_component commands in order: Heading first, then Text.",
      "If the user names an existing block id (e.g. Heading-… or Heading-<timestamp>-<shortId>) to edit in place: use merge_component_props only — never append_component for that. Heading: textColor, background, align, level (\"1\"–\"6\"), size (xxxl…default), text. Text: color (theme default|muted), text, size (s|m), weight (normal|semibold|bold|extrabold).",
      "British spelling centre means align center. Home Page Promo / homepage promo is handled by the server; do not fake it with Heading/Text — use an empty commands array if the user only asked for that widget name without other edits.",
      "Use the tool schema property names (camelCase enums). The server accepts snake_case kind aliases too.",
    ].join(" "),
    commandsOverride,
  } = options;

  const toolArgumentsParsed: { commands: PageBuilderCommand[] }[] = [];
  let assistantContent: string | null = null;

  if (commandsOverride) {
    const result = applyPageBuilderCommands(page, commandsOverride);
    toolArgumentsParsed.push({ commands: commandsOverride });
    return {
      ...result,
      assistantContent: null,
      toolArgumentsParsed,
    };
  }

  if (!apiKey?.trim()) {
    throw new Error("runPageBuilderLlmWorkflow: pass apiKey or commandsOverride.");
  }

  const tools = getPageBuilderOpenAiTools() as object[];
  /** Match Ollama semantics: every completion includes a commands list (here via a mandatory tool call). */
  const toolChoice = {
    type: "function" as const,
    function: { name: "apply_page_builder_commands" },
  };
  const body = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Current page JSON:\n${JSON.stringify(page)}\n\nRequest:\n${userRequest}`,
      },
    ],
    tools,
    tool_choice: toolChoice,
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI chat/completions failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as OpenAiChatCompletionResponse;
  const message = data.choices?.[0]?.message;
  assistantContent = message?.content ?? null;

  let working = page;
  let lastResult = applyPageBuilderCommands(page, []);

  const toolCalls = message?.tool_calls ?? [];
  for (const call of toolCalls) {
    if (call.type !== "function" || call.function?.name !== "apply_page_builder_commands") {
      continue;
    }
    let commands: PageBuilderCommand[] = [];
    try {
      const args = JSON.parse(call.function.arguments) as { commands?: unknown };
      commands = Array.isArray(args.commands) ? (args.commands as PageBuilderCommand[]) : [];
    } catch {
      lastResult = {
        page: working,
        applied: 0,
        errors: [{ commandIndex: 0, message: "Invalid JSON in apply_page_builder_commands arguments" }],
      };
      assistantContent =
        (assistantContent ? `${assistantContent}\n\n` : "") +
        "(Tool arguments were not valid JSON; nothing was applied.)";
      toolArgumentsParsed.push({ commands: [] });
      continue;
    }
    toolArgumentsParsed.push({ commands });
    lastResult = applyPageBuilderCommands(working, commands);
    working = lastResult.page;
  }

  if (toolCalls.length === 0) {
    lastResult = applyPageBuilderCommands(page, []);
    assistantContent =
      (assistantContent ? `${assistantContent}\n\n` : "") +
      "(Expected apply_page_builder_commands tool call was missing; page unchanged.)";
  }

  return {
    ...lastResult,
    assistantContent,
    toolArgumentsParsed,
  };
}
