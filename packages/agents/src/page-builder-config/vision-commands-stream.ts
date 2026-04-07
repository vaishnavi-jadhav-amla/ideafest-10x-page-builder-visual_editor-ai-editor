/* eslint-disable no-console */
import type { IPageStructure } from "@znode/types/visual-editor";
import type {
  RunOpenAiVisionOptions,
  RunClaudeVisionOptions,
  VisionAnalysisResult,
} from "./vision-commands";
import { VISION_SYSTEM_PROMPT } from "./vision-commands";
import { parseAndPostProcess } from "./vision-commands-parse";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

/** Emitted by streaming vision generators as partial results arrive. */
export type VisionStreamEvent =
  | { type: "description"; text: string }
  | { type: "partial_page"; page: IPageStructure }
  | { type: "complete"; page: IPageStructure; result: VisionAnalysisResult }
  | { type: "error"; message: string };

export interface StreamVisionOptions {
  page: IPageStructure;
  imageBase64: string;
  imageMimeType: string;
  userMessage?: string;
}

/* -------------------------------------------------------------------------- */
/*  Progressive JSON Widget Extractor                                         */
/* -------------------------------------------------------------------------- */

/**
 * Given an accumulated partial JSON string from the LLM, try to extract
 * complete widget objects from the `"content": [...]` array as they appear.
 * Returns the list of fully-parseable widgets found so far.
 */
function extractCompleteWidgets(accumulated: string): unknown[] {
  const widgets: unknown[] = [];

  // Find the content array start
  const contentStart = accumulated.indexOf("\"content\"");
  if (contentStart === -1) return widgets;

  const bracketStart = accumulated.indexOf("[", contentStart);
  if (bracketStart === -1) return widgets;

  // Walk through the string after '[', extracting complete {...} objects
  let i = bracketStart + 1;
  while (i < accumulated.length) {
    // Skip whitespace and commas
    while (i < accumulated.length && (accumulated[i] === " " || accumulated[i] === "\n" || accumulated[i] === "\r" || accumulated[i] === "\t" || accumulated[i] === ",")) {
      i++;
    }
    if (i >= accumulated.length || accumulated[i] === "]") break;
    if (accumulated[i] !== "{") break;

    // Find the matching closing brace
    let depth = 0;
    let inString = false;
    let escaped = false;
    const objStart = i;
    let complete = false;

    for (let j = i; j < accumulated.length; j++) {
      const ch = accumulated[j];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === "\"") {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          // Found a complete object
          const objStr = accumulated.slice(objStart, j + 1);
          try {
            const obj = JSON.parse(objStr);
            widgets.push(obj);
          } catch {
            // Incomplete or malformed — skip
          }
          i = j + 1;
          complete = true;
          break;
        }
      }
    }

    if (!complete) break; // Still accumulating an incomplete object
  }

  return widgets;
}

/**
 * Try to extract the "description" field value from the accumulated JSON.
 */
function extractDescription(accumulated: string): string | null {
  const match = accumulated.match(/"description"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  return match ? match[1].replace(/\\"/g, "\"").replace(/\\\\/g, "\\") : null;
}

/**
 * Try to extract complete zone entries from the accumulated JSON.
 * Unlike the naive approach that waits for a zone array to close with `]`,
 * this extracts *individual* complete widget objects `{...}` from within
 * each zone array, even if the array isn't closed yet. This allows the
 * streaming parser to show widgets as they appear inside zones.
 */
function extractCompleteZones(accumulated: string): Record<string, unknown[]> {
  const zones: Record<string, unknown[]> = {};

  // Find the "zones" section
  const zonesStart = accumulated.indexOf("\"zones\"");
  if (zonesStart === -1) return zones;

  const braceStart = accumulated.indexOf("{", zonesStart + 7);
  if (braceStart === -1) return zones;

  // Walk from the opening `{` of zones, finding "key": [...] entries
  const zoneSection = accumulated.slice(braceStart);

  // Match zone key openings: "Container-xxx:Container": [
  const zonePattern = /"([^"]+)"\s*:\s*\[/g;
  let zoneMatch;
  while ((zoneMatch = zonePattern.exec(zoneSection)) !== null) {
    const key = zoneMatch[1];
    const arrayContentStart = zoneMatch.index + zoneMatch[0].length; // position after '['
    const widgets: unknown[] = [];

    // Extract individual complete {...} objects from within this zone array
    let i = arrayContentStart;
    while (i < zoneSection.length) {
      // Skip whitespace and commas
      while (
        i < zoneSection.length &&
        (zoneSection[i] === " " ||
          zoneSection[i] === "\n" ||
          zoneSection[i] === "\r" ||
          zoneSection[i] === "\t" ||
          zoneSection[i] === ",")
      ) {
        i++;
      }
      if (i >= zoneSection.length) break;
      // End of array or end of zones object — stop for this zone
      if (zoneSection[i] === "]") break;
      if (zoneSection[i] !== "{") break;

      // Find the matching closing brace for this widget object
      let depth = 0;
      let inString = false;
      let escaped = false;
      let found = false;

      for (let j = i; j < zoneSection.length; j++) {
        const ch = zoneSection[j];
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === "\"") {
          inString = !inString;
          continue;
        }
        if (inString) continue;
        if (ch === "{") depth++;
        else if (ch === "}") {
          depth--;
          if (depth === 0) {
            const objStr = zoneSection.slice(i, j + 1);
            try {
              const obj = JSON.parse(objStr);
              widgets.push(obj);
            } catch {
              // Incomplete or malformed
            }
            i = j + 1;
            found = true;
            break;
          }
        }
      }

      if (!found) break; // Still accumulating an incomplete widget object
    }

    if (widgets.length > 0) {
      zones[key] = widgets;
    }
  }

  return zones;
}

/* -------------------------------------------------------------------------- */
/*  Build partial page from extracted widgets                                 */
/* -------------------------------------------------------------------------- */

function buildPartialPage(
  basePage: IPageStructure,
  widgets: unknown[],
  zones: Record<string, unknown[]>
): IPageStructure {
  return {
    ...basePage,
    data: {
      ...basePage.data,
      content: widgets as IPageStructure["data"]["content"],
      root: basePage.data.root ?? { props: {} },
      zones: zones as IPageStructure["data"]["zones"],
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  OpenAI Streaming Vision                                                   */
/* -------------------------------------------------------------------------- */

interface OpenAiStreamChoice {
  delta?: { content?: string };
  finish_reason?: string | null;
}

/**
 * Stream an OpenAI vision call, yielding VisionStreamEvents as widgets are parsed.
 * Uses the same system prompt as the non-streaming variant.
 */
export async function* streamOpenAiVision(
  options: RunOpenAiVisionOptions
): AsyncGenerator<VisionStreamEvent> {
  const { page, imageBase64, imageMimeType, userMessage, apiKey, model = "gpt-4o" } = options;
  const systemPrompt = VISION_SYSTEM_PROMPT;

  const pageSnippet = JSON.stringify(page).slice(0, 3000);
  const userText = userMessage?.trim()
    ? `Additional context from user: ${userMessage}\n\nCurrent page JSON (for reference):\n${pageSnippet}`
    : `Current page JSON (for reference):\n${pageSnippet}`;

  const body = {
    model,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${imageMimeType};base64,${imageBase64}`,
              detail: "high" as const,
            },
          },
          { type: "text", text: userText },
        ],
      },
    ],
    max_completion_tokens: 16384,
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
    yield { type: "error", message: `OpenAI streaming vision failed: ${res.status} ${text.slice(0, 500)}` };
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    yield { type: "error", message: "No response body from OpenAI streaming" };
    return;
  }

  const decoder = new TextDecoder();
  let accumulated = "";
  let lastWidgetCount = 0;
  let lastZoneCount = 0;
  let descriptionSent = false;
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process SSE lines from OpenAI
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? ""; // Keep incomplete last line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data) as { choices?: OpenAiStreamChoice[] };
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            accumulated += delta;
          }
        } catch {
          // Skip malformed SSE lines
          continue;
        }
      }

      // Try to extract description
      if (!descriptionSent) {
        const desc = extractDescription(accumulated);
        if (desc) {
          descriptionSent = true;
          yield { type: "description", text: desc };
        }
      }

      // Try to extract new widgets
      const widgets = extractCompleteWidgets(accumulated);
      const zones = extractCompleteZones(accumulated);
      const zoneCount = Object.keys(zones).length;

      if (widgets.length > lastWidgetCount || zoneCount > lastZoneCount) {
        lastWidgetCount = widgets.length;
        lastZoneCount = zoneCount;
        const partialPage = buildPartialPage(page, widgets, zones);
        yield { type: "partial_page", page: partialPage };
      }
    }
  } finally {
    reader.releaseLock();
  }

  // Final parse: use the shared parseAndPostProcess for proper UUID assignment
  console.log("[stream-openai] ACCUMULATED raw length:", accumulated.length);
  console.log("[stream-openai] ACCUMULATED raw (first 1000):", accumulated.slice(0, 1000));
  console.log("[stream-openai] ACCUMULATED raw (last 1000):", accumulated.slice(-1000));
  try {
    const result = parseAndPostProcess(accumulated);
    const completePage = buildPartialPage(page, result.data.content, result.data.zones);
    const finalPage: IPageStructure = {
      ...completePage,
      widgets: [...(page.widgets ?? []), ...result.widgets],
    };
    console.log("[stream-openai] FINAL PAGE zone keys:", Object.keys(finalPage.data?.zones ?? {}));
    console.log("[stream-openai] FINAL PAGE widgets:", JSON.stringify(finalPage.widgets));
    yield { type: "complete", page: finalPage, result };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[stream-openai] PARSE FAILED:", msg);
    yield { type: "error", message: `Failed to parse final vision result: ${msg}` };
  }
}

/* -------------------------------------------------------------------------- */
/*  Claude / Anthropic Streaming Vision                                       */
/* -------------------------------------------------------------------------- */

/**
 * Stream a Claude vision call, yielding VisionStreamEvents as widgets are parsed.
 * Claude uses `stream: true` with SSE format: event types include content_block_delta.
 */
export async function* streamClaudeVision(
  options: RunClaudeVisionOptions
): AsyncGenerator<VisionStreamEvent> {
  const { page, imageBase64, imageMimeType, userMessage, apiKey, model = "claude-sonnet-4-20250514" } = options;
  const systemPrompt = VISION_SYSTEM_PROMPT;

  const pageSnippet = JSON.stringify(page).slice(0, 3000);
  const userText = userMessage?.trim()
    ? `Additional context from user: ${userMessage}\n\nCurrent page JSON (for reference):\n${pageSnippet}`
    : `Current page JSON (for reference):\n${pageSnippet}`;

  const body = {
    model,
    max_tokens: 16384,
    stream: true,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: imageMimeType,
              data: imageBase64,
            },
          },
          { type: "text", text: userText },
        ],
      },
    ],
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    yield { type: "error", message: `Claude streaming vision failed: ${res.status} ${text.slice(0, 500)}` };
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    yield { type: "error", message: "No response body from Claude streaming" };
    return;
  }

  const decoder = new TextDecoder();
  let accumulated = "";
  let lastWidgetCount = 0;
  let lastZoneCount = 0;
  let descriptionSent = false;
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process SSE lines from Claude
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);

        try {
          const parsed = JSON.parse(data) as {
            type?: string;
            delta?: { type?: string; text?: string };
          };
          // Claude streams content_block_delta events with text delta
          if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta" && parsed.delta.text) {
            accumulated += parsed.delta.text;
          }
        } catch {
          continue;
        }
      }

      // Try to extract description
      if (!descriptionSent) {
        const desc = extractDescription(accumulated);
        if (desc) {
          descriptionSent = true;
          yield { type: "description", text: desc };
        }
      }

      // Try to extract new widgets
      const widgets = extractCompleteWidgets(accumulated);
      const zones = extractCompleteZones(accumulated);
      const zoneCount = Object.keys(zones).length;

      if (widgets.length > lastWidgetCount || zoneCount > lastZoneCount) {
        lastWidgetCount = widgets.length;
        lastZoneCount = zoneCount;
        const partialPage = buildPartialPage(page, widgets, zones);
        yield { type: "partial_page", page: partialPage };
      }
    }
  } finally {
    reader.releaseLock();
  }

  // Final parse with UUID assignment
  console.log("[stream-claude] ACCUMULATED raw length:", accumulated.length);
  console.log("[stream-claude] ACCUMULATED raw (first 1000):", accumulated.slice(0, 1000));
  console.log("[stream-claude] ACCUMULATED raw (last 1000):", accumulated.slice(-1000));
  try {
    const result = parseAndPostProcess(accumulated);
    const completePage = buildPartialPage(page, result.data.content, result.data.zones);
    const finalPage: IPageStructure = {
      ...completePage,
      widgets: [...(page.widgets ?? []), ...result.widgets],
    };
    console.log("[stream-claude] FINAL PAGE zone keys:", Object.keys(finalPage.data?.zones ?? {}));
    console.log("[stream-claude] FINAL PAGE widgets:", JSON.stringify(finalPage.widgets));
    yield { type: "complete", page: finalPage, result };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[stream-claude] PARSE FAILED:", msg);
    yield { type: "error", message: `Failed to parse final vision result: ${msg}` };
  }
}
