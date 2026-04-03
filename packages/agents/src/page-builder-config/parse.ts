import type { PageBuilderCommand } from "./commands";

function stripBom(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

/** Drop full lines whose first non-whitespace char is # */
function removeHashCommentLines(s: string): string {
  return s
    .split(/\r?\n/)
    .filter((line) => {
      const t = line.trimStart();
      return t.length === 0 || !t.startsWith("#");
    })
    .join("\n")
    .trim();
}

function normalizeToCommands(parsed: unknown): PageBuilderCommand[] {
  if (Array.isArray(parsed)) {
    return parsed as PageBuilderCommand[];
  }
  return [parsed as PageBuilderCommand];
}

/** Find index of matching `}` for object starting at `start` (must be `{`), respecting strings. */
function findClosingBrace(s: string, start: number): number {
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === "\\" && inString) {
      escape = true;
      continue;
    }
    if (c === "\"") {
      inString = !inString;
      continue;
    }
    if (inString) {
      continue;
    }
    if (c === "{") {
      depth++;
    } else if (c === "}") {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Split `...{...}{...}...` into top-level JSON object slices (handles multi-line objects per block).
 */
function extractTopLevelJsonObjects(s: string): string[] {
  const str = s.trim();
  const out: string[] = [];
  let i = 0;
  while (i < str.length) {
    while (i < str.length && /\s/.test(str[i])) {
      i++;
    }
    if (i >= str.length) {
      break;
    }
    if (str[i] !== "{") {
      throw new Error(
        `Unexpected character at position ${i}: expected '{{' to start a command object. Near: ${str.slice(i, i + 60)}`
      );
    }
    const end = findClosingBrace(str, i);
    if (end < 0) {
      throw new Error("Unclosed '{' — check quotes and brackets in your JSON.");
    }
    out.push(str.slice(i, end + 1));
    i = end + 1;
  }
  while (i < str.length && /\s/.test(str[i])) {
    i++;
  }
  if (i < str.length) {
    throw new Error(`Unexpected text after last command (position ${i}): ${str.slice(i, i + 80).trim()}…`);
  }
  return out;
}

function parseLineByLineNdjson(trimmed: string): PageBuilderCommand[] {
  const lines = trimmed.split(/\r?\n/);
  const out: PageBuilderCommand[] = [];
  for (let li = 0; li < lines.length; li++) {
    const t = lines[li].trim();
    if (!t) {
      continue;
    }
    try {
      out.push(JSON.parse(t) as PageBuilderCommand);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(`Line ${li + 1}: ${msg} — content: ${t.slice(0, 100)}${t.length > 100 ? "…" : ""}`);
    }
  }
  return out;
}

/**
 * Parse a JSON array of commands, newline-delimited JSON (one object per line),
 * or multiple `{...}` blocks in one string (NDJSON with multi-line objects).
 * Lines starting with # are ignored.
 */
export function parsePageBuilderCommands(input: string): PageBuilderCommand[] {
  const trimmed = removeHashCommentLines(stripBom(input)).trim();
  if (!trimmed) {
    return [];
  }

  const first = trimmed[0];

  if (first === "[") {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      return normalizeToCommands(parsed);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(`Invalid JSON array: ${msg}`);
    }
  }

  if (first === "{") {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      return normalizeToCommands(parsed);
    } catch {
      /* Not a single JSON value — e.g. NDJSON `{...}\n{...}` which triggers
       * "Unexpected non-whitespace character after JSON at position …" */
    }
    try {
      const chunks = extractTopLevelJsonObjects(trimmed);
      if (chunks.length === 0) {
        return [];
      }
      return chunks.map((chunk, i) => {
        try {
          return JSON.parse(chunk) as PageBuilderCommand;
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          throw new Error(`Command block ${i + 1}: ${msg}`);
        }
      });
    } catch (e) {
      if (e instanceof Error && e.message.includes("Unexpected character at position")) {
        throw e;
      }
      if (e instanceof Error && e.message.includes("Unexpected text after")) {
        throw e;
      }
      if (e instanceof Error && e.message.includes("Unclosed")) {
        throw e;
      }
      try {
        return parseLineByLineNdjson(trimmed);
      } catch (lineErr) {
        const primary = e instanceof Error ? e.message : String(e);
        const secondary = lineErr instanceof Error ? lineErr.message : String(lineErr);
        throw new Error(`Could not parse commands. ${primary} | Fallback line parse: ${secondary}`);
      }
    }
  }

  return parseLineByLineNdjson(trimmed);
}
