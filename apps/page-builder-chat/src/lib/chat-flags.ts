/**
 * OpenAI chat (cloud). See .env.example.
 * - false | 0 | off | no  → Do not call OpenAI.
 * - true | 1 | on  | yes  → Allow OpenAI when OPENAI_API_KEY is set.
 * - unset (auto)          → Allow OpenAI only if OPENAI_API_KEY is set.
 */
export function isPageBuilderChatAiEnabled(): boolean {
  const v = process.env.PAGE_BUILDER_CHAT_AI_ENABLED?.trim().toLowerCase();
  if (v === "false" || v === "0" || v === "off" || v === "no") {
    return false;
  }
  if (v === "true" || v === "1" || v === "on" || v === "yes") {
    return true;
  }
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

/**
 * UI / welcome copy only. The API always runs local plain-text patterns first when they match
 * (instant); only non-matching messages use Ollama/OpenAI. When false, the chat page still shows
 * plain-text as "off" in the header.
 */
export function isPlainTextCommandsEnabled(): boolean {
  const v = process.env.PAGE_BUILDER_CHAT_PLAIN_TEXT?.trim().toLowerCase();
  if (v === "false" || v === "0" || v === "off" || v === "no") {
    return false;
  }
  return true;
}

/**
 * Which LLM handles chat after plain-text (if any).
 * - **auto** (default): Ollama first if `PAGE_BUILDER_CHAT_OLLAMA_URL` is set; on failure fall back to OpenAI if enabled.
 * - **ollama**: Ollama only when URL is set; no OpenAI fallback.
 * - **openai**: OpenAI only; Ollama is skipped even if configured.
 */
export type PageBuilderChatLlmProvider = "auto" | "ollama" | "openai";

export function getLlmProviderPreference(): PageBuilderChatLlmProvider {
  const v = process.env.PAGE_BUILDER_CHAT_LLM_PROVIDER?.trim().toLowerCase();
  if (v === "openai" || v === "ollama" || v === "auto") {
    return v;
  }
  return "auto";
}

/** Self-hosted Ollama (optional). No OpenAI key required. */
export function getOllamaConfig(): { url: string; model: string } | null {
  const url = process.env.PAGE_BUILDER_CHAT_OLLAMA_URL?.trim() || process.env.OLLAMA_HOST?.trim();
  if (!url) {
    return null;
  }
  const model = process.env.PAGE_BUILDER_CHAT_OLLAMA_MODEL?.trim() || "llama3.2";
  return { url: url.replace(/\/$/, ""), model };
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const n = parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Ollama `options.num_gpu` — 0 = CPU only (use when GPU offload crashes the runner). Unset = Ollama default. */
function parseOptionalOllamaNumGpu(raw: string | undefined): number | undefined {
  if (raw === undefined || raw.trim() === "") {
    return undefined;
  }
  const n = parseInt(raw.trim(), 10);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/**
 * Tuning for /api/chat to reduce runner crashes (OOM / "llama runner process has terminated").
 * See .env.example — PAGE_BUILDER_CHAT_OLLAMA_FORMAT_JSON, PAGE_CHARS, NUM_CTX, NUM_PREDICT.
 */
export function getOllamaRequestTuning(): {
  pageJsonMaxChars: number;
  formatJson: boolean;
  numCtx: number;
  numPredict: number;
  numGpu: number | undefined;
} {
  const pageJsonMaxChars = parsePositiveInt(process.env.PAGE_BUILDER_CHAT_OLLAMA_PAGE_CHARS, 3000);
  const fj = process.env.PAGE_BUILDER_CHAT_OLLAMA_FORMAT_JSON?.trim().toLowerCase();
  const formatJson = fj === "true" || fj === "1" || fj === "on" || fj === "yes";
  /** Headroom: prompt + num_predict must fit in num_ctx or runners often terminate with HTTP 500. */
  const numCtx = parsePositiveInt(process.env.PAGE_BUILDER_CHAT_OLLAMA_NUM_CTX, 8192);
  const numPredict = parsePositiveInt(process.env.PAGE_BUILDER_CHAT_OLLAMA_NUM_PREDICT, 1024);
  const numGpu = parseOptionalOllamaNumGpu(process.env.PAGE_BUILDER_CHAT_OLLAMA_NUM_GPU);
  return { pageJsonMaxChars, formatJson, numCtx, numPredict, numGpu };
}

export function isOpenAiChatReady(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim()) && isPageBuilderChatAiEnabled();
}

export function isChatPanelEnabled(): boolean {
  return isPlainTextCommandsEnabled() || getOllamaConfig() !== null || isOpenAiChatReady();
}
