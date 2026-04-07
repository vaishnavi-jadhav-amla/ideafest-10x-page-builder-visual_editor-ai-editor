/**
 * SSE streaming endpoint for vision (image-to-page) requests.
 * Streams partial page updates as the LLM generates widgets,
 * so the page editor can show live progressive rendering.
 */
import {
  streamOpenAiVision,
  streamClaudeVision,
  type VisionStreamEvent,
} from "@znode/agents/page-builder-config/vision-commands-stream";
import {
  formatCmsWidgetSuggestions,
} from "@znode/agents/page-builder-config/vision-commands";
import type { IPageStructure } from "@znode/types/visual-editor";
import { NextRequest } from "next/server";

import {
  getLlmProviderPreference,
  getOllamaConfig,
  isPageBuilderChatAiEnabled,
} from "../../../lib/chat-flags";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface StreamRequestBody {
  page: IPageStructure;
  imageBase64: string;
  imageMimeType: string;
  message?: string;
}

function sseEncode(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  let body: StreamRequestBody;
  try {
    body = (await req.json()) as StreamRequestBody;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (!body.imageBase64?.trim() || !body.imageMimeType?.trim()) {
    return new Response("imageBase64 and imageMimeType are required", { status: 400 });
  }

  if (!body.page || typeof body.page !== "object") {
    return new Response("page is required", { status: 400 });
  }

  const llmPref = getLlmProviderPreference();
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const claudeApiKey = process.env.ANTHROPIC_API_KEY?.trim();

  const useOpenAi =
    (llmPref === "openai" || llmPref === "auto") &&
    isPageBuilderChatAiEnabled() &&
    Boolean(apiKey);
  const useClaude =
    (llmPref === "claude" || llmPref === "auto") &&
    Boolean(claudeApiKey);

  // Pick the streaming provider (Claude preferred for streaming quality, then OpenAI)
  let streamGenerator: AsyncGenerator<VisionStreamEvent> | null = null;

  if (useClaude && claudeApiKey) {
    streamGenerator = streamClaudeVision({
      page: body.page,
      imageBase64: body.imageBase64,
      imageMimeType: body.imageMimeType,
      userMessage: body.message,
      apiKey: claudeApiKey,
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",
    });
  } else if (useOpenAi && apiKey) {
    streamGenerator = streamOpenAiVision({
      page: body.page,
      imageBase64: body.imageBase64,
      imageMimeType: body.imageMimeType,
      userMessage: body.message,
      apiKey,
      model: process.env.OPENAI_MODEL ?? "gpt-4o",
    });
  }

  if (!streamGenerator) {
    return new Response(
      JSON.stringify({
        error:
          "No streaming vision AI engine available. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();
  const generator = streamGenerator;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of generator) {
          switch (event.type) {
            case "description":
              controller.enqueue(
                encoder.encode(sseEncode("description", { text: event.text }))
              );
              break;

            case "partial_page":
              controller.enqueue(
                encoder.encode(sseEncode("partial_page", { page: event.page }))
              );
              break;

            case "complete": {
              const assistantContent =
                event.result.description +
                formatCmsWidgetSuggestions(event.result.cmsWidgetSuggestions);
              console.log("[chat-stream] COMPLETE event — page zone keys:", Object.keys(event.page?.data?.zones ?? {}));
              console.log("[chat-stream] COMPLETE event — page widgets:", JSON.stringify(event.page?.widgets));
              console.log("[chat-stream] COMPLETE event — cmsWidgetSuggestions:", JSON.stringify(event.result.cmsWidgetSuggestions));
              // Log the widget types in each zone
              for (const [zk, zv] of Object.entries(event.page?.data?.zones ?? {})) {
                const types = (zv as { type?: string }[]).map((w: { type?: string }) => w.type);
                console.log(`[chat-stream] COMPLETE — zone "${zk}" widget types:`, types);
              }
              controller.enqueue(
                encoder.encode(
                  sseEncode("complete", {
                    page: event.page,
                    assistantContent,
                    cmsWidgetSuggestions: event.result.cmsWidgetSuggestions,
                    applied: event.result.data.content.length,
                  })
                )
              );
              break;
            }

            case "error":
              controller.enqueue(
                encoder.encode(sseEncode("error", { message: event.message }))
              );
              break;
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        controller.enqueue(
          encoder.encode(sseEncode("error", { message: msg }))
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
