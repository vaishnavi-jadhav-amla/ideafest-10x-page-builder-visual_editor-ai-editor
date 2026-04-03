import type { IPageStructure } from "@znode/types/visual-editor";

/** Kept short so prompt + page + num_predict fit under num_ctx (overflow can crash the Ollama runner). */
const SYSTEM = `Page builder assistant. Reply with ONLY one JSON object (no markdown): {"commands":[...]}
Kinds (snake_case): set_page_key, merge_root_props, clear_content, append_component, remove_component, merge_component_props, replace_zones. target: main|header|footer (merge/remove on main canvas may omit target; server uses main).
Visible copy: append_component Heading, Text, ButtonGroup (PascalCase), target main. If the user asks for BOTH a heading and body text, output TWO append_component entries in order: Heading first, then Text.
**Home Page Promo** / **homepage promo** (misspellings e.g. hompage, hoem page, pormo): do NOT output Heading or Text for that. Output {"commands":[]} only — the host retries with a server shortcut when the list is empty.
If the user names an existing block id (e.g. Heading-…-uuid or Heading-<timestamp>-<shortId>) to change style/alignment/color/size: use merge_component_props ONLY — never append_component (append creates a NEW block).
Example edit: {"commands":[{"kind":"merge_component_props","target":"main","componentId":"Heading-…","props":{"align":"center","textColor":"red","level":"4"}}]}
New block example: {"commands":[{"kind":"append_component","target":"main","componentType":"Heading","props":{"align":"left","text":"Hello","size":"l","background":"transparent","textColor":"black","level":"2"}}]}`;

export interface RunOllamaPageCommandsOptions {
  page: IPageStructure;
  userRequest: string;
  baseUrl: string;
  model: string;
  /** Max chars of stringified page JSON (smaller = less VRAM / KV cache). Default 3000. */
  pageJsonMaxChars?: number;
  /**
   * Ollama `format: "json"` — can crash some runners; we parse JSON from plain output too.
   * Default false when not passed (callers should pass from env).
   */
  formatJson?: boolean;
  /** Ollama options.num_ctx — must fit prompt + num_predict (default 8192). */
  numCtx?: number;
  /** Ollama options.num_predict — max tokens in the reply (default 1024). */
  numPredict?: number;
  /** Ollama options.num_gpu — 0 forces CPU-only (helps when GPU offload crashes the runner). */
  numGpu?: number;
}

/** Models often wrap JSON in markdown fences or extra prose; strip and parse the object. */
function parseCommandsJson(content: string): { commands?: unknown } {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed) as { commands?: unknown };
  } catch {
    const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence?.[1]?.trim()) {
      return JSON.parse(fence[1].trim()) as { commands?: unknown };
    }
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1)) as { commands?: unknown };
    }
    throw new Error("Could not find valid JSON object in model output");
  }
}

/**
 * Uses a local Ollama server (/api/chat) to produce {"commands":[...]} — no OpenAI key.
 * Set PAGE_BUILDER_CHAT_OLLAMA_URL (e.g. http://127.0.0.1:11434) and optionally PAGE_BUILDER_CHAT_OLLAMA_MODEL.
 */
export async function runOllamaPageCommands({
  page,
  userRequest,
  baseUrl,
  model,
  pageJsonMaxChars = 3000,
  formatJson = false,
  /** Must exceed prompt tokens + num_predict or Ollama can crash mid-run. */
  numCtx = 8192,
  numPredict = 1024,
  numGpu,
}: RunOllamaPageCommandsOptions): Promise<unknown[]> {
  const pageSnippet = JSON.stringify(page).slice(0, pageJsonMaxChars);
  const user = `Current page JSON:\n${pageSnippet}\n\nUser request:\n${userRequest}`;

  const buildChatPayload = (gpu: number | undefined) => {
    const options: Record<string, number> = {
      num_ctx: numCtx,
      num_predict: numPredict,
    };
    if (gpu !== undefined) {
      options.num_gpu = gpu;
    }
    const payload: Record<string, unknown> = {
      model,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user },
      ],
      stream: false,
      options,
    };
    if (formatJson) {
      payload.format = "json";
    }
    return payload;
  };

  const base = baseUrl.replace(/\/$/, "");

  const postChat = async (gpu: number | undefined) =>
    fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildChatPayload(gpu)),
    });

  /** Same semantics as chat; `/api/generate` often survives when `/api/chat` OOMs on GPU with large context. */
  const postGenerate = async (gpu: number | undefined) => {
    const options: Record<string, number> = {
      num_ctx: numCtx,
      num_predict: numPredict,
    };
    if (gpu !== undefined) {
      options.num_gpu = gpu;
    }
    const prompt = `${SYSTEM}\n\n---\n\n${user}`;
    return fetch(`${base}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options,
      }),
    });
  };

  let res = await postChat(numGpu);
  let lastErr = "";
  if (!res.ok) {
    const status = res.status;
    lastErr = await res.text();
    if (numGpu === undefined && status >= 500) {
      res = await postChat(0);
      if (!res.ok) {
        lastErr = await res.text();
      }
    }
  }

  if (!res.ok) {
    res = await postGenerate(numGpu ?? 0);
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Ollama HTTP ${res.status}: ${(lastErr || t).slice(0, 500)}`);
    }
    const genData = (await res.json()) as { response?: string };
    const genContent = genData.response;
    if (!genContent || typeof genContent !== "string") {
      throw new Error("Ollama /api/generate returned no response string");
    }
    return finishParse(genContent, userRequest);
  }

  const data = (await res.json()) as { message?: { content?: string } };
  const content = data.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Ollama returned no message.content");
  }

  return finishParse(content, userRequest);
}

function finishParse(content: string, userRequest: string): unknown[] {

  let parsed: { commands?: unknown };
  try {
    parsed = parseCommandsJson(content);
  } catch (e) {
    throw new Error(`Ollama JSON parse failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  if (!parsed.commands || !Array.isArray(parsed.commands)) {
    throw new Error("Ollama JSON must include a \"commands\" array");
  }

  const mapped = parsed.commands.map(rewriteMergeRootTitleToHeadingAppend);
  const supplemented = supplementCommandsWhenModelReturnsOnlyFirstStep(userRequest, mapped);
  return rewriteAppendToMergeWhenUserTargetedExistingBlock(userRequest, supplemented);
}

/** Puck-style ids: UUID (Puck) or plain-text widget ids (Type-<timestamp>-<random>). */
const PUCK_BLOCK_ID_RE =
  /\b([A-Za-z][A-Za-z0-9]*-(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|\d{10,}-[a-z0-9]+))\b/i;

function extractExplicitPuckBlockIdFromUserMessage(s: string): string | null {
  const m = s.match(PUCK_BLOCK_ID_RE);
  return m?.[1]?.trim() ?? null;
}

function userMessageSuggestsUpdatingExistingBlock(s: string): boolean {
  return (
    /\b(change|update|edit|modify|alignment|align|centre|center|colour|color|style|size|background)\b/i.test(
      s
    ) ||
    /\bfor\s+id\b/i.test(s) ||
    /\bid\s*=/i.test(s)
  );
}

/**
 * Small models often emit append_component when the user asked to restyle an existing block by id.
 * Rewrite to merge_component_props so the canvas updates in place.
 */
function rewriteAppendToMergeWhenUserTargetedExistingBlock(
  userRequest: string,
  commands: unknown[]
): unknown[] {
  const blockId = extractExplicitPuckBlockIdFromUserMessage(userRequest);
  if (!blockId || !userMessageSuggestsUpdatingExistingBlock(userRequest) || commands.length !== 1) {
    return commands;
  }
  const cmd = commands[0];
  if (!isPlainObject(cmd)) {
    return commands;
  }
  const kindNorm = String(cmd.kind ?? "")
    .replace(/_/g, "")
    .toLowerCase();
  if (kindNorm !== "appendcomponent") {
    return commands;
  }
  const props = isPlainObject(cmd.props) ? { ...cmd.props } : {};
  delete props.id;
  return [
    {
      kind: "merge_component_props",
      target: "main",
      componentId: blockId,
      props,
    },
  ];
}

/**
 * Small local models often return only the first append_component. If the user clearly asked for
 * both a heading/title and body text, add the missing command from the natural-language request.
 */
function supplementCommandsWhenModelReturnsOnlyFirstStep(userRequest: string, commands: unknown[]): unknown[] {
  if (commands.length !== 1) {
    return commands;
  }
  const first = commands[0];
  /** Whole-line quoted pair — most reliable when models only return the first widget */
  const pair = extractHeadingAndBodyQuotedPair(userRequest);
  if (pair && isAppendComponentKind(first, "Heading")) {
    return [first, makeTextAppendCommand(pair.body || " ")];
  }
  if (pair && isAppendComponentKind(first, "Text")) {
    return [makeHeadingAppendCommand(pair.heading || "Heading"), first];
  }
  const textHeading = extractAddTextAndHeadingQuotedPair(userRequest);
  if (textHeading) {
    if (isAppendComponentKind(first, "Text")) {
      return [makeHeadingAppendCommand(textHeading.heading), first];
    }
    if (isAppendComponentKind(first, "Heading")) {
      return [first, makeTextAppendCommand(textHeading.text)];
    }
  }
  const headingText = extractHeadingPhraseFromUser(userRequest);
  const bodyText = extractBodyTextPhraseFromUser(userRequest);
  if (!bodyText && !headingText) {
    return commands;
  }
  if (isAppendComponentKind(first, "Heading") && bodyText) {
    return [first, makeTextAppendCommand(bodyText)];
  }
  if (isAppendComponentKind(first, "Text") && headingText) {
    return [makeHeadingAppendCommand(headingText), first];
  }
  return commands;
}

/** Matches: set heading as "A" and text as "B" (double- or single-quoted) */
function extractHeadingAndBodyQuotedPair(userRequest: string): { heading: string; body: string } | null {
  const s = userRequest.trim();
  const dq = s.match(/^(?:set\s+)?heading\s+as\s+"([^"]*)"\s+and\s+text\s+as\s+"([^"]*)"\s*$/i);
  if (dq?.[1] !== undefined && dq[2] !== undefined) {
    return { heading: dq[1].trim(), body: dq[2].trim() };
  }
  const sq = s.match(/^(?:set\s+)?heading\s+as\s+'([^']*)'\s+and\s+text\s+as\s+'([^']*)'\s*$/i);
  if (sq?.[1] !== undefined && sq[2] !== undefined) {
    return { heading: sq[1].trim(), body: sq[2].trim() };
  }
  return null;
}

/**
 * "add text \"…\" and heading \"…\"" (and heading+text swap). Fills in the missing widget when the model
 * returns only one append_component.
 */
function extractAddTextAndHeadingQuotedPair(userRequest: string): { heading: string; text: string } | null {
  const s = userRequest.trim();
  let m = s.match(/\badd\s+text\s+"([^"]*)"\s+and\s+heading\s+"([^"]*)"/i);
  if (m?.[1] !== undefined && m[2] !== undefined) {
    return { text: m[1].trim(), heading: m[2].trim() };
  }
  m = s.match(/\badd\s+text\s+'([^']*)'\s+and\s+heading\s+'([^']*)'/i);
  if (m?.[1] !== undefined && m[2] !== undefined) {
    return { text: m[1].trim(), heading: m[2].trim() };
  }
  m = s.match(/\badd\s+heading\s+"([^"]*)"\s+and\s+text\s+"([^"]*)"/i);
  if (m?.[1] !== undefined && m[2] !== undefined) {
    return { heading: m[1].trim(), text: m[2].trim() };
  }
  m = s.match(/\badd\s+heading\s+'([^']*)'\s+and\s+text\s+'([^']*)'/i);
  if (m?.[1] !== undefined && m[2] !== undefined) {
    return { heading: m[1].trim(), text: m[2].trim() };
  }
  m = s.match(/\btext\s+"([^"]*)"\s+and\s+heading\s+"([^"]*)"/i);
  if (m?.[1] !== undefined && m[2] !== undefined) {
    return { text: m[1].trim(), heading: m[2].trim() };
  }
  m = s.match(/\bheading\s+"([^"]*)"\s+and\s+text\s+"([^"]*)"/i);
  if (m?.[1] !== undefined && m[2] !== undefined) {
    return { heading: m[1].trim(), text: m[2].trim() };
  }
  return null;
}

function isAppendComponentKind(cmd: unknown, componentType: string): boolean {
  if (!isPlainObject(cmd)) {
    return false;
  }
  const kind = String(cmd.kind ?? "").replace(/_/g, "");
  if (kind.toLowerCase() !== "appendcomponent") {
    return false;
  }
  const ct = String(cmd.componentType ?? "");
  return ct === componentType || ct.toLowerCase() === componentType.toLowerCase();
}

function makeHeadingAppendCommand(text: string): Record<string, unknown> {
  return {
    kind: "append_component",
    target: "main",
    componentType: "Heading",
    props: {
      align: "left",
      text,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      padding: { top: "0", right: "0", bottom: "0", left: "0" },
      border: { width: "0", color: "black", style: "solid", borderRadius: 0 },
      size: "l",
      background: "transparent",
      textColor: "black",
      level: "2",
    },
  };
}

function makeTextAppendCommand(text: string): Record<string, unknown> {
  return {
    kind: "append_component",
    target: "main",
    componentType: "Text",
    props: {
      align: "left",
      text,
      padding: { top: "0", right: "0", bottom: "0", left: "0" },
      size: "m",
      color: "default",
      weight: "normal",
    },
  };
}

/** Pull heading/title string from prose like: set heading as "foo" … and text as "bar" */
function extractHeadingPhraseFromUser(userRequest: string): string | null {
  const s = userRequest.trim();
  const patterns: RegExp[] = [
    /\b(?:set\s+)?(?:heading|headline)\s+as\s+"([^"]+)"/i,
    /\b(?:set\s+)?(?:heading|headline)\s+as\s+'([^']+)'/i,
    /\btitle\s+as\s+"([^"]+)"/i,
    /\btitle\s+as\s+'([^']+)'/i,
    /\b(?:heading|headline|title)\s+is\s+"([^"]+)"/i,
    /\bheading\s+"([^"]+)"/i,
    /\bheading\s+'([^']+)'/i,
  ];
  for (const p of patterns) {
    const m = s.match(p);
    if (m?.[1]?.trim()) {
      return m[1].trim();
    }
  }
  const unquoted = s.match(/\b(?:set\s+)?(?:heading|headline)\s+as\s+(.+?)(?=\s+and\s+(?:text|paragraph)\b)/i);
  if (unquoted?.[1]?.trim()) {
    return unquoted[1].trim().replace(/^["']|["']$/g, "");
  }
  return null;
}

/** Pull body copy from prose like: … and text as "long string here" */
function extractBodyTextPhraseFromUser(userRequest: string): string | null {
  const s = userRequest.trim();
  const patterns: RegExp[] = [
    /\badd\s+text\s+"([^"]+)"/i,
    /\badd\s+text\s+'([^']+)'/i,
    /\band\s+text\s+as\s+"([^"]+)"/i,
    /\band\s+text\s+as\s+'([^']+)'/i,
    /\btext\s+as\s+"([^"]+)"/i,
    /\btext\s+as\s+'([^']+)'/i,
    /\bparagraph\s+as\s+"([^"]+)"/i,
  ];
  for (const p of patterns) {
    const m = s.match(p);
    if (m?.[1]?.trim()) {
      return m[1].trim();
    }
  }
  return null;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

/**
 * Models often emit merge_root_props with only { title } for "set page title". In this codebase,
 * visible copy should live in data.content (Heading/Text), not root.props — matches saved home.json shape.
 */
function isMergeRootPropsKind(kind: unknown): boolean {
  if (typeof kind !== "string") {
    return false;
  }
  const k = kind.trim();
  return k === "merge_root_props" || k === "mergeRootProps";
}

function rewriteMergeRootTitleToHeadingAppend(cmd: unknown): unknown {
  if (!isPlainObject(cmd) || !isMergeRootPropsKind(cmd.kind)) {
    return cmd;
  }
  const target = typeof cmd.target === "string" ? cmd.target.trim().toLowerCase() : "";
  if (target !== "main") {
    return cmd;
  }
  const props = cmd.props;
  if (!isPlainObject(props)) {
    return cmd;
  }
  const keys = Object.keys(props);
  if (keys.length !== 1 || keys[0] !== "title") {
    return cmd;
  }
  const title = props.title;
  if (typeof title !== "string" || !title.trim()) {
    return cmd;
  }
  return {
    kind: "append_component",
    target: "main",
    componentType: "Heading",
    props: {
      align: "left",
      text: title.trim(),
      size: "l",
      background: "transparent",
      textColor: "black",
      level: "2",
    },
  };
}
