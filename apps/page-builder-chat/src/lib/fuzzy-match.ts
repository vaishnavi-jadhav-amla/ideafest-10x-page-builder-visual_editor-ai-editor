/**
 * Levenshtein distance + helpers for fuzzy command matching.
 * Shared across deterministic parsers so typos like "chnage", "backgroud", "algin" still resolve.
 */

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const row: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = row[0]!;
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = row[j]!;
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[n]!;
}

/**
 * Return the closest match from `candidates` whose Levenshtein distance to `input` is ≤ `maxDist`.
 * Ties broken by lowest distance then first in list.
 */
export function fuzzyMatchWord(input: string, candidates: readonly string[], maxDist = 2): string | null {
  const lower = input.toLowerCase();
  let best: string | null = null;
  let bestDist = maxDist + 1;
  for (const c of candidates) {
    const d = levenshtein(lower, c.toLowerCase());
    if (d < bestDist) {
      best = c;
      bestDist = d;
    }
  }
  return best;
}

const ACTION_VERBS = ["change", "update", "set", "make", "modify", "alter", "edit"] as const;
const ALIGN_VERBS = ["align", "aline", "allign"] as const;

export function fuzzyActionVerb(word: string): string | null {
  return fuzzyMatchWord(word, ACTION_VERBS, 2);
}

export function fuzzyAlignVerb(word: string): string | null {
  return fuzzyMatchWord(word, [...ALIGN_VERBS, ...ACTION_VERBS], 2);
}

const PROP_KEYWORDS: Record<string, string> = {
  color: "color",
  colour: "color",
  "text color": "color",
  "text colour": "color",
  "textcolor": "color",
  "textcolour": "color",
  background: "background",
  "background color": "background",
  "background colour": "background",
  "bgcolor": "background",
  align: "align",
  alignment: "align",
  level: "level",
  heading: "level",
  size: "size",
  text: "text",
  title: "text",
  content: "text",
  weight: "weight",
  "font weight": "weight",
  "font-weight": "weight",
};

const PROP_KEYS = Object.keys(PROP_KEYWORDS);

export function fuzzyPropKeyword(word: string): string | null {
  const lower = word.toLowerCase().trim();
  if (PROP_KEYWORDS[lower]) {
    return PROP_KEYWORDS[lower]!;
  }
  const matched = fuzzyMatchWord(lower, PROP_KEYS, 2);
  return matched ? PROP_KEYWORDS[matched]! : null;
}

const ADD_VERBS = ["add", "insert", "create", "put", "place", "include"] as const;
const UPDATE_VERBS = ["update", "change", "edit", "refresh", "modify"] as const;

export function fuzzyAddVerb(word: string): string | null {
  return fuzzyMatchWord(word, ADD_VERBS, 2);
}

export function fuzzyUpdateVerb(word: string): string | null {
  return fuzzyMatchWord(word, UPDATE_VERBS, 2);
}

/**
 * Fuzzy-match a multi-word widget name from user input after removing the verb.
 * Strips spaces and lowercases both sides before comparing.
 */
export function fuzzyWidgetName(
  tail: string,
  targets: readonly string[],
  maxDist = 3
): string | null {
  const norm = tail.replace(/\s+/g, "").toLowerCase();
  let best: string | null = null;
  let bestDist = maxDist + 1;
  for (const t of targets) {
    const tn = t.replace(/\s+/g, "").toLowerCase();
    if (Math.abs(norm.length - tn.length) > maxDist + 2) continue;
    const d = levenshtein(norm, tn);
    if (d < bestDist) {
      best = t;
      bestDist = d;
    }
  }
  return best;
}
