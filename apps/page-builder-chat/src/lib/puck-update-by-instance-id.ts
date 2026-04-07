import type { IPageStructure } from "@znode/types/visual-editor";

import type { PageBuilderCommandTarget } from "@znode/agents/page-builder-config/commands";

type PuckTreeItem = { type?: string; props?: unknown };

type PageContentRoot = { content?: unknown };

function isPuckContentArray(value: unknown): value is PuckTreeItem[] {
  if (!Array.isArray(value) || value.length === 0) {
    return false;
  }
  return value.every(
    (item) => item !== null && typeof item === "object" && "type" in item && "props" in item
  );
}

function puckItemId(item: PuckTreeItem): string | undefined {
  const p = item.props;
  if (p && typeof p === "object" && !Array.isArray(p)) {
    const id = (p as Record<string, unknown>).id;
    if (typeof id === "string" && id.trim()) {
      return id.trim();
    }
  }
  return undefined;
}

function idsMatch(a: string, b: string): boolean {
  return a === b || a.toLowerCase() === b.toLowerCase();
}

function searchContent(
  content: unknown,
  componentId: string,
  target: PageBuilderCommandTarget
): { target: PageBuilderCommandTarget; type: string; props: Record<string, unknown> } | null {
  if (!isPuckContentArray(content)) {
    return null;
  }
  for (const item of content) {
    const id = puckItemId(item);
    if (id && idsMatch(id, componentId) && typeof item.type === "string") {
      const props =
        item.props && typeof item.props === "object" && !Array.isArray(item.props)
          ? (item.props as Record<string, unknown>)
          : {};
      return { target, type: item.type, props };
    }
    const p = item.props;
    if (p && typeof p === "object" && !Array.isArray(p)) {
      for (const v of Object.values(p as Record<string, unknown>)) {
        if (isPuckContentArray(v)) {
          const inner = searchContent(v, componentId, target);
          if (inner) {
            return inner;
          }
        }
      }
    }
  }
  return null;
}

function walkForFirstLinkPanel(
  content: unknown,
  target: PageBuilderCommandTarget
): { target: PageBuilderCommandTarget; componentId: string } | null {
  if (!isPuckContentArray(content)) {
    return null;
  }
  for (const item of content) {
    if (item.type === "LinkPanel") {
      const id = puckItemId(item);
      if (id) {
        return { target, componentId: id };
      }
    }
    const p = item.props;
    if (p && typeof p === "object") {
      for (const v of Object.values(p as Record<string, unknown>)) {
        const inner = walkForFirstLinkPanel(v, target);
        if (inner) {
          return inner;
        }
      }
    }
  }
  return null;
}

/** First `LinkPanel` in main → header → footer (for applying CMS `WidgetsKey` to page JSON). */
export function findFirstLinkPanelOnPage(
  page: IPageStructure
): { target: PageBuilderCommandTarget; componentId: string } | null {
  return (
    walkForFirstLinkPanel(page.data?.content, "main") ??
    walkForFirstLinkPanel(page.headerData?.content, "header") ??
    walkForFirstLinkPanel(page.footerData?.content, "footer") ??
    null
  );
}

/** Locate a Puck block by `props.id` in main, header, or footer content trees. */
export function findPuckComponentById(
  page: IPageStructure,
  componentId: string
): { target: PageBuilderCommandTarget; type: string; props: Record<string, unknown> } | null {
  const id = componentId.trim();
  if (!id) {
    return null;
  }
  return (
    searchContent(page.data?.content, id, "main") ??
    searchContent(page.headerData?.content, id, "header") ??
    searchContent(page.footerData?.content, id, "footer") ??
    null
  );
}

import { fuzzyActionVerb, fuzzyAlignVerb, fuzzyMatchWord, fuzzyPropKeyword } from "./fuzzy-match";

const HEADING_SIZE = new Set(["xxxl", "xxl", "xl", "l", "m", "s", "xs", "default"]);
const TEXT_SIZE = new Set(["s", "m"]);
const TEXT_WEIGHT_LIST = ["normal", "semibold", "bold", "extrabold"] as const;
const ALIGN_VALUES = ["left", "center", "right", "centre"] as const;

function isWidgetMergeExcludedId(componentId: string): boolean {
  return /^(ProductsCarousel|BannerSlider)-/i.test(componentId);
}

export type ComponentPropChange =
  | { prop: "color"; componentId: string; value: string }
  | { prop: "background"; componentId: string; value: string }
  | { prop: "align"; componentId: string; value: "left" | "center" | "right" }
  | { prop: "level"; componentId: string; value: string }
  | { prop: "size"; componentId: string; value: string }
  | { prop: "text"; componentId: string; value: string }
  | { prop: "weight"; componentId: string; value: string };

/**
 * Single fuzzy parser for all `<verb> <componentId> <property> to <value>` patterns,
 * including `align <id> to centre` and `set <id> to h3`.
 * Tolerates typos in the verb, property keyword, and common value aliases.
 */
export function parseComponentPropChange(message: string): ComponentPropChange | null {
  const t = message.trim().replace(/\s+/g, " ").replace(/\.\s*$/, "");
  if (!t) return null;

  const words = t.split(" ");
  if (words.length < 3) return null;

  let verbWord = words[0]!;
  let startIdx = 1;
  if (verbWord.toLowerCase() === "please" && words.length >= 4) {
    verbWord = words[1]!;
    startIdx = 2;
  }

  const alignVerb = fuzzyAlignVerb(verbWord);
  if (alignVerb && (alignVerb === "align" || alignVerb === "aline" || alignVerb === "allign")) {
    return parseAlignPattern(words, startIdx);
  }

  const verb = fuzzyActionVerb(verbWord);
  if (!verb) return null;

  const componentId = words[startIdx];
  if (!componentId || isWidgetMergeExcludedId(componentId)) return null;

  const rest = words.slice(startIdx + 1);
  if (rest.length < 2) return null;

  const hMatch = rest.join(" ").match(/^to\s+h([1-6])$/i);
  if (hMatch?.[1]) {
    return { prop: "level", componentId, value: hMatch[1] };
  }

  const levelToMatch = rest.join(" ").match(/^to\s+level\s+([1-6])$/i);
  if (levelToMatch?.[1]) {
    return { prop: "level", componentId, value: levelToMatch[1] };
  }

  const toIdx = rest.findIndex((w) => w.toLowerCase() === "to");
  if (toIdx < 0) return null;

  const propWords = rest.slice(0, toIdx).join(" ");
  const valueRaw = rest.slice(toIdx + 1).join(" ").replace(/^["']|["']$/g, "").trim();
  if (!propWords || !valueRaw) return null;

  const prop = fuzzyPropKeyword(propWords);
  if (!prop) return null;

  switch (prop) {
    case "color":
      return { prop: "color", componentId, value: valueRaw };
    case "background":
      return { prop: "background", componentId, value: valueRaw };
    case "align": {
      const av = fuzzyMatchWord(valueRaw.toLowerCase(), ALIGN_VALUES as unknown as string[], 2);
      if (!av) return null;
      const normalized = av === "centre" ? "center" : av;
      if (normalized !== "left" && normalized !== "center" && normalized !== "right") return null;
      return { prop: "align", componentId, value: normalized };
    }
    case "level": {
      const lm = valueRaw.match(/^h?([1-6])$/i);
      if (!lm?.[1]) return null;
      return { prop: "level", componentId, value: lm[1] };
    }
    case "size":
      return { prop: "size", componentId, value: valueRaw.toLowerCase() };
    case "text":
      return { prop: "text", componentId, value: valueRaw };
    case "weight": {
      const wm = fuzzyMatchWord(valueRaw.toLowerCase(), TEXT_WEIGHT_LIST as unknown as string[], 2);
      if (!wm) return null;
      return { prop: "weight", componentId, value: wm };
    }
    default:
      return null;
  }
}

function parseAlignPattern(words: string[], startIdx: number): ComponentPropChange | null {
  const componentId = words[startIdx];
  if (!componentId || isWidgetMergeExcludedId(componentId)) return null;
  const rest = words.slice(startIdx + 1);
  if (rest.length === 0) return null;
  let valWord: string;
  if (rest[0]!.toLowerCase() === "to" && rest.length >= 2) {
    valWord = rest.slice(1).join(" ");
  } else {
    valWord = rest.join(" ");
  }
  const av = fuzzyMatchWord(valWord.toLowerCase(), ALIGN_VALUES as unknown as string[], 2);
  if (!av) return null;
  const normalized = av === "centre" ? "center" : av;
  if (normalized !== "left" && normalized !== "center" && normalized !== "right") return null;
  return { prop: "align", componentId, value: normalized };
}

export function mergeSizePropsForPuckType(componentType: string, size: string): Record<string, unknown> | null {
  if (componentType === "Text") {
    return TEXT_SIZE.has(size) ? { size } : null;
  }
  if (componentType === "Heading") {
    return HEADING_SIZE.has(size) ? { size } : null;
  }
  return (HEADING_SIZE.has(size) || TEXT_SIZE.has(size)) ? { size } : null;
}

/** Heading → `textColor`; Text → semantic `color`. */
export function mergeColorPropsForPuckType(componentType: string, color: string): Record<string, unknown> {
  return componentType === "Text" ? { color } : { textColor: color };
}

/**
 * Parses: `Update ProductsCarousel-{uuid}` / `change BannerSlider-{uuid}` (verb + type + hyphen + UUID).
 */
export function parseUpdateWidgetByInstanceId(message: string): {
  componentType: "ProductsCarousel" | "BannerSlider";
  componentId: string;
} | null {
  const m = message.trim();
  const re =
    /\b(?:update|change|edit|refresh)\s+(ProductsCarousel|BannerSlider)-([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\b/i;
  const match = m.match(re);
  if (!match) {
    return null;
  }
  const kindRaw = match[1];
  const uuid = match[2].toLowerCase();
  const componentType =
    kindRaw.toLowerCase() === "bannerslider" ? "BannerSlider" : "ProductsCarousel";
  const componentId = `${componentType}-${uuid}`;
  return { componentType, componentId };
}

function collectBannerSliderComponentIdsFromContent(content: unknown, out: string[]): void {
  if (!isPuckContentArray(content)) {
    return;
  }
  for (const item of content) {
    if (item.type === "BannerSlider") {
      const id = puckItemId(item);
      if (id) {
        out.push(id);
      }
    }
    const p = item.props;
    if (p && typeof p === "object" && !Array.isArray(p)) {
      for (const v of Object.values(p as Record<string, unknown>)) {
        if (isPuckContentArray(v)) {
          collectBannerSliderComponentIdsFromContent(v, out);
        }
      }
    }
  }
}

/** Last `BannerSlider` `props.id` on the page (for "update slider banner" without an explicit id). */
export function findLastBannerSliderComponentIdOnPage(page: {
  data?: PageContentRoot;
  headerData?: PageContentRoot;
  footerData?: PageContentRoot;
}): string | null {
  const ids: string[] = [];
  collectBannerSliderComponentIdsFromContent(page.data?.content, ids);
  collectBannerSliderComponentIdsFromContent(page.headerData?.content, ids);
  collectBannerSliderComponentIdsFromContent(page.footerData?.content, ids);
  return ids.length > 0 ? ids[ids.length - 1]! : null;
}
